/**
 * PDF File Picker Service
 * Handles PDF selection, validation, and parsing
 * Supports mobile (Expo DocumentPicker) and web
 */

import * as DocumentPicker from "expo-document-picker";
import { Platform, Alert } from "react-native";

export interface PDFFile {
  name: string;
  size: number;
  mimeType?: string;
  uri: string;
}

export interface PDFValidationError {
  type: "size" | "format" | "unknown";
  message: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_MIME_TYPES = ["application/pdf"];
const ALLOWED_EXTENSIONS = [".pdf"];

/**
 * Validate PDF file
 */
export function validatePDF(file: PDFFile): PDFValidationError | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      type: "size",
      message: `File size must be less than 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  // Check file format by extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return {
      type: "format",
      message: "Invalid file format. Please select a PDF file.",
    };
  }

  // Check MIME type if available
  if (file.mimeType && !ALLOWED_MIME_TYPES.includes(file.mimeType)) {
    return {
      type: "format",
      message: "Invalid file format. Only PDF files are allowed.",
    };
  }

  return null;
}

/**
 * Pick and validate PDF file
 */
export async function pickPDFFile(): Promise<PDFFile | PDFValidationError | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    // User cancelled
    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];

    // Convert to our interface
    const pdfFile: PDFFile = {
      name: file.name,
      size: file.size || 0,
      mimeType: file.mimeType,
      uri: file.uri,
    };

    // Validate
    const validationError = validatePDF(pdfFile);
    if (validationError) {
      return validationError;
    }

    return pdfFile;
  } catch (error) {
    console.error("PDF picker error:", error);
    return {
      type: "unknown",
      message: "Failed to pick file. Please try again.",
    };
  }
}

/**
 * Show error alert for validation failures
 */
export function showPDFError(error: PDFValidationError): void {
  const title =
    error.type === "size"
      ? "File Too Large"
      : error.type === "format"
        ? "Invalid File Format"
        : "Error";

  Alert.alert(title, error.message, [
    {
      text: "Try Again",
      style: "default",
    },
  ]);
}

/**
 * Parse PDF text (placeholder - requires backend or library)
 * For production, use: react-native-pdf, pdfjs-dist, or backend API
 */
export async function parsePDFText(fileUri: string): Promise<string> {
  // TODO: Implement with pdf parsing library
  // For now, return placeholder
  console.log("PDF parsing for:", fileUri);

  // Options:
  // 1. Send to backend for parsing
  // 2. Use pdfjs-dist (web only)
  // 3. Use react-native-pdf (requires native modules)

  return "PDF text extraction coming soon. Send file to backend API.";
}
