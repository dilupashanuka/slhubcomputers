// =============================================================================
// SL HUB COMPUTER - Hello API Route
// =============================================================================
// Purpose: Health check endpoint to verify API is running
// Returns: JSON with status and site info
// =============================================================================

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    site: "SL HUB COMPUTER",
    tagline: "Your Trusted Tech Partner",
    version: "2.0.0",
  });
}
