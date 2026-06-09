import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";
import { LinearGradient } from "expo-linear-gradient";

import { useGetProfileQuery } from "@/services/auth-api";
import {
  ChatMessage,
  useCreateChatThreadMutation,
  useGetChatMessagesQuery,
  useListQuickActionsQuery,
  useSendChatMessageMutation,
  useToggleBookmarkMutation,
} from "@/services/chat-api";
import { SafeFlatListProps } from "@/types";

const MessageFlatList = FlatList as unknown as React.ForwardRefExoticComponent<
  SafeFlatListProps<ChatMessage> & React.RefAttributes<FlatList<ChatMessage>>
>;

export function ChatScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ thread_id?: string }>();
  const { data: profile } = useGetProfileQuery();
  const [threadId, setThreadId] = useState<string | null>(params.thread_id ?? null);
  const [input, setInput] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: messages = [], isLoading: messagesLoading } = useGetChatMessagesQuery(
    threadId ?? "",
    { skip: !threadId },
  );
  const { data: quickActions = [] } = useListQuickActionsQuery();
  const [createThread] = useCreateChatThreadMutation();
  const [sendMessage, { isLoading: sending }] = useSendChatMessageMutation();
  const [toggleBookmark] = useToggleBookmarkMutation();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const firstName = profile?.name?.split(" ")[0] ?? "there";

  // Scrolling is triggered via FlatList's onContentSizeChange below so the
  // scroll fires exactly when new content has actually been laid out — a
  // setTimeout here was unreliable on slower devices.

  const startThread = async (content: string, quickActionId?: string) => {
    if (!content.trim()) return;
    setCreating(true);
    try {
      const result = await createThread({ initial_message: content }).unwrap();
      setThreadId(result.thread.id);
      setInput("");
      if (quickActionId) {
        await sendMessage({ thread_id: result.thread.id, content, quick_action_id: quickActionId });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;
    if (!threadId) {
      await startThread(content);
      return;
    }
    setInput("");
    await sendMessage({ thread_id: threadId, content });
  };

  const handleQuickAction = async (id: string, label: string) => {
    if (!threadId) await startThread(label, id);
    else await sendMessage({ thread_id: threadId, content: label, quick_action_id: id });
  };

  const empty = !threadId;
  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [messages],
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Platform.OS === "web" ? "#0f172a" : "#fff",
      }}
    >
      {Platform.OS === "web" && (
        <>
          <View
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            pointerEvents="none"
          >
            <LinearGradient
              colors={["#faf5ff", "#f5f3ff", "#fafafd"]}
              style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
            />
            {/* Optimized static mockup representation of the HomeScreen to prevent re-querying API hooks */}
            <View style={{ padding: 24, paddingTop: 60, opacity: 0.35 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 28,
                }}
              >
                <View>
                  <View
                    style={{
                      width: 140,
                      height: 26,
                      backgroundColor: "#cbd5e1",
                      borderRadius: 13,
                      marginBottom: 8,
                    }}
                  />
                  <View
                    style={{ width: 200, height: 16, backgroundColor: "#e2e8f0", borderRadius: 8 }}
                  />
                </View>
                <View
                  style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#cbd5e1" }}
                />
              </View>
              <View
                style={{
                  height: 110,
                  backgroundColor: "#ffffff",
                  borderRadius: 24,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                }}
              />
              <View
                style={{
                  height: 170,
                  backgroundColor: "#ffffff",
                  borderRadius: 24,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                }}
              />
              <View
                style={{
                  width: 160,
                  height: 22,
                  backgroundColor: "#cbd5e1",
                  borderRadius: 11,
                  marginBottom: 16,
                }}
              />
              <View
                style={{
                  height: 130,
                  backgroundColor: "#ffffff",
                  borderRadius: 24,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                }}
              />
            </View>
          </View>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(15, 23, 42, 0.45)",
            }}
            pointerEvents="none"
          />
        </>
      )}
      <View
        style={{
          height: Platform.OS === "web" ? "82%" : "100%",
          maxHeight: Platform.OS === "web" ? 750 : "100%",
          paddingTop: insets.top,
          backgroundColor: "#fff",
          maxWidth: Platform.OS === "web" ? 480 : "100%",
          width: "100%",
          alignSelf: Platform.OS === "web" ? "flex-end" : "auto",
          marginTop: Platform.OS === "web" ? "auto" : 0,
          margin: Platform.OS === "web" ? 24 : 0,
          borderRadius: Platform.OS === "web" ? 24 : 0,
          overflow: "hidden",
          borderWidth: Platform.OS === "web" ? 1 : 0,
          borderColor: "#e2e8f0",
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: Platform.OS === "web" ? 0.12 : 0,
          shadowRadius: 24,
        }}
      >
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100">
          <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
            <Feather name="chevron-left" size={22} color="#0f172a" />
          </Pressable>
          <Text className="text-slate-900 font-extrabold text-base">AI Coach</Text>
          <Pressable
            onPress={() => router.push("/chat/history" as never)}
            className="w-9 h-9 items-center justify-center"
          >
            <Feather name="menu" size={20} color="#0f172a" />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {empty ? (
            <View className="flex-1 px-6 pt-8">
              <Text className="text-slate-900 text-2xl font-extrabold">Hi {firstName}!</Text>
              <Text className="text-slate-500 mt-1">How can I help you today?</Text>
              <View className="bg-slate-100 rounded-3xl mt-6" style={{ height: 180 }} />
              <View className="mt-8" style={{ gap: 12 }}>
                {quickActions.map((qa) => (
                  <Pressable
                    key={qa.id}
                    onPress={() => handleQuickAction(qa.id, qa.label)}
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row items-center"
                  >
                    <View className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-3">
                      <Feather name="zap" size={18} color="#4f46e5" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-900 font-bold">{qa.label}</Text>
                      <Text className="text-slate-500 text-xs mt-0.5">Tap to start</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#94a3b8" />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <MessageFlatList
              ref={listRef}
              data={sortedMessages}
              keyExtractor={(m: ChatMessage) => m.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
              ListEmptyComponent={
                messagesLoading ? (
                  <View className="py-12 items-center">
                    <ActivityIndicator color="#6366f1" />
                  </View>
                ) : null
              }
              renderItem={({ item }: { item: ChatMessage }) => {
                const isUser = item.role === "user";
                return (
                  <View className={`mb-3 max-w-[85%] ${isUser ? "self-end" : "self-start"}`}>
                    <View
                      className={`rounded-2xl px-4 py-3 ${isUser ? "bg-slate-900" : "bg-slate-100"}`}
                    >
                      <Text className={isUser ? "text-white" : "text-slate-900"}>
                        {item.content}
                      </Text>
                    </View>
                    {!isUser && (
                      <Pressable
                        onPress={() => toggleBookmark(item.id)}
                        className="mt-1 flex-row items-center"
                      >
                        <Feather
                          name="bookmark"
                          size={14}
                          color={item.bookmarked ? "#4f46e5" : "#94a3b8"}
                        />
                        <Text className="text-slate-400 text-xs ml-1">
                          {item.bookmarked ? "Saved" : "Bookmark"}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              }}
            />
          )}

          <View className="border-t border-slate-100 px-3 py-2 flex-row items-center">
            <Pressable className="w-9 h-9 items-center justify-center">
              <Feather name="plus" size={20} color="#475569" />
            </Pressable>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask me anything..."
              placeholderTextColor="#94a3b8"
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 mx-2 text-slate-900"
              onSubmitEditing={handleSend}
              returnKeyType="send"
              editable={!sending && !creating}
            />
            <Pressable
              onPress={handleSend}
              disabled={!input.trim() || sending || creating}
              className={`w-9 h-9 rounded-full items-center justify-center ${input.trim() ? "bg-slate-900" : "bg-slate-300"}`}
            >
              {sending || creating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Feather name="arrow-up" size={16} color="#fff" />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
