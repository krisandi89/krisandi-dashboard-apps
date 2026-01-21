import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// POST /api/deploy - Auto commit and push to trigger Vercel deployment
export async function POST() {
    // Only allow in development/localhost
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { error: "Deploy is only available in localhost", code: "PRODUCTION_NOT_ALLOWED" },
            { status: 403 }
        );
    }

    try {
        const projectPath = process.cwd();

        // Git add all changes
        await execAsync("git add .", { cwd: projectPath });

        // Git commit with timestamp
        const timestamp = new Date().toLocaleString("id-ID", {
            dateStyle: "short",
            timeStyle: "short"
        });
        const commitMessage = `Auto update from dashboard - ${timestamp}`;

        try {
            await execAsync(`git commit -m "${commitMessage}"`, { cwd: projectPath });
        } catch (commitError: unknown) {
            // Check if there's nothing to commit
            const error = commitError as { stderr?: string };
            if (error.stderr?.includes("nothing to commit")) {
                return NextResponse.json(
                    { error: "No changes to deploy", code: "NO_CHANGES" },
                    { status: 400 }
                );
            }
            throw commitError;
        }

        // Git push
        const { stdout, stderr } = await execAsync("git push origin main", { cwd: projectPath });

        return NextResponse.json({
            success: true,
            message: "Changes pushed to GitHub. Vercel will auto-deploy.",
            commitMessage,
            output: stdout || stderr
        });

    } catch (error) {
        console.error("Deploy error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to deploy", details: errorMessage, code: "DEPLOY_ERROR" },
            { status: 500 }
        );
    }
}
