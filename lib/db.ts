import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { App, AppsData } from "./types";
import { inferAppType, CreateAppInput } from "./validators";
import type { UpdateAppInput } from "./validators";

// Data file path - stored in project root /data folder
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "apps.json");

// Ensure data directory and file exist
async function ensureDataFile(): Promise<void> {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        try {
            await fs.access(DATA_FILE);
        } catch {
            // File doesn't exist, create with empty array
            await fs.writeFile(DATA_FILE, JSON.stringify({ apps: [] }, null, 2));
        }
    } catch (error) {
        console.error("Error ensuring data file:", error);
        throw error;
    }
}

// Read all apps from storage
async function readApps(): Promise<AppsData> {
    await ensureDataFile();
    try {
        const data = await fs.readFile(DATA_FILE, "utf-8");
        return JSON.parse(data) as AppsData;
    } catch (error) {
        console.error("Error reading apps:", error);
        return { apps: [] };
    }
}

// Push apps to GitHub if token is configured
async function pushToGithub(data: AppsData): Promise<void> {
    const token = process.env.GITHUB_PAT;
    const repo = process.env.GITHUB_REPO || "krisandi89/krisandi-dashboard-apps";
    const branch = process.env.GITHUB_BRANCH || "main";
    const filePath = "data/apps.json";

    if (!token) return;

    try {
        // 1. Get current file SHA
        const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "Krisandi-Dashboard"
            },
        });

        if (!getRes.ok) {
            console.error("Failed to get file SHA from GitHub:", await getRes.text());
            return;
        }

        const fileData = await getRes.json();
        const sha = fileData.sha;

        // 2. Update file
        const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
        
        const updateRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json",
                "User-Agent": "Krisandi-Dashboard"
            },
            body: JSON.stringify({
                message: "Auto update from dashboard - " + new Date().toLocaleString("id-ID"),
                content,
                sha,
                branch,
            }),
        });

        if (!updateRes.ok) {
            console.error("Failed to push to GitHub:", await updateRes.text());
        } else {
            console.log("Successfully pushed to GitHub!");
        }
    } catch (error) {
        console.error("Error pushing to GitHub:", error);
    }
}

// Write apps to storage
async function writeApps(data: AppsData): Promise<void> {
    // Try to push to GitHub first if token is available
    if (process.env.GITHUB_PAT) {
        await pushToGithub(data);
    }

    try {
        await ensureDataFile();
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        if (process.env.VERCEL) {
            console.log("On Vercel, skipping local filesystem write.");
        } else {
            throw e;
        }
    }
}

// Database abstraction layer
export const db = {
    // Get all apps
    async getAllApps(): Promise<App[]> {
        const data = await readApps();
        return data.apps;
    },

    // Get a single app by ID
    async getAppById(id: string): Promise<App | null> {
        const data = await readApps();
        return data.apps.find((app) => app.id === id) || null;
    },

    // Create a new app
    async createApp(input: CreateAppInput): Promise<App> {
        const data = await readApps();
        const now = new Date().toISOString();

        const newApp: App = {
            id: uuidv4(),
            name: input.name,
            url: input.url,
            type: inferAppType(input.url),
            tags: input.tags || [],
            description: input.description || "",
            icon: input.icon || "",
            isPinned: input.isPinned || false,
            startCommand: input.startCommand || "",
            createdAt: now,
            updatedAt: now,
        };

        data.apps.push(newApp);
        await writeApps(data);
        return newApp;
    },

    // Update an existing app
    async updateApp(id: string, input: UpdateAppInput): Promise<App | null> {
        const data = await readApps();
        const index = data.apps.findIndex((app) => app.id === id);

        if (index === -1) {
            return null;
        }

        const existingApp = data.apps[index];
        const updatedApp: App = {
            ...existingApp,
            ...input,
            // Re-infer type if URL changed
            type: input.url ? inferAppType(input.url) : existingApp.type,
            updatedAt: new Date().toISOString(),
        };

        data.apps[index] = updatedApp;
        await writeApps(data);
        return updatedApp;
    },

    // Delete an app
    async deleteApp(id: string): Promise<boolean> {
        const data = await readApps();
        const initialLength = data.apps.length;
        data.apps = data.apps.filter((app) => app.id !== id);

        if (data.apps.length === initialLength) {
            return false; // App not found
        }

        await writeApps(data);
        return true;
    },

    // Get all unique tags
    async getAllTags(): Promise<string[]> {
        const data = await readApps();
        const tagsSet = new Set<string>();
        data.apps.forEach((app) => {
            app.tags.forEach((tag) => tagsSet.add(tag));
        });
        return Array.from(tagsSet).sort();
    },

    // Bulk import apps
    async importApps(
        apps: CreateAppInput[],
        strategy: "skip" | "replace"
    ): Promise<{ imported: number; skipped: number }> {
        const data = await readApps();
        const existingUrls = new Set(data.apps.map((app) => app.url.toLowerCase()));

        let imported = 0;
        let skipped = 0;
        const now = new Date().toISOString();

        for (const input of apps) {
            const urlLower = input.url.toLowerCase();
            const exists = existingUrls.has(urlLower);

            if (exists && strategy === "skip") {
                skipped++;
                continue;
            }

            if (exists && strategy === "replace") {
                // Find and update existing
                const index = data.apps.findIndex(
                    (app) => app.url.toLowerCase() === urlLower
                );
                if (index !== -1) {
                    data.apps[index] = {
                        ...data.apps[index],
                        name: input.name,
                        tags: input.tags || [],
                        description: input.description || "",
                        icon: input.icon || "",
                        isPinned: input.isPinned || false,
                        type: inferAppType(input.url),
                        updatedAt: now,
                    };
                    imported++;
                }
            } else {
                // Create new app
                const newApp: App = {
                    id: uuidv4(),
                    name: input.name,
                    url: input.url,
                    type: inferAppType(input.url),
                    tags: input.tags || [],
                    description: input.description || "",
                    icon: input.icon || "",
                    isPinned: input.isPinned || false,
                    startCommand: input.startCommand || "",
                    createdAt: now,
                    updatedAt: now,
                };
                data.apps.push(newApp);
                existingUrls.add(urlLower);
                imported++;
            }
        }

        await writeApps(data);
        return { imported, skipped };
    },

    // Export all apps (strips internal fields for clean export)
    async exportApps(): Promise<App[]> {
        const data = await readApps();
        return data.apps;
    },
};
