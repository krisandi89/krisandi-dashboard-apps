import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAppSchema } from "@/lib/validators";
import { ZodError } from "zod";

// GET /api/apps - Get all apps
export async function GET() {
    try {
        const apps = await db.getAllApps();
        return NextResponse.json({ apps });
    } catch (error) {
        console.error("Error fetching apps:", error);
        return NextResponse.json(
            { error: "Failed to fetch apps", code: "FETCH_ERROR" },
            { status: 500 }
        );
    }
}

// POST /api/apps - Create a new app
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = createAppSchema.parse(body);
        const app = await db.createApp(validated);
        return NextResponse.json({ app }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    code: "VALIDATION_ERROR",
                    details: error.issues
                },
                { status: 400 }
            );
        }
        console.error("Error creating app:", error);
        return NextResponse.json(
            { error: "Failed to create app", code: "CREATE_ERROR" },
            { status: 500 }
        );
    }
}
