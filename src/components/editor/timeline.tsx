import React, { useRef, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, FastForward, Trash2 } from "lucide-react";
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
        setKeys,
        isPlaying,
        setIsPlaying,
        previewMode,
        setPreviewMode
    } = useEditorStore();

    const [intervalFPS, setIntervalFPS] = useState(1);

    // Dragging Logic
    const [selectedKeys, setSelectedKeys] = useState<Set<number>>(new Set());

    // Dragging Logic
    const [draggingKey, setDraggingKey] = useState<{ original: number | null, current: number } | null>(null);

    const timeToPercent = (time: number) => (time / videoDuration) * 100;

    const handleTimelineClick = (e: React.MouseEvent) => {
        if (!containerRef.current || draggingKey) return;

        // Clear selection if clicking empty space (unless modifier held)
        if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
            setSelectedKeys(new Set());
        }

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
            // Also remove from selection if present
            const newSel = new Set(selectedKeys);
            newSel.delete(closeKey);
            setSelectedKeys(newSel);
        } else {
            addKey(Number(time.toFixed(3)));
        }
    };

    const handleKeyClick = (e: React.MouseEvent, time: number) => {
        e.stopPropagation(); // Prevent timeline seek/clear

        const newSel = new Set(selectedKeys);
        if (e.shiftKey || e.metaKey || e.ctrlKey) {
            if (newSel.has(time)) newSel.delete(time);
            else newSel.add(time);
        } else {
            // Single select
            newSel.clear();
            newSel.add(time);
        }
        setSelectedKeys(newSel);
    };

    const handleDeleteSelected = () => {
        if (selectedKeys.size === 0) return;

        // Batch remove
        const newKeys = keys.filter(k => !selectedKeys.has(k));
        setKeys(newKeys);
        setSelectedKeys(new Set());
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

    const handleClearKeys = () => {
        setKeys([]);
        setSelectedKeys(new Set());
    };

    // Drag Key Handlers
    const handleDragStart = (e: React.MouseEvent, time: number) => {
        e.stopPropagation();
        // If dragging a key that isn't selected, select it exclusively
        if (!selectedKeys.has(time)) {
            setSelectedKeys(new Set([time]));
        }
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
                // Update selection to tracking new key if it was selected
                const newSel = new Set(selectedKeys);
                newSel.delete(draggingKey.original);

                const newTime = Number(draggingKey.current.toFixed(3));
                addKey(newTime);
                newSel.add(newTime);
                setSelectedKeys(newSel);
            }
            setDraggingKey(null);
        }
    };

    return (
        <div className="w-full flex flex-col gap-4 p-4 border-t bg-background z-10 select-none">

            {/* Controls */}
            <div className="flex items-center gap-4 justify-between">
                <div className="flex items-center gap-1">
                    <Button
                        size="sm"
                        variant={isPlaying ? "secondary" : "default"}
                        onClick={() => {
                            setPreviewMode(false);
                            setIsPlaying(!isPlaying);
                        }}
                    >
                        {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {isPlaying ? "Pause" : "Play"}
                    </Button>

                    <Button
                        size="sm"
                        variant={previewMode ? "secondary" : "outline"}
                        onClick={() => setPreviewMode(!previewMode)}
                        disabled={keys.length === 0}
                        className={cn(previewMode && "bg-primary text-primary-foreground hover:bg-primary/90")}
                    >
                        <FastForward className="w-4 h-4 mr-2" />
                        Preview Keyframes
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Delete Selected Button */}
                    {selectedKeys.size > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                            {selectedKeys.size === 1 && (
                                <Input
                                    type="number"
                                    className="w-20 h-8"
                                    step="0.001"
                                    min={0}
                                    max={videoDuration}
                                    value={[...selectedKeys][0]}
                                    onChange={(e) => {
                                        const oldTime = [...selectedKeys][0];
                                        const newTime = Math.min(Math.max(0, Number(e.target.value)), videoDuration);
                                        if (oldTime === newTime) return;

                                        removeKey(oldTime);
                                        addKey(newTime);
                                        setSelectedKeys(new Set([newTime]));
                                    }}
                                />
                            )}
                            <Button size="sm" variant="destructive" onClick={handleDeleteSelected}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete {selectedKeys.size > 1 ? `${selectedKeys.size} Selected` : "Selected"}
                            </Button>
                        </div>
                    )}

                    <div className="h-6 w-px bg-border mx-2" />

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
                    <Button size="icon" variant="ghost" onClick={handleClearKeys} title="Clear All">
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
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
                {keys.map((time) => {
                    const isSelected = selectedKeys.has(time);
                    return (
                        <div
                            key={time}
                            className={cn(
                                "absolute top-0 bottom-0 -translate-x-1/2 w-1 z-10 transition-colors cursor-grab active:cursor-grabbing group/key",
                                isSelected ? "bg-primary z-50 w-1.5" : "bg-yellow-400 hover:bg-yellow-300",
                                draggingKey?.original === time && "opacity-50"
                            )}
                            style={{ left: `${timeToPercent(time)}%` }}
                            onMouseDown={(e) => handleDragStart(e, time)}
                            onClick={(e) => handleKeyClick(e, time)}
                            title={`Keyframe at ${time}s`}
                        >
                            <div className={cn(
                                "absolute top-0 -translate-x-1/3 rounded-b-sm border shadow-sm transition-colors",
                                isSelected ? "w-4 h-4 bg-primary border-primary-foreground" : "w-3 h-3 bg-yellow-500 group-hover/key:bg-yellow-300"
                            )} />
                        </div>
                    );
                })}

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
