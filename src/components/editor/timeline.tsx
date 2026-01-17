import React, { useRef, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { TimelineThumbnails } from "./timeline-thumbnails";

export const Timeline = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const {
        videoDuration,
        currentTime,
        setCurrentTime,
        keys,
        addKey,
        removeKey,
        setKeys
    } = useEditorStore();

    const [intervalFPS, setIntervalFPS] = useState(1);

    // Dragging Logic
    const [draggingKey, setDraggingKey] = useState<{ original: number | null, current: number } | null>(null);

    const timeToPercent = (time: number) => (time / videoDuration) * 100;

    const handleTimelineClick = (e: React.MouseEvent) => {
        if (!containerRef.current || draggingKey) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const newTime = Math.max(0, Math.min(percentage * videoDuration, videoDuration));
        setCurrentTime(newTime);
    };

    const handleTimelineDoubleClick = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const time = Math.max(0, Math.min(percentage * videoDuration, videoDuration));

        // Check if close to existing key? (If so remove)
        const closeKey = keys.find(k => Math.abs(k - time) < (videoDuration * 0.02)); // 2% tolerance
        if (closeKey !== undefined) {
            removeKey(closeKey);
        } else {
            addKey(Number(time.toFixed(3)));
        }
    };

    const handleGenerateInterval = () => {
        if (videoDuration <= 0) return;
        const newKeys: number[] = [];
        const intervalSec = intervalFPS;
        for (let t = 0; t < videoDuration; t += intervalSec) {
            newKeys.push(Number(t.toFixed(3)));
        }
        setKeys(newKeys);
    };

    const handleClearKeys = () => setKeys([]);

    // Drag Key Handlers
    const handleDragStart = (e: React.MouseEvent, time: number) => {
        e.stopPropagation();
        setDraggingKey({ original: time, current: time });
    };

    const handleDragMove = (e: React.MouseEvent) => {
        if (!draggingKey || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        setDraggingKey({ ...draggingKey, current: percentage * videoDuration });
    };

    const handleDragEnd = () => {
        if (draggingKey) {
            if (draggingKey.original !== null) {
                removeKey(draggingKey.original);
            }
            addKey(Number(draggingKey.current.toFixed(3)));
            setDraggingKey(null);
        }
    };

    return (
        <div className="w-full flex flex-col gap-4 p-4 border-t bg-background z-10 select-none">

            {/* Controls */}
            <div className="flex items-center gap-4 justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Double-click timeline to add/remove keys. Drag keys to move.</span>
                </div>

                <div className="flex items-center gap-2">
                    <Label className="whitespace-nowrap">Interval (sec):</Label>
                    <Input
                        type="number"
                        value={intervalFPS}
                        onChange={e => setIntervalFPS(Number(e.target.value))}
                        className="w-16 h-8"
                        min={0.1}
                        step={0.1}
                    />
                    <Button size="sm" variant="outline" onClick={handleGenerateInterval}>
                        Set Interval
                    </Button>
                    <Button size="icon" variant="destructive" onClick={handleClearKeys}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Timeline Track */}
            <div
                className="relative h-20 bg-muted/40 rounded border cursor-pointer overflow-hidden group"
                ref={containerRef}
                onClick={handleTimelineClick}
                onDoubleClick={handleTimelineDoubleClick}
                onMouseMove={draggingKey ? handleDragMove : undefined}
                onMouseUp={draggingKey ? handleDragEnd : undefined}
                onMouseLeave={draggingKey ? handleDragEnd : undefined}
            >
                {/* Thumbnails */}
                <TimelineThumbnails />

                {/* Playhead */}
                <div
                    className="absolute top-0 bottom-0 bg-red-500 w-0.5 z-20 pointer-events-none"
                    style={{ left: `${timeToPercent(currentTime)}%` }}
                >
                    <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-sm" />
                </div>

                {/* Keys */}
                {keys.map((time) => (
                    <div
                        key={time}
                        className={cn(
                            "absolute top-0 bottom-0 -translate-x-1/2 w-1 bg-yellow-400 z-10 hover:w-2 transition-all cursor-grab active:cursor-grabbing hover:bg-yellow-300",
                            draggingKey?.original === time && "opacity-50"
                        )}
                        style={{ left: `${timeToPercent(time)}%` }}
                        onMouseDown={(e) => handleDragStart(e, time)}
                        onClick={(e) => e.stopPropagation()} // Prevent seek trigger
                        title={`Keyframe at ${time}s`}
                    >
                        <div className="absolute top-0 w-3 h-3 bg-yellow-500 -translate-x-1/3 rounded-b-sm border shadow-sm" />
                    </div>
                ))}

                {/* Dragging Preview */}
                {draggingKey && (
                    <div
                        className="absolute top-0 bottom-0 -translate-x-1/2 w-1 bg-blue-500 z-30"
                        style={{ left: `${timeToPercent(draggingKey.current)}%` }}
                    />
                )}
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
                <span>0s</span>
                <span>{videoDuration.toFixed(1)}s</span>
            </div>
        </div>
    );
};
