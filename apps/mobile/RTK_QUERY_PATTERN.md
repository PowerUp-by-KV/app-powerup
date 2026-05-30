# RTK Query API Pattern Guide

This document outlines the standardized pattern for implementing RTK Query APIs in the PowerUp mobile app.

## Architecture Rules ✅

- **Service files**: `.ts` extension only
- **Screen/component files**: `.tsx` extension only
- **Named exports only**: No default exports on screens or components
- **RTK Query only**: No Axios in new code
- **NativeWind styling**: No `StyleSheet.create`, no inline styles
- **Redux hooks**: `useAppDispatch` / `useAppSelector` from `src/store/hooks`

## Core API Setup

### `src/services/api.ts`

```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthSession } from "./auth-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL environment variable is required...");
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: async (headers) => {
      // Automatically inject JWT token from auth storage
      try {
        const session = await getAuthSession();
        if (session?.access_token) {
          headers.set("Authorization", `Bearer ${session.access_token}`);
        }
      } catch (error) {
        console.warn("Failed to get auth token for API request:", error);
      }
      return headers;
    },
  }),
  tagTypes: ["Auth", "Grammar", "Reading", "Listening", "Results"],
  endpoints: () => ({}),
});
```

## Feature API Pattern

### 1. Create Feature API (`src/services/{feature}-api.ts`)

```typescript
import { api } from "./api";

// Define interfaces
export interface FeatureRequest {
  // request interface
}

export interface FeatureResponse {
  // response interface
}

// Inject endpoints into the main API
export const featureApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Queries for GET requests
    getFeatureData: builder.query<FeatureResponse, FeatureRequest>({
      query: (params) => ({
        url: "/feature/endpoint",
        params,
      }),
      providesTags: ["Feature"],
    }),

    // Mutations for POST/PUT/DELETE
    createFeature: builder.mutation<FeatureResponse, FeatureRequest>({
      query: (data) => ({
        url: "/feature/endpoint",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Feature"],
    }),
  }),
});

// Export hooks
export const { useGetFeatureDataQuery, useCreateFeatureMutation } = featureApi;
```

### 2. Use in Components

```typescript
import { useGetFeatureDataQuery, useCreateFeatureMutation } from "@/services/feature-api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function FeatureScreen() {
  const dispatch = useAppDispatch();

  // Query hook - automatically fetches and caches
  const { data, isLoading, error } = useGetFeatureDataQuery(params);

  // Mutation hook
  const [createFeature, { isLoading: isCreating }] = useCreateFeatureMutation();

  const handleCreate = async () => {
    try {
      await createFeature(featureData).unwrap();
      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  // Component JSX with NativeWind classes
  return (
    <View className="flex-1 bg-white p-4">
      {/* Content */}
    </View>
  );
}
```

## Tag Types & Cache Invalidation

Use appropriate tag types for cache management:

- `"Auth"` - Authentication related data
- `"Grammar"` - Grammar assessments and results
- `"Reading"` - Reading assessments and results
- `"Listening"` - Listening assessments and results
- `"Results"` - User results and progress

## Error Handling

RTK Query provides built-in error handling:

```typescript
const { data, error, isLoading } = useQueryHook();

if (error) {
  // Handle error - error is typed
  console.error(error);
}
```

## Authentication

JWT tokens are automatically injected into all requests via `prepareHeaders`. No manual token handling needed in components.

## Examples

See the implemented APIs:

- `src/services/auth-api.ts` - Authentication endpoints
- `src/services/pre-reading-api.ts` - Reading assessment endpoints
- `src/services/pre-listening-api.ts` - Listening assessment endpoints

## Migration from Axios

When migrating existing Axios services:

1. Replace Axios calls with RTK Query endpoints
2. Update component imports to use RTK Query hooks
3. Remove manual token handling (now automatic)
4. Update error handling to use RTK Query patterns
5. Ensure proper tag invalidation for cache management

## Store Integration

The API is already integrated into the Redux store in `src/store/index.ts`:

```typescript
export const store = configureStore({
  reducer: {
    app: appReducer,
    [api.reducerPath]: api.reducer, // API reducer included
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});
```
