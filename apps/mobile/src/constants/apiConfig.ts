import { Platform } from "react-native";
import Constants from "expo-constants";

export const USE_MOCK_API = false;

// Dynamically determine the host IP for physical devices
const getHostUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  // On web, localhost works fine
  if (Platform.OS === "web") return "http://127.0.0.1:8000";

  // On physical devices, we need the computer's IP where Metro is running
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri ? hostUri.split(":")[0] : "127.0.0.1";
  return `http://${host}:8000`;
};

export const API_BASE_URL: string = getHostUrl();

if (!process.env.EXPO_PUBLIC_API_URL && Platform.OS !== "web") {
  console.log(`📱 Connectivity: Using dynamic host ${API_BASE_URL} for physical device.`);
}

export const API_V1_PREFIX = "/api/v1";

export const FULL_API_BASE_URL: string = `${API_BASE_URL}${API_V1_PREFIX}`;
