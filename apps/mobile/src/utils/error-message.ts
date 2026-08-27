interface ApiErrorShape {
  status?: number | string;
  data?: { detail?: unknown; message?: string };
  message?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  const e = error as ApiErrorShape;
  if (e.data?.detail) {
    if (typeof e.data.detail === "string") return e.data.detail;
    if (Array.isArray(e.data.detail) && e.data.detail.length > 0) {
      const first = e.data.detail[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
    // Structured detail, e.g. { code: "email_not_verified", message: "Please verify your email" }
    const detail = e.data.detail as { message?: string };
    if (typeof detail?.message === "string") return detail.message;
  }
  if (e.data?.message) return e.data.message;
  if (e.message) return e.message;
  return fallback;
}

/** The HTTP status of an RTK Query error, or undefined for network/parse failures. */
export function getErrorStatus(error: unknown): number | undefined {
  const status = (error as ApiErrorShape)?.status;
  return typeof status === "number" ? status : undefined;
}
