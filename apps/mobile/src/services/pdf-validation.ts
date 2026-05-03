/**
 * PDF File Validation Service
 * Validates PDF files for format, size, and other constraints
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  uri: string;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["application/pdf"];
const ALLOWED_EXTENSIONS = [".pdf"];

/**
 * Validate file type (must be PDF)
 */
function validateFileType(mimeType: string, fileName: string): ValidationResult {
  const fileExtension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      isValid: false,
      error: `Invalid file format. Only PDF files are allowed. You selected: ${mimeType}`,
    };
  }

  // Check file extension
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Invalid file extension. Only .pdf files are allowed. You selected: ${fileExtension}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate file size (must be ≤ 5MB)
 */
function validateFileSize(sizeInBytes: number): ValidationResult {
  if (sizeInBytes > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File size exceeds maximum limit. Maximum: ${MAX_FILE_SIZE_MB}MB, Your file: ${sizeInMB}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Validate PDF file against all constraints
 * Returns validation result with error message if invalid
 */
export function validatePDFFile(fileInfo: FileInfo): ValidationResult {
  // Validate file type
  const typeValidation = validateFileType(fileInfo.type, fileInfo.name);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  // Validate file size
  const sizeValidation = validateFileSize(fileInfo.size);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  return { isValid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get max file size display string
 */
export function getMaxFileSizeDisplay(): string {
  return `${MAX_FILE_SIZE_MB}MB`;
}
