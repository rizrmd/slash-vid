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
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 transition-all">
            <div className="w-full max-w-4xl flex flex-col items-center gap-12">

                {/* Hero Section */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/5 text-primary shadow-sm mb-2 ring-1 ring-inset ring-primary/10">
                        <Film className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground pb-2">
                            SlashVid Converter
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-[600px] mx-auto leading-relaxed">
                            Professional video to spritesheet conversion. <br />
                            Optimized for web performance and game development.
                        </p>
                    </div>
                </div>

                {/* Main Action Area */}
                <div className="w-full grid grid-cols-1 gap-8">
                    <Card className="group relative overflow-hidden border-dashed border-2 hover:border-primary/50 transition-all duration-300 bg-muted/5 hover:bg-muted/10 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="p-12 flex flex-col items-center justify-center gap-6 text-center relative z-10">
                            <div className="w-16 h-16 rounded-full bg-background shadow-sm ring-1 ring-border flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-2xl">Create New Project</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    Drag and drop your video here, or click to browse.
                                    Supports MP4, WebM, and MOV.
                                </p>
                            </div>
                            <Button size="lg" className="mt-2 text-md px-8 shadow-lg hover:shadow-xl transition-all">
                                Select Video File
                            </Button>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </Card>

                    <RecentFiles onSelect={handleProjectSelect} />
                </div>
            </div>
        </div>
    );
};
