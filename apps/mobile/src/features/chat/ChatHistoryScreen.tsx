import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeBack } from "@/hooks/useSafeBack";

import {
  useListBookmarksQuery,
  useListChatThreadsQuery,
  type ChatMessage,
  type ChatThread,
} from "@/services/chat-api";

interface SafeFlatListProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  contentContainerStyle?: any;
  ListEmptyComponent?: React.ReactNode;
  renderItem: (info: { item: T; index: number }) => React.ReactElement | null;
  className?: string;
}

const ThreadFlatList = FlatList as unknown as React.ComponentType<SafeFlatListProps<ChatThread>>;
const BookmarkFlatList = FlatList as unknown as React.ComponentType<SafeFlatListProps<ChatMessage>>;

export function ChatHistoryScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const [tab, setTab] = useState<"recent" | "bookmarks">("recent");
  const { data: threads, isLoading: threadsLoading } = useListChatThreadsQuery();
  const { data: bookmarks, isLoading: bookmarksLoading } = useListBookmarksQuery(undefined, {
    skip: tab !== "bookmarks",
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100">
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="text-slate-900 font-extrabold text-base">Recent History</Text>
        <View className="w-9" />
      </View>

      <View className="flex-row px-4 py-3" style={{ gap: 8 }}>
        {(["recent", "bookmarks"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full ${tab === t ? "bg-slate-900" : "bg-slate-100"}`}
          >
            <Text className={`text-sm font-bold ${tab === t ? "text-white" : "text-slate-600"}`}>
              {t === "recent" ? "Recents" : "Bookmarks"}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "recent" ? (
        <ThreadFlatList
          data={threads ?? []}
          keyExtractor={(t: ChatThread) => t.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            threadsLoading ? (
              <ActivityIndicator color="#6366f1" />
            ) : (
              <Text className="text-slate-400 text-center mt-12">No conversations yet</Text>
            )
          }
          renderItem={({ item }: { item: ChatThread }) => (
            <Pressable
              onPress={() =>
                router.replace({ pathname: "/chat", params: { thread_id: item.id } } as never)
              }
              className="flex-row items-center bg-slate-50 rounded-2xl p-4 mb-2"
            >
              <Feather name="message-circle" size={18} color="#475569" />
              <View className="flex-1 ml-3">
                <Text className="text-slate-900 font-semibold" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  {new Date(item.last_message_at).toLocaleString()}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#94a3b8" />
            </Pressable>
          )}
        />
      ) : (
        <BookmarkFlatList
          data={bookmarks ?? []}
          keyExtractor={(m: ChatMessage) => m.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            bookmarksLoading ? (
              <ActivityIndicator color="#6366f1" />
            ) : (
              <Text className="text-slate-400 text-center mt-12">
                No bookmarks yet. Bookmark replies from the coach to save them here.
              </Text>
            )
          }
          renderItem={({ item }: { item: ChatMessage }) => (
            <View className="bg-indigo-50 rounded-2xl p-4 mb-2">
              <Feather name="bookmark" size={14} color="#4f46e5" />
              <Text className="text-slate-900 mt-2">{item.content}</Text>
              <Text className="text-slate-400 text-xs mt-2">
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
