/**
 * API Error Handler Utility
 * Provides comprehensive error handling and user-friendly messages for all API responses
 */

export interface ApiError {
  status?: number;
  message: string;
  code?: string;
  details?: Record<string, any>;
  userMessage: string;
  type: "validation" | "auth" | "network" | "server" | "unknown";
}

export class ApiErrorHandler {
  /**
   * Parse API error and return user-friendly message
   */
  static parseError(error: any, operation: "upload" | "update" | "delete" | "fetch"): ApiError {
    // Network error
    if (error?.status === 0 || error?.code === "NETWORK_ERROR" || error?.code === "ERR_NETWORK") {
      return {
        status: 0,
        message: "Network connection error",
        type: "network",
        userMessage:
          "Unable to connect to server. Please check your internet connection and try again.",
      };
    }

    // Validation errors (400)
    if (error?.status === 400) {
      const message = error?.data?.message || "Invalid data provided";
      const details = error?.data?.details || error?.data?.errors;

      let userMessage = "";

      switch (operation) {
        case "upload":
          userMessage =
            "Invalid resume file. " +
            (message.includes("PDF")
              ? "Please ensure the PDF is valid and not corrupted."
              : message.includes("size")
                ? "File size exceeds 5MB. Please choose a smaller file."
                : "Please check your file and try again.");
          break;
        case "update":
          userMessage =
            "Invalid resume data. " + (details ? "Please check your entries and try again." : "");
          break;
        case "delete":
          userMessage = "Cannot delete resume. " + message;
          break;
        case "fetch":
          userMessage = "Failed to fetch resume. " + message;
          break;
        default:
          userMessage = message;
      }

      return {
        status: 400,
        message,
        type: "validation",
        details,
        userMessage,
      };
    }

    // File size error (413)
    if (error?.status === 413) {
      return {
        status: 413,
        message: "Payload too large",
        type: "validation",
        userMessage: "File size exceeds 5MB limit. Please choose a smaller file.",
      };
    }

    // File type error (415)
    if (error?.status === 415) {
      return {
        status: 415,
        message: "Unsupported media type",
        type: "validation",
        userMessage: "Invalid file type. Only PDF files are supported.",
      };
    }

    // Authentication errors (401)
    if (error?.status === 401) {
      return {
        status: 401,
        message: "Unauthorized",
        type: "auth",
        userMessage: "Session expired. Please log in again.",
      };
    }

    // Forbidden (403)
    if (error?.status === 403) {
      return {
        status: 403,
        message: "Forbidden",
        type: "auth",
        userMessage: "You do not have permission to perform this action.",
      };
    }

    // Not found (404)
    if (error?.status === 404) {
      let userMessage = "";
      switch (operation) {
        case "update":
        case "delete":
        case "fetch":
          userMessage = "Resume not found. It may have been deleted.";
          break;
        default:
          userMessage = "Resource not found.";
      }

      return {
        status: 404,
        message: "Not found",
        type: "validation",
        userMessage,
      };
    }

    // Server errors (500+)
    if (error?.status && error.status >= 500) {
      let userMessage = "";
      switch (operation) {
        case "upload":
          userMessage = "Server error during upload. Please try again later.";
          break;
        case "update":
          userMessage = "Server error while saving. Please try again later.";
          break;
        case "delete":
          userMessage = "Server error while deleting. Please try again later.";
          break;
        case "fetch":
          userMessage = "Server error while fetching data. Please try again later.";
          break;
        default:
          userMessage = "Server error. Please try again later.";
      }

      return {
        status: error.status,
        message: "Server error",
        type: "server",
        userMessage,
      };
    }

    // Generic error
    const genericMessage = error?.message || error?.data?.message || "An unexpected error occurred";
    return {
      message: genericMessage,
      type: "unknown",
      userMessage: `${genericMessage}. Please try again or contact support if the problem persists.`,
    };
  }

  /**
   * Get success message for operation
   */
  static getSuccessMessage(operation: "upload" | "update" | "delete" | "fetch"): string {
    switch (operation) {
      case "upload":
        return "Resume uploaded and parsed successfully! Review your information below.";
      case "update":
        return "Resume updated successfully!";
      case "delete":
        return "Resume deleted successfully!";
      case "fetch":
        return "Resume loaded successfully!";
      default:
        return "Operation completed successfully!";
    }
  }

  /**
   * Retry logic helper
   */
  static shouldRetry(error: any, retryCount: number): boolean {
    // Retry on network errors
    if (error?.status === 0 || error?.code === "NETWORK_ERROR") {
      return retryCount < 3;
    }

    // Retry on server errors (5xx)
    if (error?.status && error.status >= 500) {
      return retryCount < 2;
    }

    // Don't retry on client errors
    return false;
  }

  /**
   * Log error for debugging
   */
  static logError(error: any, operation: string, context?: Record<string, any>): void {
    if (!error) return;
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] API Error - ${operation}:`, {
      status: error?.status,
      message: error?.message || error?.data?.message,
      code: error?.code,
      context,
    });
  }
}
