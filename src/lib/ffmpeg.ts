import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export class FFmpegService {
    private static instance: FFmpegService;
    private ffmpeg: FFmpeg;
    private loaded: boolean = false;

    private constructor() {
        this.ffmpeg = new FFmpeg();
    }

    public static getInstance(): FFmpegService {
        if (!FFmpegService.instance) {
            FFmpegService.instance = new FFmpegService();
        }
        return FFmpegService.instance;
    }

    public async load(): Promise<void> {
        if (this.loaded) return;

        const baseURL = window.location.origin + "/ffmpeg";

        await this.ffmpeg.load({
            coreURL: `${baseURL}/ffmpeg-core.js`,
            wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        });

        this.loaded = true;
    }

    public async extractFrame(videoFile: File, timestamp: number, outputName: string): Promise<string> {
        await this.load();
        const inputName = "input.mp4";
        await this.ffmpeg.writeFile(inputName, await fetchFile(videoFile));

        await this.ffmpeg.exec([
            "-ss", timestamp.toString(),
            "-i", inputName,
            "-frames:v", "1",
            "-q:v", "2", // High quality for intermediate frame
            outputName
        ]);

        const data = await this.ffmpeg.readFile(outputName);
        return URL.createObjectURL(new Blob([data as any], { type: "image/png" }));
    }

    public async generateSpritesheet(
        videoFile: File,
        timestamps: number[],
        width: number,
        height: number,
        fps: number
    ): Promise<{ url: string; blob: Blob }> {
        await this.load();
        const inputName = "input.mp4";
        await this.ffmpeg.writeFile(inputName, await fetchFile(videoFile));

        const fileList: string[] = [];

        // Extract frames
        for (let i = 0; i < timestamps.length; i++) {
            const outputName = `frame_${i.toString().padStart(3, "0")}.png`;
            await this.ffmpeg.exec([
                "-ss", timestamps[i].toString(),
                "-i", inputName,
                "-frames:v", "1",
                "-vf", `scale=${width}:${height}`,
                outputName
            ]);
            fileList.push(outputName);
        }

        const outputFilename = "output.webp";

        await this.ffmpeg.exec([
            "-framerate", fps.toString(),
            "-pattern_type", "glob",
            "-i", "frame_*.png",
            "-loop", "0",
            "-c:v", "libwebp",
            "-lossless", "0",
            "-q:v", "80", // Quality
            outputFilename
        ]);

        const data = await this.ffmpeg.readFile(outputFilename);
        const blob = new Blob([data as any], { type: "image/webp" });
        const url = URL.createObjectURL(blob);

        // Cleanup
        for (const f of fileList) {
            await this.ffmpeg.deleteFile(f);
        }
        await this.ffmpeg.deleteFile(inputName);
        await this.ffmpeg.deleteFile(outputFilename);

        return { url, blob };
    }

    public getFFmpeg() {
        return this.ffmpeg;
    }
}
