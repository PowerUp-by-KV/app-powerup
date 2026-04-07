import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? "http://localhost:8000/api" : undefined);

if (!BASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL environment variable is required. " +
      "Please set it in your .env file. For local development, use: http://localhost:8000/api",
  );
}

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
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = api;
