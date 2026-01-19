import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { db } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

const execAsync = promisify(exec);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/apps/[id]/start - Start the server for a local app
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const app = await db.getAppById(id);

        if (!app) {
            return NextResponse.json(
                { error: "App not found", code: "NOT_FOUND" },
                { status: 404 }
            );
        }

        if (!app.startCommand) {
            return NextResponse.json(
                { error: "No start command configured for this app", code: "NO_COMMAND" },
                { status: 400 }
            );
        }

        // Verify the file exists
        try {
            console.log(`Checking access for path: "${app.startCommand}"`);
            await fs.access(app.startCommand);
            console.log("Access successful");
        } catch (err) {
            console.error(`Failed to access path: "${app.startCommand}"`, err);
            return NextResponse.json(
                { error: `Start command file not found at: ${app.startCommand}`, code: "FILE_NOT_FOUND" },
                { status: 404 }
            );
        }
        // Get the directory of the command file to use as cwd
        const commandDir = path.dirname(app.startCommand);
        const commandFile = app.startCommand;

        // Execute the command using 'open' for .command files on macOS
        // This opens the file in Terminal, which is the expected behavior
        if (commandFile.endsWith(".command")) {
            await execAsync(`open "${commandFile}"`);
        } else if (commandFile.endsWith(".sh")) {
            // For shell scripts, execute directly
            await execAsync(`chmod +x "${commandFile}" && "${commandFile}"`, {
                cwd: commandDir,
            });
        } else {
            // Try to execute as a generic command
            await execAsync(commandFile, { cwd: commandDir });
        }

        return NextResponse.json({
            success: true,
            message: `Started server for ${app.name}`
        });
    } catch (error) {
        console.error("Error starting app:", error);
        return NextResponse.json(
            {
                error: "Failed to start server",
                code: "START_ERROR",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
