"use client";

import React, { useEffect, useState } from "react";
import { StorageService, VideoProject } from "@/lib/storage";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileVideo, Trash2, Clock } from "lucide-react";

interface RecentFilesProps {
    onSelect: (project: VideoProject) => void;
    onCreateNew?: () => void;
}

export const RecentFiles = ({ onSelect, onCreateNew }: RecentFilesProps) => {
    const [projects, setProjects] = useState<VideoProject[]>([]);

    const loadProjects = async () => {
        const list = await StorageService.getProjects();
        setProjects(list);
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this project?")) {
            await StorageService.deleteProject(id);
            loadProjects();
        }
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

                {/* Create New Tile */}
                {onCreateNew && (
                    <Card
                        className="aspect-square cursor-pointer hover:border-primary/50 hover:bg-muted/10 transition-all border-dashed border-2 flex flex-col items-center justify-center gap-4 group"
                        onClick={onCreateNew}
                    >
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileVideo className="w-8 h-8 text-primary" />
                        </div>
                        <div className="text-center p-4">
                            <h3 className="font-semibold text-lg">New Project</h3>
                            <p className="text-xs text-muted-foreground mt-1">Upload Video</p>
                        </div>
                    </Card>
                )}

                {projects.map((p) => (
                    <Card
                        key={p.id}
                        className="aspect-square cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all group relative overflow-hidden flex flex-col"
                        onClick={() => onSelect(p)}
                    >
                        {/* Thumbnail takes up most space */}
                        <div className="flex-1 bg-black/5 relative w-full overflow-hidden">
                            {p.thumbnail ? (
                                <img src={p.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                                    <FileVideo className="w-12 h-12" />
                                </div>
                            )}
                            {/* Overlay Gradient */}
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
                        </div>

                        {/* Info footer overlaid or separate? Let's keep it clean at bottom or inside */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="font-bold truncate text-shadow-sm leading-tight">{p.name}</h3>
                            <p className="text-xs text-white/70 mt-1">
                                {formatDistanceToNow(p.createdAt, { addSuffix: true })}
                            </p>
                        </div>

                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 shadow-sm"
                            onClick={(e) => handleDelete(e, p.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};
