
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils'; // Assuming this exists based on other files

const ResizableImageComponent = (props: any) => {
    const { node, updateAttributes, selected } = props;
    const [width, setWidth] = useState(node.attrs.width || '100%');
    const [isResizing, setIsResizing] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

    useEffect(() => {
        setWidth(node.attrs.width || '100%');
    }, [node.attrs.width]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (!imageRef.current) return;

        setIsResizing(true);
        resizeRef.current = {
            startX: e.clientX,
            startWidth: imageRef.current.offsetWidth,
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!resizeRef.current) return;
            const diff = e.clientX - resizeRef.current.startX;
            const newWidth = Math.max(100, resizeRef.current.startWidth + diff);
            // Limit max width to container is tricky without ref, but CSS max-w-full handles visual.
            // We set pixel width.
            setWidth(`${newWidth}px`);
        };

        const onMouseUp = () => {
            setIsResizing(false);
            if (resizeRef.current && imageRef.current) {
                // Finalize update
                const currentWidth = imageRef.current.offsetWidth;
                updateAttributes({ width: `${currentWidth}px` });
            }
            resizeRef.current = null;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [updateAttributes]);

    return (
        <NodeViewWrapper className="relative inline-block max-w-full">
            <div className={cn("relative group transition-all", selected || isResizing ? "" : "")}>
                {/* Image */}
                <img
                    ref={imageRef}
                    src={node.attrs.src}
                    alt={node.attrs.alt}
                    title={node.attrs.title}
                    style={{ width: width }}
                    className={cn(
                        "rounded-lg shadow-sm transition-opacity",
                        isResizing ? "opacity-80" : "opacity-100"
                    )}
                />

                {/* Resize Handle */}
                <div
                    className={cn(
                        "absolute right-2 bottom-2 w-3 h-3 bg-amber-500 border-2 border-white rounded-full cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10",
                        (selected || isResizing) && "opacity-100"
                    )}
                    onMouseDown={handleMouseDown}
                />

                {/* Overlay for selection visualization (optional) */}
                {(selected || isResizing) && <div className="absolute inset-0 bg-blue-500/0 pointer-events-none rounded-lg" />}
            </div>
        </NodeViewWrapper>
    );
};

export const ResizableImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: '100%',
                renderHTML: attributes => ({
                    width: attributes.width,
                    style: `width: ${attributes.width}`,
                }),
                parseHTML: element => element.style.width || element.getAttribute('width'),
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageComponent);
    },
});
