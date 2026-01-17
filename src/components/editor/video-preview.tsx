"use client";

import React, { useRef, useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";

export const VideoPreview = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const {
        videoUrl,
        currentTime,
        isPlaying,
        setIsPlaying,
        setCurrentTime,
        setVideoMetadata,
        previewMode,
        keys,
        exportFps
    } = useEditorStore();

    // Sync Video Element -> Store (Time/End)
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
        };

        const handleLoadedMetadata = () => {
            setVideoMetadata(video.duration, video.videoWidth, video.videoHeight);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
        };
    }, [setCurrentTime, setVideoMetadata, setIsPlaying]);

    // Sync Store -> Video Element (Play/Pause/Seek)
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        if (Math.abs(video.currentTime - currentTime) > 0.5) {
            // Only seek if difference is significant
        }
    }, [currentTime, videoUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (isPlaying && video.paused) {
            video.play().catch(console.error);
        } else if (!isPlaying && !video.paused) {
            video.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // If paused or in preview mode, allow precise seeking
        if ((video.paused || previewMode) && Math.abs(video.currentTime - currentTime) > 0.01) {
            video.currentTime = currentTime;
        }
    }, [currentTime, previewMode]);

    // Preview Mode Logic
    useEffect(() => {
        if (!previewMode || keys.length === 0) return;

        let timeoutId: NodeJS.Timeout;

        const playNextFrame = () => {
            // Find current key index
            let currentIndex = keys.findIndex(k => Math.abs(k - currentTime) < 0.05);

            if (currentIndex === -1) {
                currentIndex = keys.findIndex(k => k > currentTime);
                if (currentIndex === -1) currentIndex = -1; // Will loop to 0
            }

            let nextIndex = currentIndex + 1;
            if (nextIndex >= keys.length) nextIndex = 0;

            const nextTime = keys[nextIndex];
            setCurrentTime(nextTime);

            const msPerFrame = 1000 / exportFps;
            timeoutId = setTimeout(playNextFrame, msPerFrame);
        };

        timeoutId = setTimeout(playNextFrame, 1000 / exportFps);

        return () => clearTimeout(timeoutId);
    }, [previewMode, keys, currentTime, exportFps, setCurrentTime]);

    if (!videoUrl) {
        return (
            <div className="flex items-center justify-center h-full bg-muted/20 border-2 border-dashed rounded-lg p-12">
                <label className="cursor-pointer text-center">
                    <span className="text-muted-foreground block mb-2">Drag and drop or click to upload</span>
                    <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files?.[0]) useEditorStore.getState().setVideo(e.target.files[0]);
                        }}
                    />
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm inline-block">
                        Upload Video
                    </div>
                </label>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden group">
            <video
                ref={videoRef}
                src={videoUrl}
                className="max-h-full max-w-full object-contain"
                controls={!previewMode} // Hide native controls in preview mode
            />
            {previewMode && (
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg z-10 animate-pulse">
                    Previewing Keyframes ({exportFps} FPS)
                </div>
            )}
        </div>
    );
};
