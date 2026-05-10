// =============================================================================
// SL HUB COMPUTER - Apply Theme Utility
// =============================================================================
// Purpose: Apply theme configuration to document root CSS custom properties
// Features:
//   - Maps theme config to CSS variables: --primary, --accent, --header-bg,
//     --radius, --card-style, --font-family
//   - Called on app mount and when theme changes
//   - Persist theme in localStorage for instant load
//   - Load Google Fonts dynamically
// =============================================================================

import { ThemeConfig, defaultTheme, getGoogleFontUrl } from "./theme-config";

const THEME_STORAGE_KEY = "slhub-theme-config";

// ---------------------------------------------------------------------------
// Apply theme to document root CSS custom properties
// ---------------------------------------------------------------------------
export function applyTheme(config: ThemeConfig): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Apply CSS custom properties
  root.style.setProperty("--primary", config.primaryColor);
  root.style.setProperty("--accent", config.accentColor);
  root.style.setProperty("--header-bg", config.headerBgColor);
  root.style.setProperty("--radius", `${config.buttonRadius}px`);
  root.style.setProperty("--card-style", config.cardStyle);

  // Button style mapping to border radius
  let buttonRadius = `${config.buttonRadius}px`;
  if (config.buttonStyle === "pill") {
    buttonRadius = "9999px";
  } else if (config.buttonStyle === "sharp") {
    buttonRadius = "0px";
  }
  root.style.setProperty("--button-radius", buttonRadius);
  root.style.setProperty("--button-style", config.buttonStyle);

  // Font family
  root.style.setProperty("--font-family", config.fontFamily);
  document.body.style.fontFamily = `'${config.fontFamily}', sans-serif`;

  // Load Google Font dynamically
  loadGoogleFont(config.fontFamily);

  // Apply card style classes
  applyCardStyle(config.cardStyle);

  // Persist to localStorage
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage may not be available
  }
}

// ---------------------------------------------------------------------------
// Load Google Font dynamically
// ---------------------------------------------------------------------------
function loadGoogleFont(fontFamily: string): void {
  if (typeof document === "undefined") return;

  const linkId = "slhub-google-font";

  // Remove existing font link if any
  const existing = document.getElementById(linkId);
  if (existing) {
    existing.remove();
  }

  // Create new font link
  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = getGoogleFontUrl(fontFamily);
  document.head.appendChild(link);
}

// ---------------------------------------------------------------------------
// Apply card style via data attribute
// ---------------------------------------------------------------------------
function applyCardStyle(cardStyle: string): void {
  if (typeof document === "undefined") return;

  document.documentElement.setAttribute("data-card-style", cardStyle);
}

// ---------------------------------------------------------------------------
// Load theme from localStorage (for instant load before API)
// ---------------------------------------------------------------------------
export function loadThemeFromStorage(): ThemeConfig | null {
  if (typeof localStorage === "undefined") return null;

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ThemeConfig;
    }
  } catch {
    // Invalid JSON or localStorage not available
  }

  return null;
}

// ---------------------------------------------------------------------------
// Clear stored theme
// ---------------------------------------------------------------------------
export function clearStoredTheme(): void {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

// ---------------------------------------------------------------------------
// Reset theme to default
// ---------------------------------------------------------------------------
export function resetTheme(): void {
  applyTheme(defaultTheme);
}

// ---------------------------------------------------------------------------
// Generate CSS variables string for server-side rendering
// ---------------------------------------------------------------------------
export function generateThemeCSS(config: ThemeConfig): string {
  let buttonRadius = `${config.buttonRadius}px`;
  if (config.buttonStyle === "pill") {
    buttonRadius = "9999px";
  } else if (config.buttonStyle === "sharp") {
    buttonRadius = "0px";
  }

  return `
    :root {
      --primary: ${config.primaryColor};
      --accent: ${config.accentColor};
      --header-bg: ${config.headerBgColor};
      --radius: ${config.buttonRadius}px;
      --button-radius: ${buttonRadius};
      --button-style: ${config.buttonStyle};
      --card-style: ${config.cardStyle};
      --font-family: '${config.fontFamily}', sans-serif;
    }
  `;
}

// ---------------------------------------------------------------------------
// Generate card style CSS for injection
// ---------------------------------------------------------------------------
export function generateCardStyleCSS(): string {
  return `
    [data-card-style="flat"] .card-themed {
      border: none;
      box-shadow: none;
      background: transparent;
    }
    [data-card-style="bordered"] .card-themed {
      border: 1px solid var(--border);
      box-shadow: none;
    }
    [data-card-style="shadowed"] .card-themed {
      border: none;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    }
  `;
}
