/**
 * Resume Templates Configuration
 * Different resume layout styles
 */

export type TemplateStyle = "modern" | "classic" | "minimal" | "executive";

export interface Template {
  id: TemplateStyle;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    lightText: string;
    background: string;
  };
}

export const RESUME_TEMPLATES: Record<TemplateStyle, Template> = {
  modern: {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with bold colors",
    colors: {
      primary: "#0066cc",
      secondary: "#e8f0ff",
      accent: "#00cc88",
      text: "#1a1a1a",
      lightText: "#666666",
      background: "#ffffff",
    },
  },
  classic: {
    id: "classic",
    name: "Classic",
    description: "Traditional professional layout",
    colors: {
      primary: "#1a1a1a",
      secondary: "#f5f5f5",
      accent: "#333333",
      text: "#000000",
      lightText: "#555555",
      background: "#ffffff",
    },
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple design",
    colors: {
      primary: "#444444",
      secondary: "#f0f0f0",
      accent: "#888888",
      text: "#333333",
      lightText: "#777777",
      background: "#ffffff",
    },
  },
  executive: {
    id: "executive",
    name: "Executive",
    description: "Premium business style",
    colors: {
      primary: "#1a3a52",
      secondary: "#d4e6f1",
      accent: "#d4a574",
      text: "#1a3a52",
      lightText: "#5a6c7d",
      background: "#ffffff",
    },
  },
};

export const TEMPLATE_LIST = Object.values(RESUME_TEMPLATES);
