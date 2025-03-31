import { getDefaultReactSlashMenuItems } from "@blocknote/react";
import { defaultBlockSpecs, filterSuggestionItems } from "@blocknote/core";
import stringToColor from "@/lib/stringToColor";
import { BlockNoteSchema } from "@blocknote/core";
import { useEffect, useState } from "react";
import { SuggestionMenuController, useCreateBlockNote } from "@blocknote/react";
import * as Y from "yjs";

import { useSelf } from "@liveblocks/react";
import { YouTubeBlock } from "./YouTubeBlock";
import { useRef } from "react";
import { BlockNoteView } from "@blocknote/shadcn";
import { ImageBlock } from "./ImageBlock";
type EditorProps = {
    doc: Y.Doc;
    provider: any;
    darkMode: boolean;
    isDrawingEnabled?: boolean;
    strokeColor: string;
    strokeWidth: number;
}

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
  
function BlockNote({doc, provider, darkMode, isDrawingEnabled, strokeColor, strokeWidth} : EditorProps){
    const userInfo = useSelf((me) => me.info);
    const editor = useCreateBlockNote({
        collaboration: {
            provider,
            fragment : doc.getXmlFragment("document-store"),
            user : {
                name: userInfo?.name || userInfo?.email ||"Anonymous",
                color: stringToColor(userInfo?.email || "default@email.com"),
            },
        },
        schema: BlockNoteSchema.create({
            blockSpecs: {
                ...defaultBlockSpecs,
                youtube: YouTubeBlock,
                image: ImageBlock,
            }
        }),
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const strokesArray = doc.getArray<Stroke>('drawings');
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match parent container
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
            // Redraw all strokes after resize
            redrawCanvas();
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Listen for changes in the YJS array
        strokesArray.observe(() => {
            redrawCanvas();
        });

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [strokesArray]);

    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw all strokes
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

    const [currentStroke, setCurrentStroke] = useState<{points: {x: number; y: number}[]}>({
        points: []
    });

    const startDrawing = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        setCurrentStroke({
            points: [point]
        });

        setDrawing({
            isDrawing: true,
            startX: point.x,
            startY: point.y,
        });
    };

    const draw = (e: React.MouseEvent) => {
        if (!drawing.isDrawing) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        // Draw the line with current settings
        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.moveTo(drawing.startX, drawing.startY);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();

        // Update state
        setDrawing({
            ...drawing,
            startX: point.x,
            startY: point.y,
        });

        setCurrentStroke(prev => ({
            points: [...prev.points, point]
        }));
    };

    const stopDrawing = () => {
        if (currentStroke.points.length > 0) {
            strokesArray.push([{
                points: currentStroke.points,
                color: strokeColor,
                width: strokeWidth
            }]);
        }
        
        setCurrentStroke({ points: [] });
        setDrawing({ ...drawing, isDrawing: false });
    };

    return (
        <div className="relative max-w-6xl mx-auto">
            <canvas
                ref={canvasRef}
                className={`absolute inset-0 z-10 ${
                    isDrawingEnabled ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />
            <BlockNoteView 
            editor={editor}
            className="min-h-screen"
            theme={darkMode ? "dark" : "light"}
            slashMenu={false} // Disable the default slash menu
            >
            <SuggestionMenuController
                triggerCharacter={"/"} // Trigger character for the slash menu
                getItems={async (query) => {
                const defaultItems = getDefaultReactSlashMenuItems(editor);
                const youtubeItem = {
                    title: "YouTube",
                    onItemClick: () => {
                    const url = prompt("Enter YouTube URL:");
                    if (url) {
                        editor.insertBlocks(
                        [{
                            type: "youtube",
                            props: { url },
                        },],
                        editor.getTextCursorPosition().block,
                        "after"
                        );
                    }
                    },
                };
                
                return filterSuggestionItems([...defaultItems, youtubeItem], query);
                }}
            />
            </BlockNoteView>
        </div>
    );
}

export default BlockNote;