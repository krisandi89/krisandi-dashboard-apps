import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { importAppsSchema } from "@/lib/validators";
import { ZodError } from "zod";

// POST /api/apps/import - Import apps from JSON
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = importAppsSchema.parse(body);

        const result = await db.importApps(validated.apps, validated.strategy);

        return NextResponse.json({
            success: true,
            imported: result.imported,
            skipped: result.skipped,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error: "Invalid import data",
                    code: "VALIDATION_ERROR",
                    details: error.issues
                },
                { status: 400 }
            );
        }
        console.error("Error importing apps:", error);
        return NextResponse.json(
            { error: "Failed to import apps", code: "IMPORT_ERROR" },
            { status: 500 }
        );
    }
}
