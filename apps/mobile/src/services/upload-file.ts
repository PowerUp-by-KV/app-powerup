import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

import { API_BASE_URL } from "./api";
import { getAuthSession } from "./auth-storage";

export class UploadError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "UploadError";
    this.status = status;
  }
}

/**
 * Upload a picked file to the API.
 *
 * On native this uses FileSystem.uploadAsync instead of fetch + FormData.
 * React Native's FormData needs to read the picked file itself, and on Android a
 * DocumentPicker result can be a `content://` URI (or a cache copy that no longer
 * exists once the app has been reopened). When that read fails the request is
 * never sent at all: the server logs show no request, and the caller only sees a
 * generic "Network request failed". uploadAsync performs the multipart upload in
 * native code and returns a real HTTP status.
 */
export async function uploadFileToApi<T>(
  path: string,
  fileUri: string,
  options: { fieldName?: string; mimeType?: string; fileName?: string } = {},
): Promise<T> {
  const { fieldName = "file", mimeType = "application/pdf", fileName = "resume.pdf" } = options;
  const url = `${API_BASE_URL}${path}`;
  const session = await getAuthSession();
  const headers: Record<string, string> = session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};

  if (Platform.OS === "web") {
    const blob = await (await fetch(fileUri)).blob();
    const body = new FormData();
    body.append(fieldName, new File([blob], fileName, { type: mimeType }));
    const res = await fetch(url, { method: "POST", body, headers });
    const text = await res.text();
    if (!res.ok) throw new UploadError(text || `Upload failed (${res.status})`, res.status);
    return JSON.parse(text) as T;
  }

  // A picked file can vanish between sessions; say so instead of failing opaquely.
  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists) {
    throw new UploadError("That file is no longer available. Please select it again.");
  }

  const res = await FileSystem.uploadAsync(url, fileUri, {
    httpMethod: "POST",
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName,
    mimeType,
    headers,
  });

  if (res.status >= 400) {
    throw new UploadError(res.body || `Upload failed (${res.status})`, res.status);
  }
  try {
    return JSON.parse(res.body) as T;
  } catch {
    throw new UploadError("The server returned an unreadable response.", res.status);
  }
}
