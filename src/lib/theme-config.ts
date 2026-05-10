// =============================================================================
// SL HUB COMPUTER - Theme Configuration
// =============================================================================
// Purpose: Define theme presets and configuration types for the store
// Features:
//   - Multiple theme presets (Gaming Dark, Professional Light, Neon Cyber, Minimal Clean)
//   - Each preset includes: primaryColor, accentColor, bgColor, cardBg, headerBg,
//     buttonStyle, borderRadius, fontFamily
//   - Theme config type used across the application
// =============================================================================

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  headerBgColor: string;
  buttonRadius: number;
  buttonStyle: "rounded" | "sharp" | "pill";
  fontFamily: "Inter" | "Poppins" | "Roboto" | "Montserrat" | "Space Grotesk";
  cardStyle: "flat" | "bordered" | "shadowed";
}

export interface ThemePreset {
  name: string;
  description: string;
  config: ThemeConfig;
}

// ---------------------------------------------------------------------------
// Default Theme (Gaming Dark)
// ---------------------------------------------------------------------------
export const defaultTheme: ThemeConfig = {
  primaryColor: "#059669",
  accentColor: "#f59e0b",
  headerBgColor: "#0f172a",
  buttonRadius: 8,
  buttonStyle: "rounded",
  fontFamily: "Inter",
  cardStyle: "shadowed",
};

// ---------------------------------------------------------------------------
// Theme Presets
// ---------------------------------------------------------------------------
export const themePresets: ThemePreset[] = [
  {
    name: "Gaming Dark",
    description: "Deep dark theme with emerald accents — great for gaming stores",
    config: {
      primaryColor: "#059669",
      accentColor: "#f59e0b",
      headerBgColor: "#0f172a",
      buttonRadius: 8,
      buttonStyle: "rounded",
      fontFamily: "Inter",
      cardStyle: "shadowed",
    },
  },
  {
    name: "Professional Light",
    description: "Clean and professional with teal accents — ideal for business",
    config: {
      primaryColor: "#0d9488",
      accentColor: "#6366f1",
      headerBgColor: "#ffffff",
      buttonRadius: 6,
      buttonStyle: "rounded",
      fontFamily: "Roboto",
      cardStyle: "bordered",
    },
  },
  {
    name: "Neon Cyber",
    description: "Vibrant neon colors on dark backgrounds — cyberpunk inspired",
    config: {
      primaryColor: "#a855f7",
      accentColor: "#06b6d4",
      headerBgColor: "#0a0a1a",
      buttonRadius: 12,
      buttonStyle: "pill",
      fontFamily: "Space Grotesk",
      cardStyle: "shadowed",
    },
  },
  {
    name: "Minimal Clean",
    description: "Minimalist design with soft tones — elegant and simple",
    config: {
      primaryColor: "#18181b",
      accentColor: "#f97316",
      headerBgColor: "#fafafa",
      buttonRadius: 4,
      buttonStyle: "sharp",
      fontFamily: "Montserrat",
      cardStyle: "flat",
    },
  },
];

// ---------------------------------------------------------------------------
// Font Options
// ---------------------------------------------------------------------------
export const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Roboto", label: "Roboto" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Space Grotesk", label: "Space Grotesk" },
] as const;

// ---------------------------------------------------------------------------
// Button Style Options
// ---------------------------------------------------------------------------
export const buttonStyleOptions = [
  { value: "rounded", label: "Rounded" },
  { value: "sharp", label: "Sharp" },
  { value: "pill", label: "Pill" },
] as const;

// ---------------------------------------------------------------------------
// Card Style Options
// ---------------------------------------------------------------------------
export const cardStyleOptions = [
  { value: "flat", label: "Flat" },
  { value: "bordered", label: "Bordered" },
  { value: "shadowed", label: "Shadowed" },
] as const;

// ---------------------------------------------------------------------------
// Google Fonts URL builder
// ---------------------------------------------------------------------------
export function getGoogleFontUrl(fontFamily: string): string {
  const fontMap: Record<string, string> = {
    Inter: "Inter:wght@400;500;600;700",
    Poppins: "Poppins:wght@400;500;600;700",
    Roboto: "Roboto:wght@400;500;700",
    Montserrat: "Montserrat:wght@400;500;600;700",
    "Space Grotesk": "Space+Grotesk:wght@400;500;600;700",
  };
  const font = fontMap[fontFamily] || fontMap["Inter"];
  return `https://fonts.googleapis.com/css2?family=${font}&display=swap`;
}
