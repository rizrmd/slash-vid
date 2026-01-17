import { create } from 'zustand';

interface EditorState {
    videoUrl: string | null;
    videoFile: File | null;
    videoDuration: number;
    videoDimensions: { width: number; height: number };

    // Timeline
    keys: number[]; // Timestamps in seconds
    currentTime: number;
    isPlaying: boolean;

    // Export Settings
    exportFps: number;
    exportWidth: number | null; // null means original or calculated aspect
    exportHeight: number | null;

    // Actions
    setVideo: (file: File) => void;
    setVideoMetadata: (duration: number, width: number, height: number) => void;
    addKey: (timestamp: number) => void;
    removeKey: (timestamp: number) => void;
    setKeys: (keys: number[]) => void;
    setCurrentTime: (time: number) => void;
    setIsPlaying: (playing: boolean) => void;
    setExportSettings: (settings: Partial<{ fps: number; width: number; height: number }>) => void;
    reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    videoUrl: null,
    videoFile: null,
    videoDuration: 0,
    videoDimensions: { width: 0, height: 0 },

    keys: [],
    currentTime: 0,
    isPlaying: false,

    exportFps: 10,
    exportWidth: null,
    exportHeight: null,

    setVideo: (file) => {
        const url = URL.createObjectURL(file);
        set({ videoFile: file, videoUrl: url, keys: [], currentTime: 0, isPlaying: false });
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

    setExportSettings: (settings) => set((state) => ({
        exportFps: settings.fps ?? state.exportFps,
        exportWidth: settings.width ?? state.exportWidth,
        exportHeight: settings.height ?? state.exportHeight,
    })),

    reset: () => set({
        videoUrl: null,
        videoFile: null,
        videoDuration: 0,
        videoDimensions: { width: 0, height: 0 },
        keys: [],
        currentTime: 0,
        isPlaying: false
    })
}));
