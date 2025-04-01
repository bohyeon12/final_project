<<<<<<< HEAD
=======
"use client";

>>>>>>> c350f983adaabd5b47b386329954a82136268f6f
import { useRoom } from "@liveblocks/react/suspense";
import { useEffect, useState } from "react";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
<<<<<<< HEAD
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteSchema, filterSuggestionItems, defaultBlockSpecs } from "@blocknote/core";
import { SuggestionMenuController, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useSelf } from "@liveblocks/react";
import stringToColor from "@/lib/stringToColor";
import { YouTubeBlock } from "./YouTubeBlock"; // 기존 YoutubeBlock 컴포넌트
import { YoutubeTimestamp } from "./YoutubeTimestamp"; // 새로 만든 YoutubeTimestamp 컴포넌트
import { getDefaultReactSlashMenuItems } from "@blocknote/react";

type EditorProps = {
  doc: Y.Doc;
  provider: any;
  darkMode: boolean;
};

function BlockNote({ doc, provider, darkMode }: EditorProps) {
  const userInfo = useSelf((me) => me.info);
  const editor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: userInfo?.name || "Anonymous",
        color: stringToColor(userInfo?.email || "default@email.com"),
      },
    },
    schema: BlockNoteSchema.create({
      blockSpecs: {
        ...defaultBlockSpecs,
        youtube: YouTubeBlock, // 기존 YoutubeBlock 유지
        youtubetimestamp: YoutubeTimestamp, // 새로운 YoutubeTimestamp 추가
      },
    }),
  });

  return (
    <div className="relative max-w-6xl mx-auto">
      <BlockNoteView
        editor={editor}
        className="min-h-screen"
        theme={darkMode ? "dark" : "light"}
        slashMenu={false} // 기본 슬래시 메뉴 비활성화
      >
        <SuggestionMenuController
  triggerCharacter={"/"} // 슬래시 메뉴의 트리거 문자
  getItems={async (query) => {
    const defaultItems = getDefaultReactSlashMenuItems(editor);

    // YouTube 블록 추가 항목
    const youtubeItem = {
      title: "YouTube",
      onItemClick: () => {
        const url = prompt("Enter YouTube URL:");
        if (url) {
          editor.insertBlocks(
            [
              {
                type: "youtube", // YouTube 블록 추가
                props: { url },
              },
            ],
            editor.getTextCursorPosition().block,
            "after"
          );
        }
      },
    };

    // YouTube Timestamp 블록 추가 항목
    const youtubeTimestampItem = {
      title: "YouTube Timestamp",
      onItemClick: () => {
        const url = prompt("불러올 URL을 입력하세요.");
        if (url) {
          editor.insertBlocks(
            [
              {
                type: "youtubetimestamp", // YouTube 블록 추가
                props: { url }, // 타임스탬프 추가 기능을 포함한 URL
              },
            ],
            editor.getTextCursorPosition().block,
            "after"
          );
        }
      },
    };

    return filterSuggestionItems(
      [...defaultItems, youtubeItem, youtubeTimestampItem],
      query
    );
  }}
/>

      </BlockNoteView>
    </div>
  );
}
=======
import {
  MoonIcon,
  SunIcon,
  PencilIcon,
  EraserIcon,
  UndoIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { Slider } from "./ui/slider";
import BlockNote from "./BlockNote";
import { useSearchParams } from "next/navigation";
>>>>>>> c350f983adaabd5b47b386329954a82136268f6f

function Editor() {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<LiveblocksYjsProvider>();
  const [darkMode, setDarkMode] = useState(false);
<<<<<<< HEAD
=======
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [strokeColor, setStrokeColor] = useState(darkMode ? "#ffffff" : "#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);

  const searchParams = useSearchParams();
  const youtubeUrl = searchParams.get("youtube");
  const [youtubeInserted, setYoutubeInserted] = useState(false); // 중복 삽입 방지용
>>>>>>> c350f983adaabd5b47b386329954a82136268f6f

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);
  }, [room]);

<<<<<<< HEAD
  if (!doc || !provider) {
    return null;
  }

=======
>>>>>>> c350f983adaabd5b47b386329954a82136268f6f
  const style = `hover:text-white ${
    darkMode
      ? "text-gray-300 bg-gray-700 hover:bg-gray-100 hover:text-gray-700"
      : "text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-gray-700"
  }`;

<<<<<<< HEAD
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 justify-end mb-10">
=======
  if (!doc || !provider) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 justify-end mb-10">
        {/* Drawing controls */}
        <div className="flex items-center gap-4">
          <Button
            className={style}
            onClick={() => setIsDrawingEnabled(!isDrawingEnabled)}
          >
            {isDrawingEnabled ? <EraserIcon /> : <PencilIcon />}
          </Button>

          {isDrawingEnabled && (
            <>
              {/* Color picker */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                <div className="flex gap-1">
                  {[
                    "#000000",
                    "#ffffff",
                    "#ff0000",
                    "#00ff00",
                    "#0000ff",
                    "#ffff00",
                  ].map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border-2 ${
                        strokeColor === color
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setStrokeColor(color)}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-8 h-8"
                />
              </div>

              {/* Width slider */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg min-w-[150px]">
                <span className="text-sm">Width:</span>
                <Slider
                  value={[strokeWidth]}
                  onValueChange={(value) => setStrokeWidth(value[0])}
                  min={1}
                  max={20}
                  step={1}
                  className="w-24"
                />
                <span className="text-sm w-6">{strokeWidth}</span>
              </div>

              {/* Undo and Clear buttons */}
              <Button
                className={style}
                onClick={() => {
                  const drawings = doc?.getArray("drawings");
                  if (drawings.length > 0) {
                    drawings.delete(drawings.length - 1, 1);
                  }
                }}
              >
                <UndoIcon className="w-4 h-4" />
              </Button>
              <Button
                className={style}
                onClick={() =>
                  doc?.getArray("drawings").delete(0, doc.getArray("drawings").length)
                }
              >
                Clear
              </Button>
            </>
          )}
        </div>

        {/* Theme toggle */}
>>>>>>> c350f983adaabd5b47b386329954a82136268f6f
        <Button className={style} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>

<<<<<<< HEAD
      <BlockNote doc={doc} provider={provider} darkMode={darkMode} />
=======
      <BlockNote
        doc={doc}
        provider={provider}
        darkMode={darkMode}
        isDrawingEnabled={isDrawingEnabled}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        key={room.id}
        youtubeUrlForInsert={youtubeUrl && !youtubeInserted ? youtubeUrl : null}
        onYoutubeInserted={() => setYoutubeInserted(true)}
      />
>>>>>>> c350f983adaabd5b47b386329954a82136268f6f
    </div>
  );
}

export default Editor;
