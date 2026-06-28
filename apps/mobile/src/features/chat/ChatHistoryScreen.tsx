import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useThemeToggle } from "@/hooks/useThemeToggle";

import {
  useListBookmarksQuery,
  useListChatThreadsQuery,
  type ChatMessage,
  type ChatThread,
} from "@/services/chat-api";

import { SafeFlatListProps } from "@/types";

const ThreadFlatList = FlatList as unknown as React.ComponentType<SafeFlatListProps<ChatThread>>;
const BookmarkFlatList = FlatList as unknown as React.ComponentType<SafeFlatListProps<ChatMessage>>;

export function ChatHistoryScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeToggle();
  const [tab, setTab] = useState<"recent" | "bookmarks">("recent");
  const { data: threads, isLoading: threadsLoading } = useListChatThreadsQuery();
  const { data: bookmarks, isLoading: bookmarksLoading } = useListBookmarksQuery(undefined, {
    skip: tab !== "bookmarks",
  });

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: isDark ? "#161821" : "#ffffff",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#334155" : "#f1f5f9",
        }}
      >
        <Pressable
          onPress={() => safeBack()}
          style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
        >
          <Feather name="chevron-left" size={22} color={isDark ? "#F8FAFC" : "#0f172a"} />
        </Pressable>
        <Text style={{ color: isDark ? "#F8FAFC" : "#0f172a", fontWeight: "800", fontSize: 16 }}>
          Recent History
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
        {(["recent", "bookmarks"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor:
                tab === t
                  ? isDark
                    ? "#334155"
                    : "#0f172a"
                  : isDark
                    ? "rgba(255,255,255,0.05)"
                    : "#f1f5f9",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: tab === t ? "#ffffff" : isDark ? "#94A3B8" : "#475569",
              }}
            >
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
              <Text
                style={{
                  color: isDark ? "#64748B" : "#94a3b8",
                  textAlign: "center",
                  marginTop: 48,
                }}
              >
                No conversations yet
              </Text>
            )
          }
          renderItem={({ item }: { item: ChatThread }) => (
            <Pressable
              onPress={() =>
                router.replace({ pathname: "/chat", params: { thread_id: item.id } } as never)
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#1E293B" : "#f8fafc",
                borderRadius: 16,
                padding: 16,
                marginBottom: 8,
              }}
            >
              <Feather name="message-circle" size={18} color={isDark ? "#94A3B8" : "#475569"} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{ color: isDark ? "#F8FAFC" : "#0f172a", fontWeight: "600" }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={{ color: isDark ? "#64748B" : "#94a3b8", fontSize: 12, marginTop: 2 }}>
                  {new Date(item.last_message_at).toLocaleString()}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={isDark ? "#475569" : "#94a3b8"} />
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
              <Text
                style={{
                  color: isDark ? "#64748B" : "#94a3b8",
                  textAlign: "center",
                  marginTop: 48,
                }}
              >
                No bookmarks yet. Bookmark replies from the coach to save them here.
              </Text>
            )
          }
          renderItem={({ item }: { item: ChatMessage }) => (
            <View
              style={{
                backgroundColor: isDark ? "#1E293B" : "#eef2ff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 8,
              }}
            >
              <Feather name="bookmark" size={14} color={isDark ? "#818cf8" : "#4f46e5"} />
              <Text style={{ color: isDark ? "#F8FAFC" : "#0f172a", marginTop: 8 }}>
                {item.content}
              </Text>
              <Text style={{ color: isDark ? "#64748B" : "#94a3b8", fontSize: 12, marginTop: 8 }}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
