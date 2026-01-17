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
        <div className="min-h-screen bg-background flex flex-col items-center p-8 pt-20">
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                    <Film className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">SlashVid Converter</h1>
                <p className="text-muted-foreground text-lg max-w-[600px]">
                    Transform your videos into optimized spritesheets. Upload a video to get started or continue where you left off.
                </p>
            </div>

            <Card className="w-full max-w-md p-8 border-dashed border-2 hover:border-primary/50 transition-colors">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Upload Video</h3>
                        <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()} size="lg" className="mt-2">
                        Select File
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>
            </Card>

            <RecentFiles onSelect={handleProjectSelect} />
        </div>
    );
};
