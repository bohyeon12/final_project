import { createReactBlockSpec, useBlockNoteEditor } from "@blocknote/react";
import { useState, useEffect } from "react";

// Create the YouTube block component
export const YouTubeBlock = createReactBlockSpec(
  {
    type: "youtube",
    propSchema: {
      url: { default: "" },
    },
    content: "inline",
    onResize: true,
    draggable: true,
  },
  {
    render: ({ block }) => {
        const [isResizing, setIsResizing] = useState(false);
        const [startX, setStartX] = useState(0);
        const [startWidth, setStartWidth] = useState(0);
        const [width, setWidth] = useState(640);
        const [height, setHeight] = useState(360);

        const handleResizeStart = (e: React.MouseEvent) => {
            setIsResizing(true);
            setStartX(e.clientX);
            setStartWidth(width);
        };

        const handleResizeMove = (e: MouseEvent) => {
            if (!isResizing) return;
            
            const diff = e.clientX - startX;
            const newWidth = Math.max(320, Math.min(1280, startWidth + diff));
            const newHeight = Math.round((newWidth * 9) / 16); // Maintain 16:9 aspect ratio

            setWidth(newWidth);
            setHeight(newHeight);
        };

        const handleResizeEnd = () => {
            setIsResizing(false);
        };

        useEffect(() => {
            if (isResizing) {
                window.addEventListener('mousemove', handleResizeMove);
                window.addEventListener('mouseup', handleResizeEnd);
            }
            return () => {
                window.removeEventListener('mousemove', handleResizeMove);
                window.removeEventListener('mouseup', handleResizeEnd);
            };
        }, [isResizing, startX, startWidth]);

        const getYoutubeEmbedUrl = (url: string) => {
            try {
                // Handle different YouTube URL formats
                const patterns = [
                    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^"&?\/\s]{11})/i,
                    /youtube\.com\/shorts\/([^"&?\/\s]{11})/i,
                ];

                for (const pattern of patterns) {
                    const match = url.match(pattern);
                    if (match && match[1]) {
                        return `https://www.youtube.com/embed/${match[1]}`;
                    }
                }
                return null;
            } catch (error) {
                console.error("Error parsing YouTube URL:", error);
                return null;
            }
        };

        const embedUrl = getYoutubeEmbedUrl(block.props.url);
        
        if (!embedUrl) {
            return (
                <div className="p-4 bg-red-50 text-red-700 rounded-md">
                    Invalid YouTube URL. Please enter a valid YouTube URL.
                </div>
            );
        }

        return (
            <div className="relative" style={{ width }}>
                <div className="relative" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={embedUrl}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube video player"
                    />
                </div>
                <div 
                    className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-se-resize rounded-full opacity-100 hover:opacity-100 transition-opacity"
                    onMouseDown={handleResizeStart}
                />
            </div>
        );
    },
  }
);