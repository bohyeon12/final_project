"use client";

import { useRoom } from "@liveblocks/react/suspense";
import { useEffect, useState, useRef, SetStateAction } from "react";
import * as Y from "yjs";
import {LiveblocksYjsProvider} from "@liveblocks/yjs"
import { MoonIcon, SunIcon, PencilIcon, EraserIcon, UndoIcon } from "lucide-react";
import { Button } from "./ui/button";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { Slider } from "./ui/slider";
import BlockNote from "./BlockNote";

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
