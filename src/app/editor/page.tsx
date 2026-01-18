"use client";

import React, { useEffect, useState } from "react";
import { EditorContent } from "@/components/editor/editor-content";
import { StorageService } from "@/lib/storage";
import { useEditorStore } from "@/store/editor-store";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EditorPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const { loadProject, reset } = useEditorStore();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!id) {
            router.push("/");
            return;
        }

        const fetchProject = async () => {
            setLoading(true);
            try {
                const project = await StorageService.getProject(id);
                if (project) {
                    loadProject(project);
                } else {
                    router.push("/");
                }
            } catch (e) {
                console.error("Failed to load project", e);
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        fetchProject();

        return () => reset(); // Cleanup on unmount
    }, [id, loadProject, reset, router]);

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading project...</p>
            </div>
        );
    }

    return <EditorContent />;
}
