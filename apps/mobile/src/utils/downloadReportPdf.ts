/**
 * src/utils/downloadReportPdf.ts
 *
 * Cross-platform PDF download utility for web and React Native.
 * Handles:
 *  - Web: Direct blob download via URL.createObjectURL
 *  - Mobile: File system save + expo-sharing
 *  - Error handling & response validation
 *  - Large file optimization
 */

import { Platform } from "react-native";
import { logger } from "./logger";
import { Paths, File } from "expo-file-system";
import * as SharingModule from "expo-sharing";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DownloadResult {
  success: boolean;
  message: string;
  filePath?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const VALID_CONTENT_TYPE = "application/pdf";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// ── Web Implementation ─────────────────────────────────────────────────────────

function downloadForWeb(blob: Blob, reportId: string): DownloadResult {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Interview_Report_${reportId}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    logger.log("✅ PDF downloaded successfully on web");
    return {
      success: true,
      message: "Report downloaded successfully.",
    };
  } catch (error) {
    logger.error("Web download error:", error);
    throw new Error(`Failed to download report on web: ${String(error)}`);
  }
}

// ── Mobile Implementation ──────────────────────────────────────────────────────

async function downloadForMobile(blob: Blob, reportId: string): Promise<DownloadResult> {
  if (!Paths || !SharingModule) {
    throw new Error(
      "File system or sharing modules not available. Install expo-file-system and expo-sharing.",
    );
  }

  try {
    // Convert blob to base64
    const arrayBuffer = await blob.arrayBuffer();
    const byteArray = new Uint8Array(arrayBuffer);
    let binaryString = "";

    // Process in chunks to avoid stack overflow for large files
    const chunkSize = 8192;
    for (let i = 0; i < byteArray.length; i += chunkSize) {
      const chunk = byteArray.slice(i, i + chunkSize);
      const chunkArray = Array.from(chunk);
      binaryString += String.fromCharCode(...chunkArray);
    }

    const base64Data = btoa(binaryString);
    const fileName = `Interview_Report_${reportId}.pdf`;

    // Create file in document directory using the modern API
    const file = new File(Paths.document, fileName);

    // Write file to device storage
    await file.write(base64Data, { encoding: "base64" });

    logger.log(`✅ PDF saved to: ${file.uri}`);

    // Check if sharing is available before attempting
    const canShare = await SharingModule.isAvailableAsync();
    if (!canShare) {
      return {
        success: true,
        message: "Report saved successfully. Sharing is not available on this device.",
        filePath: file.uri,
      };
    }

    // Share the file
    await SharingModule.shareAsync(file.uri, {
      mimeType: VALID_CONTENT_TYPE,
      dialogTitle: "Share Interview Report",
      UTI: "com.adobe.pdf",
    });

    logger.log("✅ PDF shared successfully on mobile");
    return {
      success: true,
      message: "Report shared successfully.",
      filePath: file.uri,
    };
  } catch (error) {
    logger.error("Mobile download error:", error);
    throw new Error(`Failed to download report on mobile: ${String(error)}`);
  }
}

// ── Main Download Function (Cross-Platform) ────────────────────────────────────

export async function downloadReportPDF(blob: Blob, reportId: string): Promise<DownloadResult> {
  try {
    // Validate input
    if (!blob || !(blob instanceof Blob)) {
      throw new Error("Invalid blob provided.");
    }

    if (!reportId || typeof reportId !== "string") {
      throw new Error("Invalid report ID.");
    }

    // Validate blob size
    if (blob.size === 0) {
      throw new Error("Received empty PDF. Please try again.");
    }

    if (blob.size > MAX_FILE_SIZE) {
      throw new Error(
        `File too large (${(blob.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 50MB.`,
      );
    }

    logger.log(`🔄 Starting PDF download for report: ${reportId}`);

    if (Platform.OS === "web") {
      return downloadForWeb(blob, reportId);
    } else {
      return await downloadForMobile(blob, reportId);
    }
  } catch (error) {
    logger.error("PDF download error:", error);
    throw error;
  }
}

// ── Error Handler (UI Integration) ─────────────────────────────────────────────

export function handleDownloadError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred. Please try again.";
}
