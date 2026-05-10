// =============================================================================
// SL HUB COMPUTER - Dashboard Layout API
// =============================================================================
// GET: Fetch saved dashboard layout
// PUT: Save dashboard layout
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

// In-memory storage for dashboard layout (could be moved to DB/SiteSettings)
let savedLayout: any = null;

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: savedLayout,
    });
  } catch (error) {
    console.error("Dashboard layout GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard layout" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    savedLayout = {
      widgets: body.widgets,
      lastUpdated: new Date().toISOString(),
    };
    return NextResponse.json({
      success: true,
      data: savedLayout,
    });
  } catch (error) {
    console.error("Dashboard layout PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save dashboard layout" },
      { status: 500 }
    );
  }
}
