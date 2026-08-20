import { useEffect, useRef, useState } from 'react';
import { clampWritableArea } from '@/lib/letterhead';

type Area = {
    top: number;
    left: number;
    width: number;
    height: number;
};

type Handle = 'move' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export function WritableArea({
    area,
    onChange,
    onCommit,
}: {
    area: Area;
    onChange: (area: Area) => void;
    onCommit: (area: Area) => void;
}) {
    const frameRef = useRef<HTMLDivElement>(null);
    const areaRef = useRef(area);
    const [dragging, setDragging] = useState<Handle | null>(null);

    useEffect(() => {
        areaRef.current = area;
    }, [area]);

    useEffect(() => {
        if (!dragging) {
            return;
        }

        const handle = dragging;

        function onMove(event: PointerEvent): void {
            const frame = frameRef.current;

            if (!frame) {
                return;
            }

            const rect = frame.getBoundingClientRect();
            const dx = (event.movementX / rect.width) * 100;
            const dy = (event.movementY / rect.height) * 100;
            const current = areaRef.current;
            let next = { ...current };

            if (handle === 'move') {
                next.left += dx;
                next.top += dy;
            } else {
                if (handle.includes('e')) {
                    next.width += dx;
                }

                if (handle.includes('s')) {
                    next.height += dy;
                }

                if (handle.includes('w')) {
                    next.left += dx;
                    next.width -= dx;
                }

                if (handle.includes('n')) {
                    next.top += dy;
                    next.height -= dy;
                }
            }

            next = clampWritableArea(next);
            areaRef.current = next;
            onChange(next);
        }

        function onUp(): void {
            setDragging(null);
            onCommit(clampWritableArea(areaRef.current));
        }

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);

        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
    }, [dragging, onChange, onCommit]);

    const handles: { id: Handle; className: string }[] = [
        {
            id: 'n',
            className:
                'left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize',
        },
        {
            id: 's',
            className:
                'bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 cursor-ns-resize',
        },
        {
            id: 'e',
            className:
                'top-1/2 right-0 h-2.5 w-2.5 translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
        },
        {
            id: 'w',
            className:
                'top-1/2 left-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
        },
        {
            id: 'ne',
            className:
                'top-0 right-0 h-2.5 w-2.5 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
        },
        {
            id: 'nw',
            className:
                'top-0 left-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
        },
        {
            id: 'se',
            className:
                'right-0 bottom-0 h-2.5 w-2.5 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
        },
        {
            id: 'sw',
            className:
                'bottom-0 left-0 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
        },
    ];

    return (
        <div ref={frameRef} className="absolute inset-0">
            <div
                className="absolute cursor-move border-2 border-sky-500 bg-sky-500/10"
                style={{
                    top: `${area.top}%`,
                    left: `${area.left}%`,
                    width: `${area.width}%`,
                    height: `${area.height}%`,
                }}
                onPointerDown={(event) => {
                    event.preventDefault();
                    setDragging('move');
                }}
            >
                <p className="pointer-events-none px-1.5 py-1 text-[9px] font-medium text-sky-800">
                    Report body
                </p>
                {handles.map((handle) => (
                    <button
                        key={handle.id}
                        type="button"
                        aria-label={`Resize ${handle.id}`}
                        className={`absolute rounded-full border border-sky-600 bg-white ${handle.className}`}
                        onPointerDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setDragging(handle.id);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
