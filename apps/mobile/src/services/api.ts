import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://b8ltrdc5-8000.inc1.devtunnels.ms/";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // TODO: Attach auth token from secure storage
      return headers;
    },
  }),
  tagTypes: [],
  endpoints: () => ({}),
});
