import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";

import { useGetProfileQuery } from "@/services/auth-api";
import {
  ChatMessage,
  useCreateChatThreadMutation,
  useGetChatMessagesQuery,
  useListQuickActionsQuery,
  useToggleBookmarkMutation,
} from "@/services/chat-api";
import { SafeFlatListProps } from "@/types";
import { getAvatarUri } from "@/utils/avatar";

import { ChatOrb, ChatOrbMini } from "./ChatOrb";
import { useChatStream } from "./useChatStream";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AI_ORB_IMAGE = require("@/../assets/images/ai-orb.png");

// ─── Color palette (exact design spec) ─────────────────────────────
const C = {
  // Bubbles
  userBubble: "#3B5BF6", // Royal blue
  userBubbleText: "#FFFFFF",
  aiBubble: "#D4F57A", // Lime / yellow-green
  aiBubbleText: "#111111",
  // Buttons
  sendBtn: "#22C55E", // Bright green
  sendBtnDisabled: "#86EFAC",
  cardBtn: "#2C3FD6", // Dark blue
  // Surfaces
  bg: "#FFFFFF",
  cardBg: "#F5F5F5",
  inputBg: "#F1F5F9",
  border: "#ECECEC",
  // Text
  textPrimary: "#111111",
  textSecondary: "#888888",
  textMuted: "#AAAAAA",
  // Accents
  bookmarkActive: "#3B5BF6",
  bookmarkInactive: "#CCCCCC",
  errorBg: "#FEE2E2",
  errorText: "#B91C1C",
} as const;

// ─── FlatList type workaround ───────────────────────────────────────
const MessageFlatList = FlatList as unknown as React.ForwardRefExoticComponent<
  SafeFlatListProps<ChatMessage> & React.RefAttributes<FlatList<ChatMessage>>
>;

