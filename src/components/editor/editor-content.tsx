import React, { useEffect } from "react";
import { VideoPreview } from "./video-preview";
import { Timeline } from "./timeline";
import { ExportPanel } from "./export-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { Input } from "@/components/ui/input";
import { StorageService } from "@/lib/storage";
import { useRouter } from "next/navigation";

export const EditorContent = () => {
    const {
        videoUrl,
        reset,
        projectName,
        setProjectName,
        projectId,
        keys,
        exportFps,
        exportWidth,
        exportHeight,
        videoDuration,
        videoFile
    } = useEditorStore();
    const router = useRouter();

    // Auto-save keyframes and settings
    useEffect(() => {
        if (!projectId || !videoFile) return;

        const saveChanges = async () => {
            const project = await StorageService.getProject(projectId);
            if (project) {
                project.keys = keys;
                project.exportFps = exportFps;
                project.exportWidth = exportWidth || undefined;
                project.exportHeight = exportHeight || undefined;
                await StorageService.updateProject(project);
            }
        };

        const timer = setTimeout(saveChanges, 500); // Debounce save
        return () => clearTimeout(timer);
    }, [projectId, keys, exportFps, exportWidth, exportHeight, videoFile]);

    if (!videoUrl) {
        return null; // Handled by page.tsx loading state
    }

    const handleBack = () => {
        reset();
        router.push("/");
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(e.target.value);
    };

    const handleNameSave = () => {
        if (projectId && projectName.trim()) {
            StorageService.renameProject(projectId, projectName);
        }
    };

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden state-editor">
            {/* Main Content: Video & Timeline */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 border-b flex items-center px-4 shrink-0 gap-4">
                    <Button variant="ghost" size="sm" onClick={handleBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div className="flex-1 max-w-[300px]">
                        <Input
                            value={projectName}
                            onChange={handleNameChange}
                            onBlur={handleNameSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                            className="h-8 font-semibold bg-transparent border-transparent hover:border-input focus:border-input px-2 transition-all"
                        />
                    </div>
                </header>

                <main className="flex-1 relative flex flex-col overflow-hidden">
                    {/* Viewport */}
                    <div className="flex-1 bg-muted/10 p-4 flex items-center justify-center overflow-hidden">
                        <VideoPreview />
                    </div>

                    {/* Timeline Area */}
                    <div className="shrink-0 h-48 border-t bg-background flex flex-col">
                        <Timeline />
                    </div>
                </main>
            </div>

            {/* Sidebar / Panels */}
            <div className="w-[300px] border-l bg-muted/5 flex flex-col shrink-0">
                <Tabs defaultValue="export" className="flex flex-col h-full">
                    <div className="px-2 pt-2">
                        <TabsList className="w-full">
                            <TabsTrigger value="export" className="flex-1">Export</TabsTrigger>
                            <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <TabsContent value="export" className="h-full m-0 border-0 p-0">
                            <ExportPanel />
                        </TabsContent>
                        <TabsContent value="info" className="p-4 m-0">
                            <Card className="p-4 text-sm text-muted-foreground">
                                <p className="font-semibold text-foreground mb-2">Project Info</p>
                                <div className="space-y-1">
                                    <p>Duration: {videoDuration.toFixed(2)}s</p>
                                    <p>Keyframes: {keys.length}</p>
                                    <p>Export: {exportFps} FPS</p>
                                </div>
                                <hr className="my-4" />
                                <p>Use the timeline to select frames. Double-click to add, drag to move.</p>
                                <p className="mt-2 text-xs opacity-70 italic">All changes are saved automatically.</p>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};
