import { Platform } from "react-native";
import { getAuthSession } from "./auth-storage";
import { normalizeBaseUrlForRuntime } from "./api";

interface TransientError extends Error {
  status?: number;
}

/**
 * Uploads an audio recording to Azure Blob Storage via the backend.
 * Returns the SAS URL to use in assessment answer submissions.
 *
 * Uses raw XMLHttpRequest to avoid RTK Query Content-Type interference
 * with multipart/form-data uploads.
 */
export async function uploadAudioFile(
  audioUri: string,
  fileName: string = "recording.webm",
  moduleId?: string,
  activityId?: string,
): Promise<string> {
  const session = await getAuthSession();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("EXPO_PUBLIC_API_URL is not set");
  const rawBase = apiUrl.replace(/\/$/, "");
  const baseUrl = normalizeBaseUrlForRuntime(rawBase);

  // If no moduleId/activityId are provided, this is a pre-assessment speaking upload
  const isAssessment = !moduleId && !activityId;
  const uploadUrl = isAssessment
    ? `${baseUrl}/v1/assessment/audio`
    : `${baseUrl}/v1/audio/upload?module_id=${moduleId || ""}&activity_id=${activityId || ""}`;

  const fd = new FormData();

  if (Platform.OS === "web") {
    const resp = await fetch(audioUri);
    const blob = await resp.blob();
    const mimeType = fileName.endsWith(".webm") ? "audio/webm" : "audio/m4a";
    fd.append("file", new File([blob], fileName, { type: mimeType }));
  } else {
    const mimeType = fileName.endsWith(".webm") ? "audio/webm" : "audio/m4a";
    fd.append("file", { uri: audioUri, name: fileName, type: mimeType } as unknown as Blob);
  }

  const performUpload = () => {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);
      xhr.setRequestHeader("X-Tunnel-Skip-AntiPhishing-Page", "true");
      if (session?.access_token) {
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (isAssessment) {
              resolve(data.audio_url);
            } else {
              resolve(data.sas_url);
            }
          } catch {
            reject(new Error("Invalid response from audio upload"));
          }
        } else if (xhr.status === 504 || xhr.status === 502 || xhr.status === 503) {
          const error: TransientError = new Error(`Audio upload transient failure (${xhr.status})`);
          error.status = xhr.status;
          reject(error);
        } else {
          reject(new Error(`Audio upload failed (${xhr.status})`));
        }
      };
      xhr.onerror = () => reject(new Error("Audio upload network error"));
      xhr.send(fd);
    });
  };

  let lastError: unknown;
  let retries = 5;
  let delay = 1000;

  while (retries > 0) {
    try {
      return await performUpload();
    } catch (err) {
      lastError = err;
      const status =
        typeof err === "object" && err !== null && "status" in err
          ? (err as { status: number }).status
          : undefined;
      const message = err instanceof Error ? err.message : "";
      if (message.includes("network error") || status === 504 || status === 502 || status === 503) {
        retries--;
        if (retries > 0) {
          const jitter = Math.random() * 1000;
          await new Promise((res) => setTimeout(res, delay + jitter));
          delay *= 2;
          continue;
        }
      }
      throw err;
    }
  }

  throw lastError;
}
