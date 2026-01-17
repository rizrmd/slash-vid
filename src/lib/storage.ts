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
        const project: VideoProject = {
            id,
            name: file.name,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            duration: 0, // Will be updated later
            fileHandle: file,
            thumbnail
        };

        await set(`project-${id}`, project);
        return project;
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
