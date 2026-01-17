"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useEditorStore } from '@/store/editor-store';

export const TimelineThumbnails = () => {
    const { videoUrl, videoDuration } = useEditorStore();
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!videoUrl || videoDuration <= 0) return;

        const generateThumbnails = async () => {
            const video = document.createElement('video');
            video.src = videoUrl;
            video.muted = true;
            video.crossOrigin = "anonymous";

            await new Promise((resolve) => {
                video.onloadedmetadata = () => resolve(true);
            });

            const thumbs: string[] = [];

            // Aim for roughly one thumbnail every 5 seconds or fixed count?
            // Fixed count is safer for width.
            // Let's say we want a thumbnail every 10% of width or so.
            // Actually, best is fixed time interval to represent time.
            // Let's do 10 thumbnails for simplicity for now to fill the track.
            const count = 10;
            const step = videoDuration / count;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set canvas size (small)
            const w = 160;
            const h = 90;
            canvas.width = w;
            canvas.height = h;

            for (let i = 0; i < count; i++) {
                const time = i * step;
                video.currentTime = time;
                await new Promise(r => {
                    video.onseeked = r;
                });

                ctx.drawImage(video, 0, 0, w, h);
                thumbs.push(canvas.toDataURL('image/jpeg', 0.5));
            }

            setThumbnails(thumbs);
        };

        generateThumbnails();
    }, [videoUrl, videoDuration]);

    if (!thumbnails.length) return null;

    return (
        <div className="absolute inset-0 flex items-center overflow-hidden opacity-50 pointer-events-none rounded">
            {thumbnails.map((src, i) => (
                <div key={i} className="flex-1 h-full relative">
                    <img src={src} className="w-full h-full object-cover border-r border-white/10" alt="" />
                </div>
            ))}
        </div>
    );
}
