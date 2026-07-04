import { api } from "./api";

export type LeaderboardPeriod = "weekly" | "monthly" | "yearly";

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  points: number;
  avatar: string | null;
  rank: number;
  is_you: boolean;
}

export interface LeaderboardResponse {
  period: LeaderboardPeriod;
  your_rank: number;
  your_points: number;
  better_than_count: number;
  top3: LeaderboardEntry[];
  list: LeaderboardEntry[];
}

export interface FriendRow {
  user_id: string;
  name: string;
  points: number;
  avatar: string | null;
}

export interface FriendRequest {
  request_id: string;
  user_id: string;
  name: string;
  points: number;
  avatar: string | null;
}

export interface SearchResult {
  user_id: string;
  name: string;
  avatar: string | null;
  points?: number;
}

export const socialApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getLeaderboard: builder.query<
      LeaderboardResponse,
      { period: LeaderboardPeriod; scope?: "global" | "friends" }
    >({
      query: ({ period, scope }) =>
        `/v1/leaderboard?period=${period}${scope ? `&scope=${scope}` : ""}`,
      providesTags: ["Leaderboard"],
    }),
    listFriends: builder.query<FriendRow[], void>({
      query: () => "/v1/friends",
      transformResponse: (resp: FriendRow[] | { friends?: FriendRow[] }) =>
        Array.isArray(resp) ? resp : (resp.friends ?? []),
      providesTags: ["Friends"],
    }),
    listFriendRequests: builder.query<FriendRequest[], void>({
      query: () => "/v1/friend-requests",
      transformResponse: (resp: FriendRequest[] | { requests?: FriendRequest[] }) =>
        Array.isArray(resp) ? resp : (resp.requests ?? []),
      providesTags: ["Friends"],
    }),
    searchFriends: builder.query<SearchResult[], string>({
      query: (q) => `/v1/friends/search?q=${encodeURIComponent(q)}`,
      transformResponse: (resp: SearchResult[] | { results?: SearchResult[] }) =>
        Array.isArray(resp) ? resp : (resp.results ?? []),
      providesTags: ["Friends"],
    }),
    sendFriendRequest: builder.mutation<{ request_id: string }, { user_id: string }>({
      query: (body) => ({ url: "/v1/friend-requests", method: "POST", body }),
      invalidatesTags: ["Friends"],
    }),
    acceptFriendRequest: builder.mutation<void, string>({
      query: (requesterId) => ({
        url: `/v1/friend-requests/${requesterId}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["Friends", "Leaderboard"],
    }),
    rejectFriendRequest: builder.mutation<void, string>({
      query: (otherId) => ({ url: `/v1/friend-requests/${otherId}`, method: "DELETE" }),
      invalidatesTags: ["Friends"],
    }),
  }),
});

export const {
  useGetLeaderboardQuery,
  useListFriendsQuery,
  useListFriendRequestsQuery,
  useSearchFriendsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
} = socialApi;
