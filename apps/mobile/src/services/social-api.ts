import { api } from "./api";

export type LeaderboardPeriod = "weekly" | "monthly" | "yearly";
export type LeaderboardScope = "global" | "college" | "region" | "friends";

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  points: number;
  avatar: string | null;
  rank: number;
  is_you: boolean;
  college?: string;
  region?: string;
}

export interface GetLeaderboardParams {
  period: LeaderboardPeriod;
  scope?: LeaderboardScope;
  college?: string;
  region?: string;
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
    getLeaderboard: builder.query<LeaderboardResponse, GetLeaderboardParams>({
      query: ({ period, scope, college, region }) => {
        const params = new URLSearchParams({ period });

        // Backend FastAPI endpoint expects scope to be 'global' or 'friends'
        const validScope = scope === "friends" ? "friends" : "global";
        params.append("scope", validScope);

        if (college && college.trim()) {
          params.append("college", college.trim());
        }
        if (region && region.trim()) {
          params.append("region", region.trim());
        }
        return `/v1/leaderboard?${params.toString()}`;
      },
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
