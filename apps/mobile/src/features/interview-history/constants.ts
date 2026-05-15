/**
 * Interview History - Shared Constants
 * Centralised status configuration and date formatting utilities
 */

import type { ComponentProps } from "react";
import type { MaterialIcons } from "@expo/vector-icons";

// ---------- Status Configuration ----------

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  completed: {
    label: "Completed",
    color: "#15803d",
    bg: "#dcfce7",
    icon: "check-circle",
  },
  in_progress: {
    label: "In Progress",
    color: "#b45309",
    bg: "#fef3c7",
    icon: "access-time",
  },
  default: {
    label: "Unknown",
    color: "#6b7280",
    bg: "#f3f4f6",
    icon: "help-outline",
  },
};

/**
 * Resolves a status string to the matching StatusConfig entry.
 * Falls back to `STATUS_CONFIG.default` for unknown statuses.
 */
export function getStatusConfig(status?: string): StatusConfig {
  const key = status?.toLowerCase().replace(/\s+/g, "_") || "default";
  return STATUS_CONFIG[key] || STATUS_CONFIG.default;
}

// ---------- Date Formatting ----------

/**
 * Formats a date string for the session list view.
 * Uses the device locale (no hardcoded locale).
 */
export function formatSessionDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats a date string for the session detail header.
 * Uses the device locale (no hardcoded locale).
 */
export function formatDetailDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
