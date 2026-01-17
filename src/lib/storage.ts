import { set, get, del, values, keys } from "idb-keyval";
// import { v4 as uuidv4 } from "uuid"; 

// Simple ID generator if uuid not available
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export interface VideoProject {
    id: string;
    name: string;
    createdAt: number;
    updatedAt: number;
    duration: number;
    fileHandle?: File; // We store the File object directly (idb supports it)
    thumbnail?: string; // Data URL of a frame
}

export const StorageService = {
    async saveProject(file: File, thumbnail?: string): Promise<VideoProject> {
        const id = generateId();

        let thumb = thumbnail;
        if (!thumb) {
            try {
                thumb = await this.generateThumbnail(file);
            } catch (e) {
                console.error("Failed to generate thumbnail", e);
            }
        }

        const project: VideoProject = {
            id,
            name: file.name,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            duration: 0,
            fileHandle: file,
            thumbnail: thumb
        };

        await set(`project-${id}`, project);
        return project;
    },

    async generateThumbnail(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;
            video.playsInline = true;
            // Important: Cross origin if using URL.createObjectURL often fine for local file, 
            // but if we ever use remote, this matters.

            const url = URL.createObjectURL(file);
            video.src = url;

            video.onloadedmetadata = () => {
                // Seek to 1 second or 25% of duration
                let seekTime = 1;
                if (video.duration < 1) seekTime = video.duration / 2;
                else if (video.duration > 5) seekTime = 2; // Grab from 2s mark

                video.currentTime = seekTime;
            };

            video.onseeked = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = 300; // Thumbnail width
                    canvas.height = 300 * (video.videoHeight / video.videoWidth);

                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject('No canvas context');

                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                    URL.revokeObjectURL(url);
                    resolve(dataUrl);
                } catch (e) {
                    reject(e);
                }
            };

            video.onerror = (e) => {
                URL.revokeObjectURL(url);
                reject(e);
            };
        });
    },

    async updateProject(project: VideoProject): Promise<void> {
        await set(`project-${project.id}`, { ...project, updatedAt: Date.now() });
    },

    async getProjects(): Promise<VideoProject[]> {
        const allKeys = await keys();
        const projectKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('project-'));
        const projects: VideoProject[] = [];

        for (const key of projectKeys) {
            const p = await get<VideoProject>(key);
            if (p) projects.push(p);
        }

        return projects.sort((a, b) => b.updatedAt - a.updatedAt);
    },

    async getProject(id: string): Promise<VideoProject | undefined> {
        return get(`project-${id}`);
    },

    async deleteProject(id: string): Promise<void> {
        await del(`project-${id}`);
    }
};
