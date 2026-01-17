import React, { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { FFmpegService } from "@/lib/ffmpeg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download } from "lucide-react";

export const ExportPanel = () => {
    const {
        videoFile,
        keys,
        videoDimensions,
        exportFps,
        setExportSettings
    } = useEditorStore();

    const [isProcessing, setIsProcessing] = useState(false);
    const [outputUrl, setOutputUrl] = useState<string | null>(null);

    const handleExport = async () => {
        if (!videoFile || keys.length === 0) return;

        setIsProcessing(true);
        setOutputUrl(null);

        try {
            const ffmpeg = FFmpegService.getInstance();
            // Use original dimensions if not specified (could be huge, but maybe that's what they want?)
            // Let's stick to original for now or maybe scale down implies less file size.
            // User said "converting video into spritesheet", usually we need small sizes.

            const result = await ffmpeg.generateSpritesheet(
                videoFile,
                keys,
                videoDimensions.width, // Use source width
                videoDimensions.height, // Use source height
                exportFps
            );

            setOutputUrl(result.url);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed. Check console.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Card className="h-full border-l-0 rounded-none border-y-0">
            <CardHeader>
                <CardTitle>Export Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Playback FPS (Output)</Label>
                    <Input
                        type="number"
                        value={exportFps}
                        onChange={e => setExportSettings({ fps: Number(e.target.value) })}
                        min={1}
                        max={60}
                    />
                    <p className="text-xs text-muted-foreground">Frame rate of the generated WebP animation.</p>
                </div>

                <div className="space-y-1">
                    <div className="text-sm font-medium">Stats</div>
                    <div className="text-xs text-muted-foreground">Original Size: {videoDimensions.width}x{videoDimensions.height}</div>
                    <div className="text-xs text-muted-foreground">Selected Frames: {keys.length}</div>
                </div>

                <Button
                    className="w-full"
                    onClick={handleExport}
                    disabled={!videoFile || keys.length === 0 || isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                        </>
                    ) : (
                        "Generate Spritesheet"
                    )}
                </Button>

                {outputUrl && (
                    <div className="pt-4 border-t">
                        <Button variant="outline" className="w-full" asChild>
                            <a href={outputUrl} download="spritesheet.webp">
                                <Download className="w-4 h-4 mr-2" /> Download WebP
                            </a>
                        </Button>
                        <div className="mt-4 border rounded p-2 bg-checkerboard flex justify-center">
                            <img src={outputUrl} alt="Preview" className="max-w-full max-h-[200px] object-contain" />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
