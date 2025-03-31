"use client";

import { useRoom } from "@liveblocks/react/suspense";
import { useEffect, useState, useRef, SetStateAction } from "react";
import * as Y from "yjs";
import {LiveblocksYjsProvider} from "@liveblocks/yjs"
import { MoonIcon, SunIcon, PencilIcon, EraserIcon, UndoIcon } from "lucide-react";
import { Button } from "./ui/button";
import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteSchema, filterSuggestionItems, defaultBlockSpecs } from "@blocknote/core";
import { SuggestionMenuController, useCreateBlockNote, getDefaultReactSlashMenuItems } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useSelf } from "@liveblocks/react";
import stringToColor from "@/lib/stringToColor";
import { YouTubeBlock } from "./YouTubeBlock";
import { Slider } from "./ui/slider";

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

    

    // Predefined colors
    const colors = [
        '#000000', // black
        '#ffffff', // white
        '#ff0000', // red
        '#00ff00', // green
        '#0000ff', // blue
        '#ffff00', // yellow
        '#ff00ff', // magenta
        '#00ffff', // cyan
    ];

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

function Editor() {
    const room= useRoom();
    const [doc, setDoc] = useState<Y.Doc>();
    const [provider, setProvider] = useState<LiveblocksYjsProvider>();
    const [darkMode, setDarkMode] = useState(false);
    const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
    const [strokeColor, setStrokeColor] = useState(darkMode ? '#ffffff' : '#000000');
    const [strokeWidth, setStrokeWidth] = useState(2);

    
    useEffect(() => {
        const yDoc = new Y.Doc();
        const yProvider = new LiveblocksYjsProvider(room,yDoc);
        setDoc(yDoc);
        setProvider(yProvider);
    }, [room]);

  if (!doc || !provider) {
    return null;
  }

  const style = `hover:text-white ${
    darkMode
      ? "text-gray-300 bg-gray-700 hover:bg-gray-100 hover:text-gray-700"
      : "text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-gray-700"
  }`;

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
                                {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00'].map((color) => (
                                    <button
                                        key={color}
                                        className={`w-6 h-6 rounded-full border-2 ${
                                            strokeColor === color ? 'border-blue-500' : 'border-gray-300'
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
                                const drawings = doc?.getArray('drawings');
                                if (drawings.length > 0) {
                                    drawings.delete(drawings.length - 1, 1);
                                }
                            }}
                        >
                            <UndoIcon className="w-4 h-4" />
                        </Button>
                        <Button
                            className={style}
                            onClick={() => doc?.getArray('drawings').delete(0, doc.getArray('drawings').length)}
                        >
                            Clear
                        </Button>
                    </>
                )}
            </div>

            {/* Theme toggle */}
            <Button className={style} onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <SunIcon/> : <MoonIcon/>}
            </Button>
        </div>

        <BlockNote 
            doc={doc} 
            provider={provider} 
            darkMode={darkMode} 
            isDrawingEnabled={isDrawingEnabled}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
        />
    </div>
  );
}

export default Editor;
