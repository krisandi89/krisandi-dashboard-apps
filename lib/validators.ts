import { z } from "zod";

// URL validation that also infers type
const urlSchema = z.string().url("Must be a valid URL");

// Infer app type from URL
export function inferAppType(url: string): "web" | "local" {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("localhost") || lowerUrl.includes("127.0.0.1")) {
        return "local";
    }
    return "web";
}

// Create app validation schema
export const createAppSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must be 100 characters or less"),
    url: urlSchema,
    tags: z.array(z.string()).optional().default([]),
    description: z.string().max(500, "Description must be 500 characters or less").optional().default(""),
    icon: z.string().max(50, "Icon must be 50 characters or less").optional().default(""),
    isPinned: z.boolean().optional().default(false),
    startCommand: z.string().max(500, "Start command path must be 500 characters or less").optional().default(""),
});

// Update app validation schema - all fields optional
export const updateAppSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must be 100 characters or less")
        .optional(),
    url: urlSchema.optional(),
    tags: z.array(z.string()).optional(),
    description: z.string().max(500, "Description must be 500 characters or less").optional(),
    icon: z.string().max(50, "Icon must be 50 characters or less").optional(),
    isPinned: z.boolean().optional(),
    startCommand: z.string().max(500, "Start command path must be 500 characters or less").optional(),
});

// Import schema
export const importAppsSchema = z.object({
    apps: z.array(z.object({
        name: z.string(),
        url: z.string().url(),
        tags: z.array(z.string()).optional().default([]),
        description: z.string().optional().default(""),
        icon: z.string().optional().default(""),
        isPinned: z.boolean().optional().default(false),
        startCommand: z.string().optional().default(""),
    })),
    strategy: z.enum(["skip", "replace"]).default("skip"),
});

export type CreateAppInput = z.infer<typeof createAppSchema>;
export type UpdateAppInput = z.infer<typeof updateAppSchema>;
export type ImportAppsInput = z.infer<typeof importAppsSchema>;
