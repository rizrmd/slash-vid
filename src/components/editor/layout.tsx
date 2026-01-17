import React from "react";
import { VideoPreview } from "./video-preview";
import { Timeline } from "./timeline";
import { ExportPanel } from "./export-panel";
import { Dashboard } from "../dashboard/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";

export const EditorLayout = () => {
    const { videoUrl, reset } = useEditorStore();

    if (!videoUrl) {
        return <Dashboard />;
    }

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden state-editor">
            {/* Main Content: Video & Timeline */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 border-b flex items-center px-4 shrink-0 gap-4">
                    <Button variant="ghost" size="sm" onClick={reset}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <h1 className="font-semibold text-lg">Editor</h1>
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
                                <p>Upload a video to start.</p>
                                <p className="mt-2">Use the timeline to select frames. Click [+] to add keys or drag timeline.</p>
                                <p className="mt-2">Output is an animated WebP with specific frames.</p>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};
