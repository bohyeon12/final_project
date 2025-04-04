import { getImageWidth, updateImageWidth } from "@/actions/actions";
import { createReactBlockSpec } from "@blocknote/react";
import { useEffect, useRef, useState } from "react";


export const ImageBlock = createReactBlockSpec(
  {
    type: "image",
    propSchema: {
      imageUrl: { default: "" },
      blockId: { default: "" },
      roomId: { default: "" },
    },
    content: "none",
  },
  {
    render: ({ block }) => {
      const imageRef = useRef<HTMLImageElement>(null);
      const [isResizing, setIsResizing] = useState(false);
      const [startX, setStartX] = useState(0);
      const [startWidth, setStartWidth] = useState(0);
      const [width, setWidth] = useState(640); // Default width

      // Load the width from Firebase when the component mounts
      useEffect(() => {
        const loadWidth = async () => {
          const storedWidth = await getImageWidth(block.props.roomId, block.props.blockId);
          if (storedWidth) {
            setWidth(storedWidth);
          }
        };
        loadWidth();
      }, [block.props.roomId, block.props.blockId]);

      const handleResizeStart = (e: React.MouseEvent) => {
        setIsResizing(true);
        setStartX(e.clientX);
        if (imageRef.current) {
          setStartWidth(imageRef.current.offsetWidth);
        }
      };

      const handleResizeMove = (e: MouseEvent) => {
        if (!isResizing || !imageRef.current) return;
        
        const diff = e.clientX - startX;
        const newWidth = Math.max(160, Math.min(1024, startWidth + diff));
        setWidth(newWidth);
      };

      const handleResizeEnd = async () => {
        setIsResizing(false);
        // Save the new width to Firebase
        await updateImageWidth(block.props.roomId, block.props.blockId, width);
      };

      useEffect(() => {
        if (isResizing && imageRef.current) {
          window.addEventListener('mousemove', handleResizeMove);
          window.addEventListener('mouseup', handleResizeEnd);
        }

        return () => {
          window.removeEventListener('mousemove', handleResizeMove);
          window.removeEventListener('mouseup', handleResizeEnd);
        };
      }, [isResizing, startX, startWidth, width]);
    

      return (
        <div className="relative w-full" style={{ width }}>
          {block.props.imageUrl && (
            <img
              ref={imageRef}
              src={block.props.imageUrl}
              alt="Uploaded content"
              className="max-w-full h-auto"
              style={{ width }}
            />
          )}
          <div 
              className="absolute right-0 top-0 bottom-0 w-1 bg-gray-300 opacity-0 group-hover:opacity-100 cursor-ew-resize"
              onMouseDown={handleResizeStart}
          />
        </div>
      );
    },
  }
);

