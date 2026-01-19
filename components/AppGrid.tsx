"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { App, SortOption, FilterType } from "@/lib/types";
import { AppCard } from "./AppCard";
import { AppFormModal } from "./AppFormModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Plus,
    Search,
    SortAsc,
    Filter,
    RefreshCw,
    Download,
    Upload,
    Folder,
    X,
} from "lucide-react";

export function AppGrid() {
    const [apps, setApps] = useState<App[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("pinned");
    const [filterType, setFilterType] = useState<FilterType>("all");
    const [filterTags, setFilterTags] = useState<string[]>([]);
    const [showPinnedOnly, setShowPinnedOnly] = useState(false);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<App | null>(null);
    const [deletingApp, setDeletingApp] = useState<App | null>(null);

    // Fetch apps and tags
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [appsRes, tagsRes] = await Promise.all([
                fetch("/api/apps"),
                fetch("/api/tags"),
            ]);

            if (appsRes.ok && tagsRes.ok) {
                const appsData = await appsRes.json();
                const tagsData = await tagsRes.json();
                setApps(appsData.apps);
                setAllTags(tagsData.tags);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load apps");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const [isOnVercel, setIsOnVercel] = useState(false);

    useEffect(() => {
        setIsOnVercel(window.location.hostname.includes("vercel.app"));
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === "/" || e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                document.getElementById("search-input")?.focus();
            } else if (e.key === "n" && !isOnVercel) {
                e.preventDefault();
                setIsAddModalOpen(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOnVercel]);

    // CRUD handlers
    const handleCreate = async (data: Partial<App>) => {
        try {
            const res = await fetch("/api/apps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const { app } = await res.json();
                setApps((prev) => [...prev, app]);
                toast.success(`Added "${app.name}"`);
                setIsAddModalOpen(false);
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to add app");
            }
        } catch (error) {
            console.error("Error creating app:", error);
            toast.error("Failed to add app");
        }
    };

    const handleUpdate = async (id: string, data: Partial<App>) => {
        try {
            const res = await fetch(`/api/apps/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const { app } = await res.json();
                setApps((prev) => prev.map((a) => (a.id === id ? app : a)));
                toast.success(`Updated "${app.name}"`);
                setEditingApp(null);
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to update app");
            }
        } catch (error) {
            console.error("Error updating app:", error);
            toast.error("Failed to update app");
        }
    };

    const handleDelete = async () => {
        if (!deletingApp) return;

        try {
            const res = await fetch(`/api/apps/${deletingApp.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setApps((prev) => prev.filter((a) => a.id !== deletingApp.id));
                toast.success(`Deleted "${deletingApp.name}"`);
                setDeletingApp(null);
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to delete app");
            }
        } catch (error) {
            console.error("Error deleting app:", error);
            toast.error("Failed to delete app");
        }
    };

    const handleDuplicate = async (app: App) => {
        const duplicateData = {
            name: `${app.name} (Copy)`,
            url: app.url,
            tags: app.tags,
            description: app.description,
            icon: app.icon,
            isPinned: false,
        };

        try {
            const res = await fetch("/api/apps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(duplicateData),
            });

            if (res.ok) {
                const { app: newApp } = await res.json();
                setApps((prev) => [...prev, newApp]);
                toast.success(`Duplicated as "${newApp.name}"`);
            } else {
                toast.error("Failed to duplicate app");
            }
        } catch (error) {
            console.error("Error duplicating app:", error);
            toast.error("Failed to duplicate app");
        }
    };

    const handleTogglePin = async (app: App) => {
        await handleUpdate(app.id, { isPinned: !app.isPinned });
    };

    const handleExport = async () => {
        try {
            const res = await fetch("/api/apps/export");
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `krisandi-apps-export-${new Date().toISOString().split("T")[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                toast.success("Apps exported successfully");
            }
        } catch (error) {
            console.error("Error exporting apps:", error);
            toast.error("Failed to export apps");
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            const res = await fetch("/api/apps/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apps: data.apps, strategy: "skip" }),
            });

            if (res.ok) {
                const result = await res.json();
                toast.success(`Imported ${result.imported} apps, skipped ${result.skipped} duplicates`);
                fetchData();
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to import apps");
            }
        } catch (error) {
            console.error("Error importing apps:", error);
            toast.error("Invalid JSON file");
        }

        // Reset input
        e.target.value = "";
    };

    const clearFilters = () => {
        setSearchQuery("");
        setFilterType("all");
        setFilterTags([]);
        setShowPinnedOnly(false);
    };

    const hasActiveFilters = searchQuery || filterType !== "all" || filterTags.length > 0 || showPinnedOnly;

    // Filter and sort apps
    const filteredApps = useMemo(() => {
        let result = [...apps];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (app) =>
                    app.name.toLowerCase().includes(query) ||
                    app.url.toLowerCase().includes(query) ||
                    app.description.toLowerCase().includes(query) ||
                    app.tags.some((tag) => tag.toLowerCase().includes(query))
            );
        }
        if (filterType !== "all") {
            result = result.filter((app) => app.type === filterType);
        }
        if (filterTags.length > 0) {
            result = result.filter((app) =>
                filterTags.some((tag) => app.tags.includes(tag))
            );
        }
        if (showPinnedOnly) {
            result = result.filter((app) => app.isPinned);
        }
        result.sort((a, b) => {
            if (sortBy === "pinned") {
                if (a.isPinned !== b.isPinned) {
                    return a.isPinned ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            }
            if (sortBy === "name") {
                return a.name.localeCompare(b.name);
            }
            if (sortBy === "updated") {
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            }
            return 0;
        });
        return result;
    }, [apps, searchQuery, filterType, filterTags, showPinnedOnly, sortBy]);


    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col gap-4">
                {/* Search and Add button row */}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search-input"
                            placeholder='Search apps... (Press "/" to focus)'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {!isOnVercel && (
                        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add App</span>
                        </Button>
                    )}
                </div>

                {/* Filters row */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="web">Web</SelectItem>
                                <SelectItem value="local">Local</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4 text-muted-foreground" />
                        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pinned">Pinned First</SelectItem>
                                <SelectItem value="name">Name A-Z</SelectItem>
                                <SelectItem value="updated">Recently Updated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant={showPinnedOnly ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                    >
                        Pinned Only
                    </Button>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                            <X className="h-4 w-4" />
                            Clear
                        </Button>
                    )}

                    <div className="flex-1" />

                    {/* Export/Import buttons - ONLY on localhost */}
                    {!isOnVercel && (
                        <>
                            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                            <label>
                                <Button variant="outline" size="sm" asChild className="gap-2 cursor-pointer">
                                    <span>
                                        <Upload className="h-4 w-4" />
                                        <span className="hidden sm:inline">Import</span>
                                    </span>
                                </Button>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>
                        </>
                    )}
                    <Button variant="ghost" size="icon" onClick={fetchData} title="Refresh">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                {/* Tags filter */}
                {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-muted-foreground">Tags:</span>
                        {allTags.map((tag) => (
                            <Badge
                                key={tag}
                                variant={filterTags.includes(tag) ? "default" : "outline"}
                                className="cursor-pointer hover:bg-primary/80"
                                onClick={() => {
                                    setFilterTags((prev) =>
                                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                                    );
                                }}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Loading state */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="h-40 rounded-lg bg-muted animate-pulse"
                        />
                    ))}
                </div>
            ) : filteredApps.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Folder className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    {apps.length === 0 ? (
                        <>
                            <h3 className="text-lg font-medium mb-2">No apps yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Add your first app to get started
                            </p>
                            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Your First App
                            </Button>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-medium mb-2">No apps found</h3>
                            <p className="text-muted-foreground mb-4">
                                Try adjusting your search or filters
                            </p>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </>
                    )}
                </div>
            ) : (
                /* App grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredApps.map((app) => (
                        <AppCard
                            key={app.id}
                            app={app}
                            onEdit={setEditingApp}
                            onDelete={setDeletingApp}
                            onDuplicate={handleDuplicate}
                            onTogglePin={handleTogglePin}
                        />
                    ))}
                </div>
            )}

            {/* Results count */}
            {!isLoading && filteredApps.length > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                    Showing {filteredApps.length} of {apps.length} apps
                </p>
            )}

            {/* Modals */}
            <AppFormModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onSubmit={handleCreate}
                allTags={allTags}
            />

            <AppFormModal
                open={!!editingApp}
                onOpenChange={(open: boolean) => !open && setEditingApp(null)}
                onSubmit={async (data) => {
                    if (editingApp) {
                        await handleUpdate(editingApp.id, data);
                    }
                }}
                initialData={editingApp || undefined}
                allTags={allTags}
            />

            <DeleteConfirmDialog
                open={!!deletingApp}
                onOpenChange={(open: boolean) => !open && setDeletingApp(null)}
                onConfirm={handleDelete}
                appName={deletingApp?.name || ""}
            />
        </div>
    );
}
