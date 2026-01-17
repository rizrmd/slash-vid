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
        setVideoMetadata
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
            // Only seek if difference is significant to avoid fighting updates
            // video.currentTime = currentTime; 
            // Note: syncing exact frame is tricky. 
            // Let's rely on native controls mostly, and only seek if driven by timeline click (large delta)
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

    // Handle Timeline Seeking (Store -> Video)
    // We need a specific "seek" action or check delta.
    // A common pattern is to track "user is dragging timeline" state which creates a source of truth for time.
    // For now let's just expose a function ref or rely on the store.

    // We can force seek if the time change came from outside (not the video itself).
    // But distinguishing source is hard here. 
    // Simplified: If video is paused, we assume time changes are seeking.

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // If paused, allow precise seeking
        if (video.paused && Math.abs(video.currentTime - currentTime) > 0.1) {
            video.currentTime = currentTime;
        }
    }, [currentTime]);

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
        <div className="relative w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
            <video
                ref={videoRef}
                src={videoUrl}
                className="max-h-full max-w-full object-contain"
                controls={true} // Use native controls for now
            />
        </div>
    );
};
