import { Platform } from "react-native";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/v1`,
    prepareHeaders: async (headers) => {
      let token: string | null = null;

      if (Platform.OS === "web") {
        try {
          token = window.localStorage.getItem("access_token");
        } catch {
          token = null;
        }
      } else {
        token = await SecureStore.getItemAsync("access_token");
      }

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Resume"],
  endpoints: () => ({}),
});
