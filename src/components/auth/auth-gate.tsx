"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

const AUTH_KEY = "slashvid-auth";
// Simple password, not secure against viewing source, but blocks casual access as requested.
const PASSWORD = "vidadmin";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [input, setInput] = useState("");
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(AUTH_KEY);
        if (stored === "true") {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (input === PASSWORD) {
            localStorage.setItem(AUTH_KEY, "true");
            setIsAuthenticated(true);
        } else {
            setError(true);
            setInput("");
        }
    };

    if (isLoading) return null;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                            <Lock className="w-6 h-6" />
                        </div>
                        <CardTitle>Restricted Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Enter password..."
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        setError(false);
                                    }}
                                    className={error ? "border-destructive" : ""}
                                />
                                {error && <p className="text-xs text-destructive">Incorrect password</p>}
                            </div>
                            <Button type="submit" className="w-full">
                                Enter
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                Hint: vidadmin
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
};
