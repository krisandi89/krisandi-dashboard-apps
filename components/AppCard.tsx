"use client";

import { App } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ExternalLink,
    MoreVertical,
    Edit,
    Trash2,
    Copy,
    Pin,
    PinOff,
    Globe,
    Server,
    Play,
    Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface AppCardProps {
    app: App;
    onEdit: (app: App) => void;
    onDelete: (app: App) => void;
    onDuplicate: (app: App) => void;
    onTogglePin: (app: App) => void;
}

// Render icon - supports emoji
function renderIcon(icon: string, fallbackType: "web" | "local") {
    if (!icon) {
        // Default icons based on type
        return fallbackType === "local" ? (
            <Server className="h-8 w-8 text-amber-500" />
        ) : (
            <Globe className="h-8 w-8 text-blue-500" />
        );
    }

    // Display as emoji/text
    return <span className="text-3xl">{icon}</span>;
}

export function AppCard({ app, onEdit, onDelete, onDuplicate, onTogglePin }: AppCardProps) {
    const [isStarting, setIsStarting] = useState(false);
    const [isOnVercel, setIsOnVercel] = useState(false);

    useEffect(() => {
        setIsOnVercel(window.location.hostname.includes("vercel.app"));
    }, []);

    const handleCardClick = () => {
        // Stop propagation just in case, though the wrapper usually handles it
        window.open(app.url, "_blank", "noopener,noreferrer");
    };

    const handleStartServer = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        setIsStarting(true);

        const tryStart = async (baseUrl: string = "") => {
            const res = await fetch(`${baseUrl}/api/apps/${app.id}/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            if (!res.ok) throw new Error(res.statusText);
            return await res.json();
        };

        try {
            // For local apps, ALWAYS try localhost:3001 first
            // We never want to hit the Vercel backend for start commands
            if (app.type === "local") {
                try {
                    await tryStart("http://localhost:3001");
                    toast.success(`🚀 [LOCAL] Started server for "${app.name}"`);
                } catch (localError) {
                    console.error("Local connection failed", localError);

                    // Fallback to relative ONLY if we are NOT on Vercel
                    if (!window.location.hostname.includes("vercel.app")) {
                        try {
                            await tryStart();
                            toast.success(`🚀 Started server for "${app.name}"`);
                            return;
                        } catch (e) { console.error(e); }
                    }

                    toast.error("Could not connect to Local Server. Ensure 'npm run dev' is running on port 3001.");
                    setIsStarting(false);
                    return;
                }
            } else {
                // For web apps (if we ever add start command), use relative
                await tryStart();
                toast.success(`🚀 Started server for "${app.name}"`);
            }

            // Success handling (open URL)
            setTimeout(() => {
                window.open(app.url, "_blank", "noopener,noreferrer");
            }, 2000);

        } catch (error) {
            console.error("Error starting server:", error);
            toast.error("Failed to start server");
        } finally {
            setIsStarting(false);
        }
    };

    const hasStartCommand = app.type === "local" && app.startCommand;

    return (
        <Card
            className="group relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 bg-card/50 backdrop-blur-sm"
            onClick={handleCardClick}
        >
            {/* Pin indicator */}
            {app.isPinned && (
                <div className="absolute top-2 left-2">
                    <Pin className="h-4 w-4 text-amber-500 fill-amber-500" />
                </div>
            )}

            {/* Dropdown menu - ONLY show if NOT on Vercel */}
            {!isOnVercel && (
                <div
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 backdrop-blur-sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(app)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDuplicate(app)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onTogglePin(app)}>
                                {app.isPinned ? (
                                    <>
                                        <PinOff className="mr-2 h-4 w-4" />
                                        Unpin
                                    </>
                                ) : (
                                    <>
                                        <Pin className="mr-2 h-4 w-4" />
                                        Pin to top
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(app)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-muted">
                        {renderIcon(app.icon, app.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate flex items-center gap-2">
                            {app.name}
                            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                            {app.description || "No description"}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Type badge */}
                    <Badge
                        variant={app.type === "local" ? "secondary" : "default"}
                        className={app.type === "local"
                            ? "bg-amber-500/20 text-amber-600 border-amber-500/30"
                            : "bg-blue-500/20 text-blue-600 border-blue-500/30"
                        }
                    >
                        {app.type === "local" ? (
                            <><Server className="h-3 w-3 mr-1" /> Local</>
                        ) : (
                            <><Globe className="h-3 w-3 mr-1" /> Web</>
                        )}
                    </Badge>

                    {/* Start Server button for local apps with startCommand */}
                    {hasStartCommand && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs gap-1 bg-green-500/20 text-green-600 border-green-500/30 hover:bg-green-500/30"
                            onClick={handleStartServer}
                            disabled={isStarting}
                        >
                            {isStarting ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Play className="h-3 w-3" />
                            )}
                            Start
                        </Button>
                    )}

                    {/* Tags */}
                    {app.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                    {app.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                            +{app.tags.length - 2}
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
