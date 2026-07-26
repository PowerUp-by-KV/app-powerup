import React, { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import type { TranscriptTurn } from "../types";

interface TranscriptPanelProps {
  turns: TranscriptTurn[];
}

const ROLE_LABELS: Record<TranscriptTurn["role"], string> = {
  interviewer: "AI Interviewer",
  candidate: "You",
};

import { useColorScheme } from "nativewind";

export function TranscriptPanel({ turns }: TranscriptPanelProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [turns]);

  if (turns.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, !isDark && { color: "#64748B" }]}>
          The conversation will appear here…
        </Text>
      </View>
    );
  }

  return (
    <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content}>
      {turns.map((turn, index) => {
        const isAI = turn.role === "interviewer";
        return (
          <View key={index} style={[styles.row, isAI ? styles.rowLeft : styles.rowRight]}>
            <Text
              style={[
                styles.speaker,
                isAI
                  ? isDark
                    ? styles.speakerAI
                    : { color: "#4F46E5" }
                  : isDark
                    ? styles.speakerUser
                    : { color: "#0284C7" },
              ]}
            >
              {ROLE_LABELS[turn.role]}
            </Text>
            <View
              style={[
                styles.bubble,
                isAI
                  ? isDark
                    ? styles.bubbleAI
                    : { backgroundColor: "#EEF2FF", borderTopLeftRadius: 4 }
                  : isDark
                    ? styles.bubbleUser
                    : { backgroundColor: "#E0F2FE", borderTopRightRadius: 4 },
              ]}
            >
              <Text
                style={[
                  styles.text,
                  isAI
                    ? isDark
                      ? styles.textAI
                      : { color: "#1E1B4B" }
                    : isDark
                      ? styles.textUser
                      : { color: "#0C4A6E" },
                ]}
              >
                {turn.text}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  row: {
    maxWidth: "88%",
  },
  rowLeft: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  rowRight: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  speaker: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
    marginHorizontal: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  speakerAI: {
    color: "#A5B4FC",
  },
  speakerUser: {
    color: "#7DD3FC",
  },
  bubble: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bubbleAI: {
    backgroundColor: "#312E81",
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: "#1E293B",
    borderTopRightRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  textAI: {
    color: "#EEF2FF",
  },
  textUser: {
    color: "#E2E8F0",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
  },
});
