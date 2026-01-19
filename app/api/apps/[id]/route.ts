import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateAppSchema } from "@/lib/validators";
import { ZodError } from "zod";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/apps/[id] - Get a single app
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const app = await db.getAppById(id);

        if (!app) {
            return NextResponse.json(
                { error: "App not found", code: "NOT_FOUND" },
                { status: 404 }
            );
        }

        return NextResponse.json({ app });
    } catch (error) {
        console.error("Error fetching app:", error);
        return NextResponse.json(
            { error: "Failed to fetch app", code: "FETCH_ERROR" },
            { status: 500 }
        );
    }
}

// PATCH /api/apps/[id] - Update an app
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validated = updateAppSchema.parse(body);

        const app = await db.updateApp(id, validated);

        if (!app) {
            return NextResponse.json(
                { error: "App not found", code: "NOT_FOUND" },
                { status: 404 }
            );
        }

        return NextResponse.json({ app });
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
        console.error("Error updating app:", error);
        return NextResponse.json(
            { error: "Failed to update app", code: "UPDATE_ERROR" },
            { status: 500 }
        );
    }
}

// DELETE /api/apps/[id] - Delete an app
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const deleted = await db.deleteApp(id);

        if (!deleted) {
            return NextResponse.json(
                { error: "App not found", code: "NOT_FOUND" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting app:", error);
        return NextResponse.json(
            { error: "Failed to delete app", code: "DELETE_ERROR" },
            { status: 500 }
        );
    }
}
