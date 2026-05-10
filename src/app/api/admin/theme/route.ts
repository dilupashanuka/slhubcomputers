// =============================================================================
// SL HUB COMPUTER - Theme Configuration API
// =============================================================================
// Purpose: API endpoints for theme customization
// Features:
//   - GET: Fetch current theme configuration
//   - PUT: Update theme configuration
//   - Theme fields: primaryColor, accentColor, headerBgColor, buttonRadius,
//     buttonStyle, fontFamily, cardStyle
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/theme - Fetch current theme configuration
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: "site-settings" },
      select: {
        primaryColor: true,
        accentColor: true,
        headerBgColor: true,
        buttonRadius: true,
        buttonStyle: true,
        fontFamily: true,
        cardStyle: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings || {
        primaryColor: "#059669",
        accentColor: "#f59e0b",
        headerBgColor: "#0f172a",
        buttonRadius: 8,
        buttonStyle: "rounded",
        fontFamily: "Inter",
        cardStyle: "shadowed",
      },
    });
  } catch (error) {
    console.error("Theme fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch theme configuration" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/theme - Update theme configuration
// ---------------------------------------------------------------------------
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate and sanitize theme fields
    const allowedFields = [
      "primaryColor",
      "accentColor",
      "headerBgColor",
      "buttonRadius",
      "buttonStyle",
      "fontFamily",
      "cardStyle",
    ];

    const themeData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        themeData[field] = body[field];
      }
    }

    // Validate specific fields
    if (themeData.buttonRadius !== undefined) {
      const radius = Number(themeData.buttonRadius);
      if (isNaN(radius) || radius < 0 || radius > 16) {
        return NextResponse.json(
          { success: false, error: "Button radius must be between 0 and 16" },
          { status: 400 }
        );
      }
      themeData.buttonRadius = radius;
    }

    if (themeData.buttonStyle !== undefined) {
      const validStyles = ["rounded", "sharp", "pill"];
      if (!validStyles.includes(String(themeData.buttonStyle))) {
        return NextResponse.json(
          { success: false, error: "Invalid button style" },
          { status: 400 }
        );
      }
    }

    if (themeData.fontFamily !== undefined) {
      const validFonts = ["Inter", "Poppins", "Roboto", "Montserrat", "Space Grotesk"];
      if (!validFonts.includes(String(themeData.fontFamily))) {
        return NextResponse.json(
          { success: false, error: "Invalid font family" },
          { status: 400 }
        );
      }
    }

    if (themeData.cardStyle !== undefined) {
      const validStyles = ["flat", "bordered", "shadowed"];
      if (!validStyles.includes(String(themeData.cardStyle))) {
        return NextResponse.json(
          { success: false, error: "Invalid card style" },
          { status: 400 }
        );
      }
    }

    // Upsert theme settings
    const settings = await db.siteSettings.upsert({
      where: { id: "site-settings" },
      update: themeData,
      create: { id: "site-settings", ...themeData },
    });

    return NextResponse.json({
      success: true,
      data: {
        primaryColor: settings.primaryColor,
        accentColor: settings.accentColor,
        headerBgColor: settings.headerBgColor,
        buttonRadius: settings.buttonRadius,
        buttonStyle: settings.buttonStyle,
        fontFamily: settings.fontFamily,
        cardStyle: settings.cardStyle,
      },
    });
  } catch (error) {
    console.error("Theme update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update theme configuration" },
      { status: 500 }
    );
  }
}
