import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/tags - Get all unique tags
export async function GET() {
    try {
        const tags = await db.getAllTags();
        return NextResponse.json({ tags });
    } catch (error) {
        console.error("Error fetching tags:", error);
        return NextResponse.json(
            { error: "Failed to fetch tags", code: "FETCH_ERROR" },
            { status: 500 }
        );
    }
}
