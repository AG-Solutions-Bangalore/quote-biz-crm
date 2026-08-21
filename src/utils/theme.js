// Theme management utility for dynamic brand colors

export const THEME_PRESETS = [
  { id: "blue", name: "Corporate Blue", primary: "#2563eb", hover: "#1d4ed8", light: "#eff6ff", border: "#bfdbfe" },
  { id: "indigo", name: "Royal Indigo", primary: "#4f46e5", hover: "#4338ca", light: "#eef2ff", border: "#c7d2fe" },
  { id: "purple", name: "Vibrant Purple", primary: "#7c3aed", hover: "#6d28d9", light: "#f5f3ff", border: "#ddd6fe" },
  { id: "emerald", name: "Emerald Green", primary: "#059669", hover: "#047857", light: "#ecfdf5", border: "#a7f3d0" },
  { id: "teal", name: "Deep Teal", primary: "#0d9488", hover: "#0f766e", light: "#f0fdfa", border: "#99f6e4" },
  { id: "orange", name: "Sunset Orange", primary: "#ea580c", hover: "#c2410c", light: "#fff7ed", border: "#fed7aa" },
  { id: "amber", name: "Warm Amber", primary: "#d97706", hover: "#b45309", light: "#fffbeb", border: "#fde68a" },
  { id: "rose", name: "Crimson Rose", primary: "#e11d48", hover: "#be123c", light: "#fff1f2", border: "#fecdd3" },
  { id: "slate", name: "Charcoal Slate", primary: "#334155", hover: "#1e293b", light: "#f8fafc", border: "#cbd5e1" },
  { id: "sky", name: "Sky Blue", primary: "#0284c7", hover: "#0369a1", light: "#f0f9ff", border: "#bae6fd" },
];

export const DEFAULT_THEME = THEME_PRESETS[0];

// Helper to convert hex to RGB
function hexToRgb(hex) {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex.length === 3 ? cleanHex.split("").map((c) => c + c).join("") : cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Helper to lighten/darken hex color
function adjustColorBrightness(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 + percent / 100;
  const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)));
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}

// Generate complete palette from any hex color
export function generateThemeFromHex(primaryHex, name = "Custom Brand") {
  const hoverHex = adjustColorBrightness(primaryHex, -15);
  const { r, g, b } = hexToRgb(primaryHex);
  const lightHex = `rgba(${r}, ${g}, ${b}, 0.1)`;
  const borderHex = `rgba(${r}, ${g}, ${b}, 0.25)`;

  return {
    id: "custom",
    name,
    primary: primaryHex,
    hover: hoverHex,
    light: lightHex,
    border: borderHex,
  };
}

// Apply theme dynamically to DOM
export function applyTheme(themeOrHex) {
  if (typeof window === "undefined") return;

  let theme;
  if (typeof themeOrHex === "string") {
    const preset = THEME_PRESETS.find((p) => p.primary.toLowerCase() === themeOrHex.toLowerCase());
    theme = preset || generateThemeFromHex(themeOrHex);
  } else {
    theme = themeOrHex || DEFAULT_THEME;
  }

  // Save to localStorage
  try {
    localStorage.setItem("app_brand_theme", JSON.stringify(theme));
  } catch (e) {
    console.warn("Could not save theme to localStorage:", e);
  }

  // Inject or update dynamic style tag
  let styleTag = document.getElementById("dynamic-brand-theme");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "dynamic-brand-theme";
    document.head.appendChild(styleTag);
  }

  const { primary, hover, light, border } = theme;
  const rgb = hexToRgb(primary);

  styleTag.textContent = `
    :root {
      --brand-primary: ${primary};
      --brand-hover: ${hover};
      --brand-light: ${light};
      --brand-border: ${border};
      --brand-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};
    }

    /* Brand Background Colors */
    .bg-blue-600, .bg-blue-500, .bg-blue-400 {
      background-color: var(--brand-primary) !important;
    }

    /* Brand Hover States */
    .hover\\:bg-blue-700:hover, .hover\\:bg-blue-600:hover, .hover\\:bg-blue-500:hover, .hover\\:bg-blue-800:hover {
      background-color: var(--brand-hover) !important;
    }

    /* Brand Text Colors */
    .text-blue-600, .text-blue-500, .text-blue-700 {
      color: var(--brand-primary) !important;
    }

    /* Brand Border Colors */
    .border-blue-600, .border-blue-500, .border-blue-400 {
      border-color: var(--brand-primary) !important;
    }

    /* Brand Light/Tint Backgrounds */
    .bg-blue-50, .bg-blue-100, .bg-blue-200 {
      background-color: var(--brand-light) !important;
    }

    /* Brand Light Borders */
    .border-blue-200, .border-blue-300 {
      border-color: var(--brand-border) !important;
    }

    /* Active navigation indicator / custom elements */
    .brand-accent-bg {
      background-color: var(--brand-primary) !important;
    }
    .brand-accent-text {
      color: var(--brand-primary) !important;
    }
    .brand-accent-border {
      border-color: var(--brand-primary) !important;
    }
  `;

  return theme;
}

// Get saved theme from localStorage
export function getSavedTheme() {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const saved = localStorage.getItem("app_brand_theme");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Could not read theme from localStorage:", e);
  }
  return DEFAULT_THEME;
}

// Reset theme back to default
export function resetTheme() {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    localStorage.removeItem("app_brand_theme");
  } catch (e) {
    console.warn("Could not remove theme from localStorage:", e);
  }
  return applyTheme(DEFAULT_THEME);
}

// Initialize theme on page load
export function initTheme() {
  const savedTheme = getSavedTheme();
  return applyTheme(savedTheme);
}
