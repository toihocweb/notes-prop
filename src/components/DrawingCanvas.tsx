'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getStroke } from 'perfect-freehand';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

// Helper to convert getStroke points to SVG path
function getSvgPathFromStroke(stroke: number[][]) {
    if (!stroke.length) return "";

    const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;
        },
        ["M", ...stroke[0], "Q"]
    );

    d.push("Z");
    return d.join(" ");
}

interface Stroke {
    points: number[][];
    color: string;
}

interface DrawingCanvasProps {
    isDrawing: boolean;
    color: string;
    initialLines: Stroke[];
    onUpdate: (lines: Stroke[]) => void;
}

export function DrawingCanvas({ isDrawing, color, initialLines, onUpdate }: DrawingCanvasProps) {
    const [points, setPoints] = useState<number[][]>([]);
    const [strokes, setStrokes] = useState<Stroke[]>(initialLines || []);
    const svgRef = useRef<SVGSVGElement>(null);

    // Sync from props if external change happens
    useEffect(() => {
        if (JSON.stringify(initialLines) !== JSON.stringify(strokes)) {
            // Normalize legacy data if needed (if initialLines can be number[][][])
            // But for now let's assume parent passes correct type or we cast it
            const normalized = (initialLines || []).map(line => {
                if (Array.isArray(line)) {
                    // Legacy recovery
                    return { points: line, color: '#000000' } as Stroke;
                }
                return line;
            });
            setStrokes(normalized);
        }
    }, [initialLines]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);

        // Calculate input position relative to the SVG
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const point = [x, y, e.pressure];
        setPoints([point]);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDrawing || points.length === 0) return;
        if (e.buttons !== 1) return;
        e.preventDefault();

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const point = [x, y, e.pressure];
        setPoints([...points, point]);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDrawing || points.length === 0) return;
        e.preventDefault();

        // Store color with the stroke points: [x, y, pressure, color]? 
        // Or change data structure?
        // The implementation plan said: "Update lines attribute to store objects: { points: number[][], color: string }."
        // But here `strokes` is `number[][][]`.
        // I need to change the `strokes` state type to `any[]` or `Stroke[]` to match the plan.

        // Let's check NoteEditor.tsx again. It parses `note.drawing`.
        // If I change the structure here, I need to make sure `NoteEditor` handles it in `onUpdate`.
        // The previous implementation in `DrawingCanvas` (before I failed to apply edits) was using `Stroke` interface.

        // I will stick to the plan: define `Stroke` interface locally or import it.
        // Let's redefine `strokes` state first in a separate step if needed. 
        // But for now, let's look at how I can modify this file.

        // Wait, the current file has `strokes` as `number[][][]`. 
        // This means my previous "successful" edit to `DrawingCanvas` (Step 514? No that was NoteEditor) 
        // Actually I never successfully applied the `Stroke` interface change to `DrawingCanvas.tsx`? 
        // Let's check the file content again.
        // Step 607 shows `strokes` is `number[][][]`.
        // So I missed the step to change the data structure in `DrawingCanvas`!

        // I need to update the state definition and the interface.

        const newStroke = { points, color };
        const newStrokes = [...strokes, newStroke];
        // @ts-ignore - temporary untyped usage until I fix state type
        setStrokes(newStrokes);
        setPoints([]);
        // @ts-ignore
        onUpdate(newStrokes);
    };

    const clear = () => {
        setStrokes([]);
        onUpdate([]);
    };

    const strokeOptions = {
        size: 3,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
    };

    return (
        <div
            className={`absolute inset-0 z-10 pointer-events-none ${isDrawing ? 'cursor-crosshair' : ''}`}
        >
            {/* Only capture pointer events when in drawing mode */}
            <svg
                ref={svgRef}
                className={`w-full h-full ${isDrawing ? 'pointer-events-auto' : 'pointer-events-none'}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{ touchAction: 'none' }}
            >
                {strokes.map((stroke, index) => {
                    // Normalize in render if state has mixed types (shouldn't happen with useEffect fix, but safe)
                    const points = Array.isArray(stroke) ? stroke : stroke.points;
                    const strokeColor = Array.isArray(stroke) ? '#000000' : stroke.color;

                    return (
                        <path
                            key={index}
                            d={getSvgPathFromStroke(getStroke(points, strokeOptions))}
                            fill={strokeColor}
                            style={{ fill: strokeColor }}
                        />
                    );
                })}
                {points.length > 0 && (
                    <path
                        d={getSvgPathFromStroke(getStroke(points, strokeOptions))}
                        fill={color}
                        className="opacity-50"
                    />
                )}
            </svg>
        </div>
    );
}
