export interface ApiError {
  userMessage: string;
  code?: string;
  status?: number;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

export const ApiErrorHandler = {
  parseError(error: unknown, fallbackOp: string): ApiError {
    if (!error) return { userMessage: `Could not ${fallbackOp}. Try again.` };
    if (typeof error === "string") return { userMessage: error };
    if (isRecord(error)) {
      const status = typeof error.status === "number" ? error.status : undefined;
      const data = isRecord(error.data) ? error.data : undefined;
      const detail = data?.detail;
      if (typeof detail === "string") return { userMessage: detail, status };
      if (Array.isArray(detail) && detail.length > 0) {
        const first = detail[0] as { msg?: string };
        if (first?.msg) return { userMessage: first.msg, status };
      }
      const msg = data?.message;
      if (typeof msg === "string") return { userMessage: msg, status };
      if (typeof error.message === "string") return { userMessage: error.message, status };
    }
    return { userMessage: `Could not ${fallbackOp}. Try again.` };
  },
  logError(error: unknown, op: string, ctx?: Record<string, unknown>): void {
    if (error) console.warn(`[${op}]`, error, ctx);
    else if (ctx) console.log(`[${op}]`, ctx);
  },
};
