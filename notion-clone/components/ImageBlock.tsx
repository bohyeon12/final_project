import { createReactBlockSpec } from "@blocknote/react";
import { useEffect, useRef, useState } from "react";

export const ImageBlock = createReactBlockSpec(
  {
    type: "image",
    propSchema: {
      imageUrl: { default: "" },
      blockId: { default: "" },
    },
    content: "none",
  },
  {
    render: ({ block }) => {
      const imageRef = useRef<HTMLImageElement>(null);
      const [isResizing, setIsResizing] = useState(false);
      const [startX, setStartX] = useState(0);
      const [startWidth, setStartWidth] = useState(0);
      const [width, setWidth] = useState(imageRef.current ? imageRef.current.width : 640);
      const [ratio, setRatio] = useState(9/16);

      const handleImageLoad = () => {
        if (imageRef.current) {
          const { naturalWidth, naturalHeight } = imageRef.current;
          setRatio(naturalHeight / naturalWidth);
          if(naturalWidth > 640) {
            setWidth(640);
          } else if(naturalHeight > 360){
            setWidth(360 / ratio);
          } else {
            setWidth(naturalWidth);
          }
        }
      };

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
        const newWidth = Math.max(160, Math.min(1280, startWidth + diff));
        const newHeight = Math.round(newWidth * ratio);
        if (newWidth > 1024) {
          setWidth(1024);
          //setHeight(1024 * ratio);
        } else {
          setWidth(newWidth);
          //setHeight(newHeight);
        }
      };

      const handleResizeEnd = () => {
        setIsResizing(false);
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
    }, [isResizing, startX, startWidth]);
    

      return (
        <div className="relative w-full" style={{ width}}>
          {block.props.imageUrl && (
            <img
              ref={imageRef}
              src={block.props.imageUrl}
              alt="Uploaded content"
              className="max-w-full h-auto"
              style={{ width }}
              onLoad={handleImageLoad}
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

