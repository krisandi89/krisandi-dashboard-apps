import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/apps/export - Export all apps as JSON
export async function GET() {
    try {
        const apps = await db.exportApps();

        return new NextResponse(JSON.stringify({ apps }, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="krisandi-apps-export-${new Date().toISOString().split("T")[0]}.json"`,
            },
        });
    } catch (error) {
        console.error("Error exporting apps:", error);
        return NextResponse.json(
            { error: "Failed to export apps", code: "EXPORT_ERROR" },
            { status: 500 }
        );
    }
}
