import React, { useEffect, useState } from "react";
import { StorageService, VideoProject } from "@/lib/storage";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileVideo, Trash2, Clock } from "lucide-react";

interface RecentFilesProps {
    onSelect: (project: VideoProject) => void;
}

export const RecentFiles = ({ onSelect }: RecentFilesProps) => {
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

    if (projects.length === 0) return null;

    return (
        <div className="w-full max-w-2xl mt-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2" /> Recent Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p) => (
                    <Card
                        key={p.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors group relative"
                        onClick={() => onSelect(p)}
                    >
                        <CardContent className="p-4 flex items-start gap-3">
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center shrink-0">
                                {p.thumbnail ? (
                                    <img src={p.thumbnail} alt="" className="w-full h-full object-cover rounded" />
                                ) : (
                                    <FileVideo className="w-6 h-6 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate" title={p.name}>{p.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(p.createdAt, { addSuffix: true })}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive absolute right-2 top-2"
                                onClick={(e) => handleDelete(e, p.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
