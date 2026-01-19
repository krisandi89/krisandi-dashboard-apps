"use client";

import { useState, useEffect } from "react";
import { App } from "@/lib/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Plus } from "lucide-react";

interface AppFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Partial<App>) => Promise<void>;
    initialData?: App;
    allTags: string[];
}

export function AppFormModal({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    allTags,
}: AppFormModalProps) {
    const isEditing = !!initialData;
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [isPinned, setIsPinned] = useState(false);
    const [startCommand, setStartCommand] = useState("");
    const [tagInput, setTagInput] = useState("");

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when modal opens/closes or initialData changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                setName(initialData.name);
                setUrl(initialData.url);
                setDescription(initialData.description);
                setIcon(initialData.icon);
                setTags(initialData.tags);
                setIsPinned(initialData.isPinned);
                setStartCommand(initialData.startCommand || "");
            } else {
                setName("");
                setUrl("");
                setDescription("");
                setIcon("");
                setTags([]);
                setIsPinned(false);
                setStartCommand("");
            }
            setTagInput("");
            setErrors({});
        }
    }, [open, initialData]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!url.trim()) {
            newErrors.url = "URL is required";
        } else {
            try {
                new URL(url);
            } catch {
                newErrors.url = "Must be a valid URL (include http:// or https://)";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                name: name.trim(),
                url: url.trim(),
                description: description.trim(),
                icon: icon.trim(),
                tags,
                isPinned,
                startCommand: startCommand.trim(),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim().toLowerCase();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
        }
        setTagInput("");
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(tagInput);
        } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    // Filter suggestions based on input
    const tagSuggestions = allTags.filter(
        (t) => !tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit App" : "Add New App"}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? "Update the app details below."
                                : "Add a new app to your dashboard. Press 'n' to open this modal."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="My App"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={errors.name ? "border-destructive" : ""}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>

                        {/* URL */}
                        <div className="space-y-2">
                            <Label htmlFor="url">
                                URL <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="url"
                                placeholder="https://example.com or http://localhost:3000"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className={errors.url ? "border-destructive" : ""}
                            />
                            {errors.url && (
                                <p className="text-sm text-destructive">{errors.url}</p>
                            )}
                            {url && !errors.url && (
                                <p className="text-sm text-muted-foreground">
                                    Type:{" "}
                                    {url.toLowerCase().includes("localhost") ||
                                        url.toLowerCase().includes("127.0.0.1")
                                        ? "Local"
                                        : "Web"}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="Brief description of the app"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Icon */}
                        <div className="space-y-2">
                            <Label htmlFor="icon">Icon (emoji or lucide icon name)</Label>
                            <Input
                                id="icon"
                                placeholder="🚀 or rocket"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter an emoji (🎨) or a Lucide icon name (e.g., &quot;rocket&quot;, &quot;database&quot;)
                            </p>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px]">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="gap-1">
                                        {tag}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeTag(tag)}
                                        />
                                    </Badge>
                                ))}
                                <Input
                                    id="tags"
                                    placeholder={tags.length === 0 ? "Add tags..." : ""}
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    className="flex-1 min-w-[100px] border-0 p-0 h-6 focus-visible:ring-0"
                                />
                            </div>
                            {/* Tag suggestions */}
                            {tagInput && tagSuggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tagSuggestions.slice(0, 5).map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                            onClick={() => addTag(tag)}
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pinned */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="pinned"
                                checked={isPinned}
                                onChange={(e) => setIsPinned(e.target.checked)}
                                className="h-4 w-4 rounded border-input"
                            />
                            <Label htmlFor="pinned" className="font-normal cursor-pointer">
                                Pin to top of dashboard
                            </Label>
                        </div>

                        {/* Start Command - only show for local apps */}
                        {(url.toLowerCase().includes("localhost") || url.toLowerCase().includes("127.0.0.1")) && (
                            <div className="space-y-2">
                                <Label htmlFor="startCommand">Start Command (optional)</Label>
                                <Input
                                    id="startCommand"
                                    placeholder="/path/to/start.command or /path/to/start.sh"
                                    value={startCommand}
                                    onChange={(e) => setStartCommand(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Path to .command or .sh file to start the local server
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isEditing ? "Saving..." : "Adding..."}
                                </>
                            ) : isEditing ? (
                                "Save Changes"
                            ) : (
                                "Add App"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
