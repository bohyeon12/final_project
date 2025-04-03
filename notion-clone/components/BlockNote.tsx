import { getDefaultReactSlashMenuItems } from "@blocknote/react";
import { defaultBlockSpecs, filterSuggestionItems } from "@blocknote/core";
import stringToColor from "@/lib/stringToColor";
import { BlockNoteSchema } from "@blocknote/core";
import { useEffect, useState, useRef } from "react";
import { SuggestionMenuController, useCreateBlockNote } from "@blocknote/react";
import * as Y from "yjs";
import { useRoom, useSelf } from "@liveblocks/react";
import { YouTubeBlock } from "./YouTubeBlock";
import { ImageBlock } from "./ImageBlock";
import { BlockNoteView } from "@blocknote/shadcn";
import { deleteImage, handleImageUpload } from "@/actions/actions";

type EditorProps = {
  doc: Y.Doc;
  provider: any;
  darkMode: boolean;
  isDrawingEnabled?: boolean;
  strokeColor: string;
  strokeWidth: number;
  youtubeUrlForInsert?: string | null;
  onYoutubeInserted?: () => void;
};

type DrawingState = {
  isDrawing: boolean;
  startX: number;
  startY: number;
};

type Stroke = {
  points: { x: number; y: number }[];
  color: string;
  width: number;
};

function BlockNote({
  doc,
  provider,
  darkMode,
  isDrawingEnabled,
  strokeColor,
  strokeWidth,
  youtubeUrlForInsert,
  onYoutubeInserted,
}: EditorProps) {
  const userInfo = useSelf((me) => me.info);
  const room = useRoom();
  const editor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: userInfo?.name || userInfo?.email || "Anonymous",
        color: stringToColor(userInfo?.email || "default@email.com"),
      },
    },
    schema: BlockNoteSchema.create({
      blockSpecs: {
        ...defaultBlockSpecs,
        youtube: YouTubeBlock,
        image: ImageBlock,
      },
    }),
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesArray = doc.getArray<Stroke>("drawings");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    editor._tiptapEditor.on("transaction", ({ editor }) => {
      const removedBlocks = editor.getJSON().content?.filter(
        (block) => block.type === "live-image" && block.attrs?.url
      );
      removedBlocks?.forEach((block) => {
        deleteImage(block.id);
      });
    });

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    strokesArray.observe(() => {
      redrawCanvas();
    });

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [strokesArray]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokesArray.forEach((stroke: Stroke) => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  };

  const [drawing, setDrawing] = useState<DrawingState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
  });

  const [currentStroke, setCurrentStroke] = useState<{ points: { x: number; y: number }[] }>({
    points: [],
  });

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setCurrentStroke({ points: [point] });
    setDrawing({ isDrawing: true, startX: point.x, startY: point.y });
  };

  const draw = (e: React.MouseEvent) => {
    if (!drawing.isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.moveTo(drawing.startX, drawing.startY);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    setDrawing({ ...drawing, startX: point.x, startY: point.y });
    setCurrentStroke((prev) => ({
      points: [...prev.points, point],
    }));
  };

  const stopDrawing = () => {
    if (currentStroke.points.length > 0) {
      strokesArray.push([
        {
          points: currentStroke.points,
          color: strokeColor,
          width: strokeWidth,
        },
      ]);
    }
    setCurrentStroke({ points: [] });
    setDrawing({ ...drawing, isDrawing: false });
  };

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          let width = img.width;
          let height = img.height;
          const maxSize = 800;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL("image/jpeg", 0.7);
          resolve(base64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const hasInserted = useRef(false);

  useEffect(() => {
    if (
      youtubeUrlForInsert &&
      editor &&
      onYoutubeInserted &&
      !hasInserted.current
    ) {
      const timeout = setTimeout(() => {
        editor.insertBlocks(
          [
            {
              type: "youtube",
              props: { url: youtubeUrlForInsert },
            },
          ],
          editor.getTextCursorPosition().block,
          "after"
        );
        hasInserted.current = true;
        onYoutubeInserted(); 
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [youtubeUrlForInsert, editor, onYoutubeInserted]);

  
  return (
    <div className="relative max-w-6xl mx-auto">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-10 ${isDrawingEnabled ? "pointer-events-auto" : "pointer-events-none"}`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <BlockNoteView
        editor={editor}
        className="min-h-screen"
        theme={darkMode ? "dark" : "light"}
        slashMenu={false}
      >
        <SuggestionMenuController
          key={editor.getTextCursorPosition().block.id}
          triggerCharacter={"/"}
          getItems={async (query) => {
            const defaultItems = getDefaultReactSlashMenuItems(editor);

            const youtubeItem = {
              title: "YouTube",
              onItemClick: () => {
                const url = prompt("Enter YouTube URL:");
                if (url) {
                  editor.insertBlocks(
                    [
                      {
                        type: "youtube",
                        props: { url },
                      },
                    ],
                    editor.getTextCursorPosition().block,
                    "after"
                  );
                }
              },
            };

            const imageItem = {
              title: "Image",
              onItemClick: async () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";

                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;

                  const blockId = crypto.randomUUID();
                  try {
                    const result = await handleImageUpload(file, room.id, blockId);

                    if (result) {
                      editor.insertBlocks(
                        [
                          {
                            type: "image",
                            props: {
                              imageUrl: result,
                              blockId: blockId,
                            },
                          },
                        ],
                        editor.getTextCursorPosition().block,
                        "after"
                      );
                    }
                  } catch (error) {
                    console.error("Error uploading image:", error);
                    alert("Failed to upload image. Please try again.");
                  }
                };

                input.click();
              },
            };

            return filterSuggestionItems([...defaultItems, youtubeItem, imageItem], query);
          }}
        />
      </BlockNoteView>
    </div>
  );
}

export default BlockNote;
