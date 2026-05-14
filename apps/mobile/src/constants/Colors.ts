/**
 * Common color palette for the Learning Platform application.
 * This structure supports both Light and Dark themes and follows modern UI design principles.
 *
 * Usage:
 * import { Colors } from '../theme/colors';
 * const theme = isDarkMode ? Colors.dark : Colors.light;
 */

const palette = {
  primary: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1", // Main Indigo
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
  },
  secondary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b", // Main Slate
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  accent: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6", // Main Teal
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
  },
  error: {
    500: "#ef4444",
  },
  warning: {
    500: "#f59e0b",
  },
  info: {
    500: "#3b82f6",
  },
  success: {
    500: "#22c55e",
  },
};

export const Colors = {
  palette, // Export raw palette for specialized use cases
  light: {
    primary: palette.primary[500],
    primaryLight: palette.primary[100],
    primaryDark: palette.primary[700],

    secondary: palette.secondary[500],
    secondaryLight: palette.secondary[100],
    secondaryDark: palette.secondary[700],

    accent: palette.accent[500],

    background: "#ffffff",
    surface: "#f8fafc",
    card: "#ffffff",

    text: "#0f172a",
    textSecondary: "#64748b",
    textMuted: "#94a3b8",

    border: "#e2e8f0",
    divider: "#f1f5f9",

    error: palette.error[500],
    warning: palette.warning[500],
    info: palette.info[500],
    success: palette.success[500],

    white: "#ffffff",
    black: "#000000",
    transparent: "transparent",
  },
  dark: {
    primary: palette.primary[400],
    primaryLight: palette.primary[800],
    primaryDark: palette.primary[300],

    secondary: palette.secondary[400],
    secondaryLight: palette.secondary[800],
    secondaryDark: palette.secondary[300],

    accent: palette.accent[400],

    background: "#0f172a",
    surface: "#1e293b",
    card: "#1e293b",

    text: "#f1f5f9",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",

    border: "#334155",
    divider: "#1e293b",

    error: palette.error[500],
    warning: palette.warning[500],
    info: palette.info[500],
    success: palette.success[500],

    white: "#ffffff",
    black: "#000000",
    transparent: "transparent",
  },
};

export const Gradients = {
  // Activity / Card Gradients
  primary: [palette.secondary[600], palette.secondary[400]] as const, // ["#475569", "#94a3b8"]
  secondary: [palette.secondary[800], palette.secondary[600]] as const, // ["#1E293B", "#475569"]
  tertiary: [palette.secondary[700], palette.secondary[500]] as const, // ["#334155", "#64748B"]
  quaternary: [palette.secondary[500], palette.secondary[300]] as const, // ["#64748B", "#CBD5E1"]

  // Sub-module specific
  subPrimary: [palette.secondary[600], palette.secondary[500]] as const, // ["#475569", "#64748B"]
  subSecondary: [palette.secondary[700], palette.secondary[600]] as const, // ["#334155", "#475569"]
  subTertiary: [palette.secondary[800], palette.secondary[700]] as const, // ["#1E293B", "#334155"]
  subQuaternary: [palette.secondary[500], palette.secondary[400]] as const, // ["#64748B", "#94A3B8"]
};

export default Colors;