// ─── Helpers ────────────────────────────────────────────────────────
function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return m === 0 ? `${hour} ${ampm}` : `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
  } catch {
    return "";
  }
}

function shouldShowTimestamp(curr: string, prev?: string): boolean {
  if (!prev) return true;
  try {
    return Math.abs(new Date(curr).getTime() - new Date(prev).getTime()) > 5 * 60 * 1000;
  } catch {
    return true;
  }
}

// ─── Optimistic local message ───────────────────────────────────────
interface LocalUserMessage {
  id: string;
  content: string;
  role: "user";
  created_at: string;
  isLocal: true;
}

type DisplayMessage = (ChatMessage & { isLocal?: false }) | LocalUserMessage;

// ─── Animated Orb for Screen 1 (uses the user's orb image) ──────────
const AnimatedOrb = React.memo(function AnimatedOrb() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    );
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    float.start();
    return () => {
      pulse.stop();
      float.stop();
    };
  }, [pulseAnim, floatAnim]);

  return (
    <View style={s.orbWrapper}>
      <Animated.Image
        source={AI_ORB_IMAGE}
        style={[
          s.orbImage,
          {
            transform: [{ scale: pulseAnim }, { translateY: floatAnim }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
});

// ─── Animated Typing Dots (● ● ● with pulsing opacity) ────────────
const TypingDots = React.memo(function TypingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const makePulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
      );
    const a1 = makePulse(dot1, 0);
    const a2 = makePulse(dot2, 200);
    const a3 = makePulse(dot3, 400);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={{ flexDirection: "row", gap: 4, paddingVertical: 2, paddingHorizontal: 4 }}>
      <Animated.Text style={{ opacity: dot1, fontSize: 12, color: C.textSecondary }}>
        ●
      </Animated.Text>
      <Animated.Text style={{ opacity: dot2, fontSize: 12, color: C.textSecondary }}>
        ●
      </Animated.Text>
      <Animated.Text style={{ opacity: dot3, fontSize: 12, color: C.textSecondary }}>
        ●
      </Animated.Text>
    </View>
  );
});

// ─── Memoized Message Bubble Component ──────────────────────────────
interface MessageBubbleProps {
  item: DisplayMessage;
  prevMsg?: DisplayMessage;
  avatarUri: string;
  onToggleBookmark: (id: string) => void;
}

const MessageBubble = React.memo(function MessageBubble({
  item,
  prevMsg,
  avatarUri,
  onToggleBookmark,
}: MessageBubbleProps) {
  const isUser = item.role === "user";
  const showTime = shouldShowTimestamp(item.created_at, prevMsg?.created_at);
  const isBookmarked = !("isLocal" in item && item.isLocal) && (item as ChatMessage).bookmarked;

  return (
    <View>
      {showTime && <Text style={s.timestamp}>{formatTime(item.created_at)}</Text>}
      {isUser ? (
        <View style={s.userRow}>
          <View style={s.userBubble}>
            <Text style={s.userBubbleText}>{item.content}</Text>
          </View>
          <Image source={{ uri: avatarUri }} style={s.userAvatar} />
        </View>
      ) : (
        <View style={s.aiRow}>
          <Image source={AI_ORB_IMAGE} style={s.aiAvatarImg} />
          <View style={s.aiContentCol}>
            <View style={s.aiBubble}>
              <Text style={s.aiBubbleText}>{item.content}</Text>
            </View>
            {!("isLocal" in item && item.isLocal) && (
              <View style={s.aiActions}>
                <Pressable
                  onPress={() => onToggleBookmark(item.id)}
                  style={s.aiActionBtn}
                  hitSlop={4}
                >
                  <Feather
                    name="bookmark"
                    size={14}
                    color={isBookmarked ? C.bookmarkActive : C.bookmarkInactive}
                  />
                </Pressable>
                <Pressable style={s.aiActionBtn} hitSlop={4}>
                  <Feather name="more-horizontal" size={14} color={C.textMuted} />
                </Pressable>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
});

// ─── Component ──────────────────────────────────────────────────────
export function ChatScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ thread_id?: string }>();
  const { data: profile } = useGetProfileQuery();
  const [threadId, setThreadId] = useState<string | null>(params.thread_id ?? null);
  const [input, setInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [localMessages, setLocalMessages] = useState<LocalUserMessage[]>([]);
  const [savedInput, setSavedInput] = useState("");
  const sendLockRef = useRef(false);

  // ── Existing API hooks (NOT modified) ──
  const { data: messages = [], isLoading: messagesLoading } = useGetChatMessagesQuery(
    threadId ?? "",
    { skip: !threadId },
  );
  const { data: quickActions = [] } = useListQuickActionsQuery();
  const [createThread] = useCreateChatThreadMutation();
  const [toggleBookmark] = useToggleBookmarkMutation();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // ── SSE streaming hook (POST /api/v1/chat/threads/{id}/messages/stream) ──
  const { sendStreamMessage, streamingContent, isStreaming, streamError, clearStream } =
    useChatStream();

  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const avatarUri = getAvatarUri(profile?.avatar_id, profile?.id);

  // ── Merge API messages + optimistic local messages (deduplicated) ──
  const displayMessages: DisplayMessage[] = useMemo(() => {
    const apiMsgs = [...messages].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const apiIds = new Set(apiMsgs.map((m) => m.id));
    const seenLocalIds = new Set<string>();

    // Deduplicate local messages
    const uniqueLocal = localMessages.filter((lm) => {
      if (apiIds.has(lm.id) || seenLocalIds.has(lm.id)) return false;
      seenLocalIds.add(lm.id);
      return true;
    });

    return [...apiMsgs, ...uniqueLocal];
  }, [messages, localMessages]);

  // ── Send message via SSE stream ──
  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content) return;
    if (sendLockRef.current) return; // Exit immediately if locked
    if (isStreaming || creating) return;

    // LOCK: Set synchronously before any async operations
    sendLockRef.current = true;
    setSavedInput(content);
    setInput("");

    try {
      if (!threadId) {
        setCreating(true);
        const messageId = `msg-${Date.now()}-${Math.random()}`;
        const localMsg: LocalUserMessage = {
          id: messageId,
          content,
          role: "user",
          created_at: new Date().toISOString(),
          isLocal: true,
        };

        try {
          // Add message ONCE
          setLocalMessages((prev) => {
            if (prev.some((m) => m.id === messageId)) return prev;
            return [...prev, localMsg];
          });

          const result = await createThread({}).unwrap();
          const newThreadId = result.thread.id;
          setThreadId(newThreadId);
          clearStream();
          sendStreamMessage(newThreadId, content);
        } catch (err) {
          console.error("[ChatScreen] Failed to create thread:", err);
          setInput(content);
          setLocalMessages((prev) => prev.filter((m) => m.id !== messageId));
        } finally {
          setCreating(false);
        }
      } else {
        const messageId = `msg-${Date.now()}-${Math.random()}`;
        const localMsg: LocalUserMessage = {
          id: messageId,
          content,
          role: "user",
          created_at: new Date().toISOString(),
          isLocal: true,
        };

        // Add message ONCE
        setLocalMessages((prev) => {
          if (prev.some((m) => m.id === messageId)) return prev;
          return [...prev, localMsg];
        });

        clearStream();
        sendStreamMessage(threadId, content);
      }
    } finally {
      // UNLOCK only after streaming starts
      // This allows one message at a time
      sendLockRef.current = false;
    }
  }, [input, threadId, isStreaming, creating, createThread, sendStreamMessage, clearStream]);

  // ── Quick action handler ──
  const handleQuickAction = useCallback(
    async (id: string, label: string, promptTemplate: string) => {
      const content = promptTemplate || label;
      if (sendLockRef.current || isStreaming || creating) return;

      sendLockRef.current = true;
      setSavedInput("");
      setInput("");

      try {
        if (!threadId) {
          setCreating(true);
          const messageId = `msg-${Date.now()}-${Math.random()}`;
          const localMsg: LocalUserMessage = {
            id: messageId,
            content: label,
            role: "user",
            created_at: new Date().toISOString(),
            isLocal: true,
          };

          try {
            setLocalMessages((prev) => {
              if (prev.some((m) => m.id === messageId)) return prev;
              return [...prev, localMsg];
            });

            const result = await createThread({}).unwrap();
            const newThreadId = result.thread.id;
            setThreadId(newThreadId);
            clearStream();
            sendStreamMessage(newThreadId, content, id);
          } catch (err) {
            console.error("[ChatScreen] Quick action thread error:", err);
            setLocalMessages((prev) => prev.filter((m) => m.id !== messageId));
          } finally {
            setCreating(false);
          }
        } else {
          const messageId = `msg-${Date.now()}-${Math.random()}`;
          const localMsg: LocalUserMessage = {
            id: messageId,
            content: label,
            role: "user",
            created_at: new Date().toISOString(),
            isLocal: true,
          };

          setLocalMessages((prev) => {
            if (prev.some((m) => m.id === messageId)) return prev;
            return [...prev, localMsg];
          });

          clearStream();
          sendStreamMessage(threadId, content, id);
        }
      } finally {
        sendLockRef.current = false;
      }
    },
    [threadId, isStreaming, creating, createThread, sendStreamMessage, clearStream],
  );

  // ── Memoized bookmark toggle ──
  const handleToggleBookmark = useCallback(
    (messageId: string) => {
      toggleBookmark(messageId);
    },
    [toggleBookmark],
  );

  // ── Restore input on error ──
  React.useEffect(() => {
    if (streamError && savedInput) {
      setInput(savedInput);
      setSavedInput("");
    }
  }, [streamError, savedInput]);

  // ── Clear local messages when API refreshes ──
  React.useEffect(() => {
    if (!isStreaming && messages.length > 0) {
      setLocalMessages([]);
    }
  }, [isStreaming, messages]);

  const empty = !threadId;
  const busy = isStreaming || creating;

  // Capture quick actions into local vars for type narrowing in callbacks
  const qa0 = quickActions[0];
  const qa1 = quickActions[1];

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: Single message bubble (uses memoized MessageBubble component)
  // ═══════════════════════════════════════════════════════════════════
  const renderMessage = useCallback(
    ({ item, index }: { item: DisplayMessage; index: number }) => {
      const prevMsg = index > 0 ? displayMessages[index - 1] : undefined;
      return (
        <MessageBubble
          item={item}
          prevMsg={prevMsg}
          avatarUri={avatarUri}
          onToggleBookmark={handleToggleBookmark}
        />
      );
    },
    [displayMessages, avatarUri, handleToggleBookmark],
  );

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: Input bar (shared between empty + chat states)
  // ═══════════════════════════════════════════════════════════════════
  const sendBtnBgColor = useMemo(
    () => (input.trim() && !busy && !sendLockRef.current ? C.sendBtn : C.sendBtnDisabled),
    [input, busy],
  );

  const handleInputChange = useCallback((text: string) => {
    setInput(text);
  }, []);

  const renderInputBar = useCallback(
    () => (
      <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <Pressable
          style={s.inputPlusBtn}
          hitSlop={8}
          disabled={busy || sendLockRef.current}
          onPress={() =>
            Alert.alert("Attach Media", "Choose an option", [
              { text: "Camera", onPress: () => {} },
              { text: "Photo Library", onPress: () => {} },
              { text: "Document", onPress: () => {} },
              { text: "Cancel", style: "cancel" },
            ])
          }
        >
          <Feather name="plus" size={20} color={C.textSecondary} />
        </Pressable>
        <TextInput
          value={input}
          onChangeText={handleInputChange}
          placeholder="Ask me anything..."
          placeholderTextColor={C.textMuted}
          style={s.textInput}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          editable={!busy && !sendLockRef.current}
          maxLength={1000}
        />
        <Pressable
          onPress={handleSend}
          disabled={!input.trim() || busy || sendLockRef.current}
          style={[s.sendBtn, { backgroundColor: sendBtnBgColor }]}
          hitSlop={8}
        >
          {busy || sendLockRef.current ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Feather name="arrow-up" size={16} color="#fff" />
          )}
        </Pressable>
      </View>
    ),
    [input, busy, handleInputChange, handleSend, sendBtnBgColor, insets.bottom],
  );

  // ═══════════════════════════════════════════════════════════════════
  // MAIN RETURN
  // ═══════════════════════════════════════════════════════════════════
  return (
    <View style={s.root}>
      {Platform.OS === "web" && (
        <Pressable onPress={() => safeBack()} className="absolute inset-0 bg-slate-900/45" />
      )}

      <View
        style={[
          s.card,
          {
            paddingTop: insets.top,
            height: Platform.OS === "web" ? "82%" : "100%",
            maxHeight: Platform.OS === "web" ? 750 : "100%",
            maxWidth: Platform.OS === "web" ? 480 : "100%",
            alignSelf: Platform.OS === "web" ? "flex-end" : "auto",
            marginTop: Platform.OS === "web" ? "auto" : 0,
            margin: Platform.OS === "web" ? 24 : 0,
            borderRadius: Platform.OS === "web" ? 24 : 0,
            borderWidth: Platform.OS === "web" ? 1 : 0,
            shadowOpacity: Platform.OS === "web" ? 0.12 : 0,
          },
        ]}
      >
        {/* ═══ HEADER ═══════════════════════════════════════════════ */}
        <View style={s.header}>
          <Pressable onPress={() => safeBack()} style={s.headerBtn}>
            <Feather name="arrow-left" size={22} color={C.textPrimary} />
          </Pressable>
          <View style={s.headerRight}>
            {empty && (
              <Pressable style={s.headerBtn}>
                <Feather name="bookmark" size={20} color={C.textPrimary} />
              </Pressable>
            )}
            <Pressable onPress={() => router.push("/chat/history" as never)} style={s.headerBtn}>
              <Feather name="menu" size={20} color={C.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* ═══ BODY ═════════════════════════════════════════════════ */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {empty ? (
            /* ═══ SCREEN 1: EMPTY STATE ═══════════════════════════ */
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={s.emptyContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Greeting */}
              <Text style={s.greeting}>Hi {firstName}!</Text>
              <Text style={s.subtitle}>How can I help you today?</Text>

              {/* Animated Orb Image */}
              <AnimatedOrb />

              {/* Suggestion Chips Row - horizontal scrollable & CLICKABLE */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.suggestionChipsRow}
                style={s.suggestionChipsContainer}
              >
                <Pressable
                  onPress={() => {
                    setInput("How do I introduce myself?");
                  }}
                  style={s.suggestionChip}
                >
                  <Text style={s.suggestionChipText}>How do I introduce myself?</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setInput("Practice a job interview");
                  }}
                  style={s.suggestionChip}
                >
                  <Text style={s.suggestionChipText}>Practice a job interview</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setInput("Help me with small talk");
                  }}
                  style={s.suggestionChip}
                >
                  <Text style={s.suggestionChipText}>Help me with small talk</Text>
                </Pressable>
              </ScrollView>

              {/* Quick Action Cards — 2 side-by-side */}
              <View style={s.cardsRow}>
                {/* Card 1: Practice */}
                {qa0 ? (
                  <View style={s.qaCard}>
                    <View style={s.qaCardHeader}>
                      <Text style={s.qaCardIcon}>✦</Text>
                      <Text style={s.qaCardTitle}>Practice</Text>
                    </View>
                    {/* Pre-filled suggestion chip inside card */}
                    <View style={s.inCardSuggestionChip}>
                      <Text style={s.inCardSuggestionChipText} numberOfLines={1}>
                        How do I introduce myself?
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleQuickAction(qa0.id, qa0.label, qa0.prompt_template)}
                      disabled={busy}
                      style={[s.qaCardBtn, { opacity: busy ? 0.5 : 1 }]}
                    >
                      <Text style={s.qaCardBtnText}>Start practice</Text>
                      <Feather name="arrow-right" size={14} color="#fff" />
                    </Pressable>
                  </View>
                ) : (
                  <View style={s.qaCard}>
                    <View style={s.qaCardHeader}>
                      <Text style={s.qaCardIcon}>✦</Text>
                      <Text style={s.qaCardTitle}>Practice</Text>
                    </View>
                    {/* Pre-filled suggestion chip inside card */}
                    <View style={s.inCardSuggestionChip}>
                      <Text style={s.inCardSuggestionChipText}>How do I introduce myself?</Text>
                    </View>
                    <View style={[s.qaCardBtn, { opacity: 0.4 }]}>
                      <Text style={s.qaCardBtnText}>Start practice</Text>
                      <Feather name="arrow-right" size={14} color="#fff" />
                    </View>
                  </View>
                )}

                {/* Card 2: Voice analysis / second action */}
                {qa1 ? (
                  <View style={s.qaCard}>
                    <View style={s.qaCardHeader}>
                      <Feather name="edit-3" size={14} color={C.cardBtn} />
                      <Text style={s.qaCardTitle}>Voice analysis</Text>
                      <Feather name="arrow-right" size={14} color={C.textMuted} />
                    </View>
                    <View style={{ flex: 1 }} />
                    <Pressable
                      onPress={() => handleQuickAction(qa1.id, qa1.label, qa1.prompt_template)}
                      disabled={busy}
                      style={[s.qaCardBtnAlt, { opacity: busy ? 0.5 : 1 }]}
                    >
                      <Feather name="arrow-left" size={14} color="#fff" />
                      <Text style={s.qaCardBtnText}> Start analysis</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={s.qaCard}>
                    <View style={s.qaCardHeader}>
                      <Feather name="edit-3" size={14} color={C.cardBtn} />
                      <Text style={s.qaCardTitle}>Voice analysis</Text>
                      <Feather name="arrow-right" size={14} color={C.textMuted} />
                    </View>
                    <View style={{ flex: 1 }} />
                    <View style={[s.qaCardBtnAlt, { opacity: 0.4 }]}>
                      <Feather name="arrow-left" size={14} color="#fff" />
                      <Text style={s.qaCardBtnText}> Start analysis</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Remaining quick actions as horizontal pills */}
              {quickActions.length > 2 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.extraPillsRow}
                  style={{ marginTop: 10 }}
                >
                  {quickActions.slice(2).map((qa) => (
                    <Pressable
                      key={qa.id}
                      onPress={() => handleQuickAction(qa.id, qa.label, qa.prompt_template)}
                      disabled={busy}
                      style={[s.extraPill, { opacity: busy ? 0.5 : 1 }]}
                    >
                      <Text style={s.extraPillText}>{qa.label}</Text>
                      <Feather
                        name="arrow-right"
                        size={13}
                        color="#fff"
                        style={{ marginLeft: 4 }}
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </ScrollView>
          ) : (
            /* ═══ SCREEN 2: CHAT CONVERSATION ═════════════════════ */
            <>
              <View style={{ flex: 1 }}>
                <FlatList
                  ref={listRef}
                  data={displayMessages as ChatMessage[]}
                  keyExtractor={(m: ChatMessage) => m.id}
                  contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
                  onContentSizeChange={() => {
                    listRef.current?.scrollToEnd({ animated: false });
                  }}
                  initialNumToRender={15}
                  maxToRenderPerBatch={10}
                  windowSize={10}
                  ListEmptyComponent={
                    messagesLoading ? (
                      <View style={s.loaderWrap}>
                        <ActivityIndicator color={C.userBubble} />
                      </View>
                    ) : null
                  }
                  renderItem={renderMessage}
                  ListFooterComponent={
                    isStreaming ? (
                      <View style={{ marginTop: 4 }}>
                        <View style={s.aiRow}>
                          <Image source={AI_ORB_IMAGE} style={s.aiAvatarImg} />
                          <View style={s.aiContentCol}>
                            <View style={s.aiBubble}>
                              <Text style={s.aiBubbleText}>
                                {streamingContent.length > 0 ? streamingContent : ""}
                                {streamingContent.length > 0 && (
                                  <Text style={{ color: "rgba(0,0,0,0.3)" }}>▍</Text>
                                )}
                                {streamingContent.length === 0 && <TypingDots />}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ) : null
                  }
                />
              </View>

              {/* ── Quick action pills — FIXED at bottom, never shrinks ─ */}
              {quickActions.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.chatPillsRow}
                  style={s.chatPillsContainer}
                >
                  {[...quickActions]
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((qa) => (
                      <Pressable
                        key={qa.id}
                        onPress={() => handleQuickAction(qa.id, qa.label, qa.prompt_template)}
                        disabled={busy}
                        style={[s.chatPill, { opacity: busy ? 0.5 : 1 }]}
                      >
                        <Text style={s.chatPillText}>{qa.label}</Text>
                        <Feather
                          name="arrow-right"
                          size={13}
                          color="#fff"
                          style={{ marginLeft: 4 }}
                        />
                      </Pressable>
                    ))}
                </ScrollView>
              )}
            </>
          )}

          {/* ═══ ERROR BANNER ═══════════════════════════════════════ */}
          {streamError && (
            <View style={s.errorBanner}>
              <Feather name="alert-circle" size={14} color={C.errorText} />
              <Text style={s.errorText}>{streamError}</Text>
              <Pressable onPress={clearStream} style={{ padding: 4 }}>
                <Feather name="x" size={14} color={C.errorText} />
              </Pressable>
            </View>
          )}

          {/* ═══ INPUT BAR ═════════════════════════════════════════ */}
          {renderInputBar()}
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "transparent" },

  card: {
    width: "100%",
    backgroundColor: C.bg,
    overflow: "hidden",
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerRight: { flexDirection: "row", gap: 4 },

  // ── Empty state ──
  emptyContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },
  greeting: { fontSize: 22, fontWeight: "800", color: C.textPrimary },
  subtitle: { fontSize: 13, color: C.textSecondary, marginTop: 4 },
  orbWrapper: { alignItems: "center", marginVertical: 20 },
  orbImage: { width: 190, height: 190 },

  // ── Quick action cards (empty state, 2-col) ──
  cardsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  qaCard: {
    flex: 1,
    backgroundColor: C.cardBg,
    borderRadius: 16,
    padding: 14,
    minHeight: 120,
    borderWidth: 1,
    borderColor: C.border,
  },
  qaCardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  qaCardIcon: { fontSize: 14, color: "#F59E0B" },
  qaCardTitle: { fontSize: 14, fontWeight: "700", color: C.textPrimary, flex: 1 },
  qaCardSubtitle: { fontSize: 11, color: C.textSecondary, fontStyle: "italic", marginBottom: 10 },
  qaCardBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: C.cardBtn,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  qaCardBtnAlt: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: C.userBubble,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 2,
  },
  qaCardBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  // ── Extra pills (empty state, for 3rd+ quick actions) ──
  extraPillsRow: { paddingHorizontal: 24, gap: 8 },
  extraPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.cardBtn,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  extraPillText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  // ── Suggestion chips (pre-filled questions) ──
  suggestionChipsContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  suggestionChipsRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    alignItems: "center",
  },
  suggestionChip: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  suggestionChipText: {
    fontSize: 12,
    color: "#333333",
    fontWeight: "500",
  },

  // ── In-card suggestion chip ──
  inCardSuggestionChip: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginVertical: 8,
    alignSelf: "flex-start",
  },
  inCardSuggestionChipText: { fontSize: 12, color: "#666666" },

  // ── Chat pills (above input in chat mode) ──
  chatPillsContainer: { maxHeight: 44, borderTopWidth: 1, borderTopColor: C.border },
  chatPillsRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    alignItems: "center",
    flexShrink: 0,
  },
  chatPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.cardBtn,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    flexShrink: 0,
  },
  chatPillText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  // ── User message (royal blue, right-aligned) ──
  userRow: {
    flexDirection: "row",
    alignSelf: "flex-end",
    alignItems: "flex-end",
    marginBottom: 4,
    maxWidth: "85%",
  },
  userBubble: {
    backgroundColor: C.userBubble,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexShrink: 1,
  },
  userBubbleText: { fontSize: 15, fontWeight: "600", color: C.userBubbleText, lineHeight: 21 },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 8,
    backgroundColor: "#e2e8f0",
  },

  // ── AI message (lime, left-aligned) ──
  aiRow: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "flex-start",
    marginBottom: 4,
    maxWidth: "85%",
  },
  aiAvatarImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 4,
  },
  aiContentCol: { flexShrink: 1 },
  aiBubble: {
    backgroundColor: C.aiBubble,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aiBubbleText: { fontSize: 15, color: C.aiBubbleText, lineHeight: 21 },
  aiActions: {
    flexDirection: "row",
    marginTop: 4,
    gap: 8,
    paddingLeft: 4,
  },
  aiActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.cardBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },

  // ── Timestamp ──
  timestamp: { textAlign: "center", fontSize: 12, color: C.textSecondary, marginVertical: 10 },

  // ── Streaming ──
  streamWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 8,
    maxWidth: "85%",
  },

  // ── Error banner ──
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.errorBg,
    marginHorizontal: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  errorText: { flex: 1, fontSize: 13, color: C.errorText },

  // ── Input bar ──
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bg,
  },
  inputPlusBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  textInput: {
    flex: 1,
    backgroundColor: C.inputBg,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    fontSize: 15,
    color: C.textPrimary,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Loader ──
  loaderWrap: { paddingVertical: 48, alignItems: "center" },
});
