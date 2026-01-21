"use client";

import { LayoutGrid, Keyboard, Zap, Upload, Loader2 } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Header() {
    const [isOnVercel, setIsOnVercel] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);

    useEffect(() => {
        setIsOnVercel(window.location.hostname.includes("vercel.app"));
    }, []);

    const handleSwitchToLocal = () => {
        window.location.href = "http://localhost:3001";
    };

    const handleUpdateOnline = async () => {
        setIsDeploying(true);
        try {
            const response = await fetch("/api/deploy", {
                method: "POST",
            });
            const data = await response.json();

            if (response.ok) {
                toast.success("Deploy berhasil!", {
                    description: "Perubahan sudah dipush ke GitHub. Vercel akan auto-deploy.",
                });
            } else {
                if (data.code === "NO_CHANGES") {
                    toast.info("Tidak ada perubahan", {
                        description: "Semua perubahan sudah di-deploy sebelumnya.",
                    });
                } else {
                    toast.error("Deploy gagal", {
                        description: data.details || data.error,
                    });
                }
            }
        } catch (error) {
            toast.error("Deploy gagal", {
                description: error instanceof Error ? error.message : "Terjadi kesalahan",
            });
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary">
                        <LayoutGrid className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Krisandi Dashboard</h1>
                        <p className="text-xs text-muted-foreground hidden sm:block">
                            App Launcher Portal
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isOnVercel && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-500 border-amber-500/50 hover:bg-amber-500/10 hidden sm:flex"
                            onClick={handleSwitchToLocal}
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            Use Localhost
                        </Button>
                    )}

                    {!isOnVercel && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-green-500 border-green-500/50 hover:bg-green-500/10 hidden sm:flex"
                            onClick={handleUpdateOnline}
                            disabled={isDeploying}
                        >
                            {isDeploying ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="h-4 w-4 mr-2" />
                            )}
                            {isDeploying ? "Deploying..." : "Update Online"}
                        </Button>
                    )}


                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" title="Keyboard shortcuts">
                                <Keyboard className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-64">
                            <div className="space-y-3">
                                <h4 className="font-medium">Keyboard Shortcuts</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Focus search</span>
                                        <kbd className="px-2 py-1 rounded bg-muted text-xs">/</kbd>
                                    </div>
                                    {!isOnVercel && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Add new app</span>
                                            <kbd className="px-2 py-1 rounded bg-muted text-xs">n</kbd>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </header>
    );
}
