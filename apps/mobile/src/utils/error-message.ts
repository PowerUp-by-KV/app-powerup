export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  const e = error as { data?: { detail?: unknown; message?: string }; message?: string };
  if (e.data?.detail) {
    if (typeof e.data.detail === "string") return e.data.detail;
    if (Array.isArray(e.data.detail) && e.data.detail.length > 0) {
      const first = e.data.detail[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
  }
  if (e.data?.message) return e.data.message;
  if (e.message) return e.message;
  return fallback;
}
