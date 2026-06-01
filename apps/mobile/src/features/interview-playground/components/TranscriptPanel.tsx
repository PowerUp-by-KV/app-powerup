import React, { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import type { TranscriptTurn } from "../types";

interface TranscriptPanelProps {
  turns: TranscriptTurn[];
}

const ROLE_LABELS: Record<TranscriptTurn["role"], string> = {
  interviewer: "AI",
  candidate: "You",
};

const ROLE_COLORS: Record<TranscriptTurn["role"], string> = {
  interviewer: "#4F46E5",
  candidate: "#475569",
};

const ROLE_BG: Record<TranscriptTurn["role"], string> = {
  interviewer: "#EEF2FF",
  candidate: "#F1F5F9",
};

export function TranscriptPanel({ turns }: TranscriptPanelProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [turns]);

  if (turns.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Transcript will appear here…</Text>
      </View>
    );
  }

  return (
    <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content}>
      {turns.map((turn, index) => (
        <View key={index} style={styles.turnRow}>
          <View style={[styles.badge, { backgroundColor: ROLE_BG[turn.role] }]}>
            <Text style={[styles.badgeText, { color: ROLE_COLORS[turn.role] }]}>
              {ROLE_LABELS[turn.role]}
            </Text>
          </View>
          <Text style={styles.turnText}>{turn.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 12,
    gap: 10,
  },
  turnRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 36,
    alignItems: "center",
    marginTop: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  turnText: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    lineHeight: 20,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
  },
});
