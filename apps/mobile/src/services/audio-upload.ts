import { Platform } from "react-native";
import { getAuthSession } from "./auth-storage";

interface AudioUploadResponse {
  blob_path: string;
  sas_url: string;
  expires_at: string;
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
): Promise<string> {
  const session = await getAuthSession();
  const baseUrl = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api").replace(
    /\/$/,
    "",
  );
  const uploadUrl = `${baseUrl}/v1/audio/upload?module_id=00000000-0000-0000-0000-000000000000&activity_id=00000000-0000-0000-0000-000000000000`;

  const fd = new FormData();

  if (Platform.OS === "web") {
    const resp = await fetch(audioUri);
    const blob = await resp.blob();
    const mimeType = fileName.endsWith(".webm") ? "audio/webm" : "audio/m4a";
    fd.append("file", new File([blob], fileName, { type: mimeType }));
  } else {
    const mimeType = fileName.endsWith(".webm") ? "audio/webm" : "audio/m4a";
    fd.append("file", { uri: audioUri, name: fileName, type: mimeType } as any);
  }

  const performUpload = () => {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);
      if (session?.access_token) {
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data: AudioUploadResponse = JSON.parse(xhr.responseText);
            resolve(data.sas_url);
          } catch {
            reject(new Error("Invalid response from audio upload"));
          }
        } else if (xhr.status === 504 || xhr.status === 502 || xhr.status === 503) {
          const error = new Error(`Audio upload transient failure (${xhr.status})`);
          (error as any).status = xhr.status;
          reject(error);
        } else {
          reject(new Error(`Audio upload failed (${xhr.status})`));
        }
      };
      xhr.onerror = () => reject(new Error("Audio upload network error"));
      xhr.send(fd);
    });
  };

  let lastError: any;
  let retries = 5;
  let delay = 1000;

  while (retries > 0) {
    try {
      return await performUpload();
    } catch (err: any) {
      lastError = err;
      if (
        err.message.includes("network error") ||
        err.status === 504 ||
        err.status === 502 ||
        err.status === 503
      ) {
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
