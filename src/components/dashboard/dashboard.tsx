import React, { useRef } from "react";
import { RecentFiles } from "./recent-files";
import { useEditorStore } from "@/store/editor-store";
import { StorageService, VideoProject } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Film } from "lucide-react";

export const Dashboard = () => {
    const { setVideo } = useEditorStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            // Persist immediately
            await StorageService.saveProject(file);
            setVideo(file);
        }
    };

    const handleProjectSelect = (project: VideoProject) => {
        if (project.fileHandle) {
            setVideo(project.fileHandle);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-8 transition-all">
            <div className="w-full max-w-5xl flex flex-col gap-8 mt-12">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Film className="w-5 h-5" />
                        </div>
                        SlashVid
                    </h1>
                </div>

                <RecentFiles
                    onSelect={handleProjectSelect}
                    onCreateNew={() => fileInputRef.current?.click()}
                />

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>
        </div>
    );
};
