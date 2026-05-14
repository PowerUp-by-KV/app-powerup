import { api } from "./api";

export interface ChatThread {
  id: string;
  title: string;
  created_at: string;
  last_message_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  bookmarked: boolean;
  created_at: string;
}

export interface ChatQuickAction {
  id: string;
  label: string;
  prompt_template: string;
  order_index: number;
}

export interface CreateThreadArgs {
  initial_message?: string;
}

export interface SendMessageArgs {
  thread_id: string;
  content: string;
  quick_action_id?: string;
}

export const chatApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listChatThreads: builder.query<ChatThread[], void>({
      query: () => "/v1/chat/threads",
      transformResponse: (resp: ChatThread[] | { threads?: ChatThread[] }) =>
        Array.isArray(resp) ? resp : (resp.threads ?? []),
      providesTags: ["Chat"],
    }),

    getChatMessages: builder.query<ChatMessage[], string>({
      query: (threadId) => `/v1/chat/threads/${threadId}/messages`,
      transformResponse: (resp: { thread: ChatThread; messages: ChatMessage[] }) =>
        resp.messages ?? [],
      providesTags: (_r, _e, id) => [{ type: "Chat" as const, id }],
    }),

    createChatThread: builder.mutation<
      { thread: ChatThread; messages: ChatMessage[] },
      CreateThreadArgs
    >({
      query: (body) => ({ url: "/v1/chat/threads", method: "POST", body }),
      invalidatesTags: ["Chat"],
    }),

    sendChatMessage: builder.mutation<
      { user_message: ChatMessage; assistant_message: ChatMessage; off_topic?: boolean },
      SendMessageArgs
    >({
      query: ({ thread_id, content, quick_action_id }) => ({
        url: `/v1/chat/threads/${thread_id}/messages`,
        method: "POST",
        body: { content, quick_action_id },
      }),
      invalidatesTags: (_r, _e, { thread_id }) => [
        { type: "Chat" as const, id: thread_id },
        "Chat",
      ],
    }),

    toggleBookmark: builder.mutation<ChatMessage, string>({
      query: (messageId) => ({
        url: `/v1/chat/messages/${messageId}/bookmark`,
        method: "POST",
      }),
      invalidatesTags: ["Chat"],
    }),

    listBookmarks: builder.query<ChatMessage[], void>({
      query: () => "/v1/chat/bookmarks",
      transformResponse: (resp: ChatMessage[] | { bookmarks?: ChatMessage[] }) =>
        Array.isArray(resp) ? resp : (resp.bookmarks ?? []),
      providesTags: ["Chat"],
    }),

    listQuickActions: builder.query<ChatQuickAction[], void>({
      query: () => "/v1/chat/quick-actions",
      transformResponse: (resp: ChatQuickAction[] | { quick_actions?: ChatQuickAction[] }) =>
        Array.isArray(resp) ? resp : (resp.quick_actions ?? []),
    }),
  }),
});

export const {
  useListChatThreadsQuery,
  useGetChatMessagesQuery,
  useCreateChatThreadMutation,
  useSendChatMessageMutation,
  useToggleBookmarkMutation,
  useListBookmarksQuery,
  useListQuickActionsQuery,
} = chatApi;
