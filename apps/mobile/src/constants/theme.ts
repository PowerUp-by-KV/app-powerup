import { TextStyle } from "react-native";

/**
 * Global color palette for the application.
 */
export const COLORS = {
  primary: "#4A90E2", // Blue for Grammar
  secondary: "#50E3C2", // Green for Reading
  tertiary: "#9013FE", // Purple for Listening
  quaternary: "#F5A623", // Orange for Verbal
  background: "#F8F9FA",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#A0A0A0",
  lightGray: "#E0E0E0",
  darkGray: "#4A4A4A",
  success: "#27AE60",
  error: "#EB5757",
  warning: "#F2994A",
  premium: "#D4AF37",
} as const;

/**
 * Gradient color arrays for use with LinearGradient.
 */
export const GRADIENTS = {
  grammar: ["#4A90E2", "#357ABD"],
  reading: ["#50E3C2", "#3CB371"],
  listening: ["#9013FE", "#7B1FA2"],
  verbal: ["#F5A623", "#E67E22"],
  background: ["#F8F9FA", "#E9ECEF"],
  premium: ["#FAD961", "#F76B1C"],
  quest: ["#6A11CB", "#2575FC"],
} as const;

/**
 * Base sizing constants for layout and typography.
 */
export const SIZES = {
  base: 16,
  font: 14,
  radius: 20,
  padding: 24,
  margin: 20,
} as const;

/**
 * Typography styles (font weights).
 */
export const FONTS = {
  bold: { fontWeight: "700" } as TextStyle,
  semiBold: { fontWeight: "600" } as TextStyle,
  medium: { fontWeight: "500" } as TextStyle,
  regular: { fontWeight: "400" } as TextStyle,
  light: { fontWeight: "300" } as TextStyle,
} as const;
