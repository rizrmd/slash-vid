import { create } from 'zustand';
import { VideoProject } from '@/lib/storage';

interface EditorState {
    projectId: string | null;
    projectName: string;
    videoUrl: string | null;
    videoFile: File | null;
    videoDuration: number;
    videoDimensions: { width: number; height: number };

    // Timeline
    keys: number[]; // Timestamps in seconds
    currentTime: number;
    isPlaying: boolean;
    previewMode: boolean;

    // Export Settings
    exportFps: number;
    exportWidth: number | null; // null means original or calculated aspect
    exportHeight: number | null;

    // Actions
    setVideo: (file: File, id?: string, name?: string) => void;
    loadProject: (project: VideoProject) => void;
    setProjectName: (name: string) => void;
    setVideoMetadata: (duration: number, width: number, height: number) => void;
    addKey: (timestamp: number) => void;
    removeKey: (timestamp: number) => void;
    setKeys: (keys: number[]) => void;
    setCurrentTime: (time: number) => void;
    setIsPlaying: (playing: boolean) => void;
    setPreviewMode: (enabled: boolean) => void;
    setExportSettings: (settings: Partial<{ fps: number; width: number; height: number }>) => void;
    reset: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
    projectId: null,
    projectName: "Untitled Project",
    videoUrl: null,
    videoFile: null,
    videoDuration: 0,
    videoDimensions: { width: 0, height: 0 },

    keys: [],
    currentTime: 0,
    isPlaying: false,
    previewMode: false,

    exportFps: 10,
    exportWidth: null,
    exportHeight: null,

    setVideo: (file, id, name) => {
        const url = URL.createObjectURL(file);
        set({
            videoFile: file,
            videoUrl: url,
            projectId: id || null,
            projectName: name || file.name,
            keys: [],
            currentTime: 0,
            isPlaying: false,
            previewMode: false
        });
    },

    loadProject: (project) => {
        if (!project.fileHandle) return;
        const url = URL.createObjectURL(project.fileHandle);
        set({
            projectId: project.id,
            projectName: project.name,
            videoFile: project.fileHandle,
            videoUrl: url,
            keys: project.keys || [],
            exportFps: project.exportFps || 10,
            exportWidth: project.exportWidth || null,
            exportHeight: project.exportHeight || null,
            currentTime: 0,
            isPlaying: false,
            previewMode: false
        });
    },

    setProjectName: (name) => {
        set({ projectName: name });
    },

    setVideoMetadata: (duration, width, height) => set({ videoDuration: duration, videoDimensions: { width, height } }),

    addKey: (timestamp) => set((state) => {
        if (state.keys.includes(timestamp)) return state;
        return { keys: [...state.keys, timestamp].sort((a, b) => a - b) };
    }),

    removeKey: (timestamp) => set((state) => ({
        keys: state.keys.filter((k) => k !== timestamp)
    })),

    setKeys: (keys) => set({ keys: keys.sort((a, b) => a - b) }),

    setCurrentTime: (time) => set({ currentTime: time }),

    setIsPlaying: (playing) => set({ isPlaying: playing }),

    setPreviewMode: (enabled) => set({ previewMode: enabled, isPlaying: false }),

    setExportSettings: (settings) => set((state) => ({
        exportFps: settings.fps ?? state.exportFps,
        exportWidth: settings.width ?? state.exportWidth,
        exportHeight: settings.height ?? state.exportHeight,
    })),

    reset: () => set({
        projectId: null,
        projectName: "Untitled Project",
        videoUrl: null,
        videoFile: null,
        videoDuration: 0,
        videoDimensions: { width: 0, height: 0 },
        keys: [],
        currentTime: 0,
        isPlaying: false,
        previewMode: false
    })
}));
