import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAdvanceCefrMutation, useGetModuleEngagementQuery } from "@/services/module-api";
import { CefrProgressBar } from "@/features/learning-journey/components/CefrProgressBar";

/**
 * DayCompleteScreen — three rendering states driven by route params:
 *   1. Normal day:          XP + CEFR bar + Continue
 *   2. Module check passed: XP + score + badge + "Level Me Up!" CTA
 *   3. Module check failed: score + retry CTA + weak-day prompt
 */
export default function DayCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    day_number?: string;
    module_id?: string;
    xp_earned?: string;
    module_check_score?: string;
    ready_to_advance?: string;
    next_cefr?: string;
    current_cefr?: string;
    at_ceiling?: string;
  }>();

  const moduleId = params.module_id ?? "";
  const xpEarned = Number(params.xp_earned ?? 0);
  const moduleCheckScore =
    params.module_check_score && params.module_check_score.length > 0
      ? Number(params.module_check_score)
      : null;
  const readyToAdvance = params.ready_to_advance === "1";
  const atCeiling = params.at_ceiling === "1";
  const nextCefr = params.next_cefr ?? "";
  const currentCefr = params.current_cefr ?? "";

  const { data: engagement } = useGetModuleEngagementQuery(moduleId, { skip: !moduleId });
  const [advanceCefr, { isLoading: advancing }] = useAdvanceCefrMutation();
  const [advanced, setAdvanced] = useState(false);

  const state = useMemo<"normal" | "check-passed" | "check-failed">(() => {
    if (moduleCheckScore === null) return "normal";
    return moduleCheckScore >= 70 ? "check-passed" : "check-failed";
  }, [moduleCheckScore]);

  const cefrProgressPct = engagement?.cefr_progress_pct ?? 0;
  const nextBand = engagement?.next_cefr_band ?? (nextCefr || null);

  const goHome = () => router.replace("/(tabs)/my-learning");

  const handleLevelUp = async () => {
    if (!moduleId) return;
    try {
      await advanceCefr(moduleId).unwrap();
      setAdvanced(true);
    } catch {
      // Best-effort: still navigate home after a moment.
    }
  };

  // ── State 2: Module check passed ───────────────────────────────────────
  if (state === "check-passed") {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView contentContainerStyle={{ padding: 24, alignItems: "center" }}>
          <Feather name="award" size={72} color="#f59e0b" />
          <Text className="text-3xl font-extrabold text-slate-900 mt-4">Module Complete!</Text>
          <Text className="text-slate-500 mt-2">
            You scored {moduleCheckScore}% — {readyToAdvance ? "you've earned a new level." : ""}
          </Text>

          <View
            style={{
              marginTop: 24,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 999,
              backgroundColor: "#fef3c7",
            }}
          >
            <Text style={{ color: "#92400e", fontWeight: "700" }}>+{xpEarned} XP</Text>
          </View>

          {atCeiling ? (
            <Text className="text-slate-500 mt-8 text-center">
              You're at the top — C2 mastered. No further bands to unlock.
            </Text>
          ) : advanced ? (
            <View style={{ marginTop: 32, alignItems: "center" }}>
              <Feather name="check-circle" size={48} color="#16a34a" />
              <Text className="text-2xl font-bold text-slate-900 mt-3">{nextCefr} unlocked!</Text>
              <Pressable
                onPress={goHome}
                style={{
                  marginTop: 24,
                  backgroundColor: "#0f172a",
                  paddingVertical: 14,
                  paddingHorizontal: 40,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Back to My Learning</Text>
              </Pressable>
            </View>
          ) : readyToAdvance ? (
            <View style={{ marginTop: 32, width: "100%" }}>
              <Pressable
                onPress={handleLevelUp}
                disabled={advancing}
                style={{
                  backgroundColor: advancing ? "#cbd5e1" : "#0f172a",
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                {advancing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                    Level Me Up to {nextCefr} 🎉
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={goHome}
                style={{ paddingVertical: 14, alignItems: "center", marginTop: 4 }}
              >
                <Text style={{ color: "#64748b", fontWeight: "600" }}>
                  Stay at {currentCefr} for now
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={goHome}
              style={{
                marginTop: 32,
                backgroundColor: "#0f172a",
                paddingVertical: 14,
                paddingHorizontal: 40,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Continue</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── State 3: Module check failed ───────────────────────────────────────
  if (state === "check-failed") {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView contentContainerStyle={{ padding: 24, alignItems: "center" }}>
          <Feather name="refresh-ccw" size={64} color="#64748b" />
          <Text className="text-2xl font-extrabold text-slate-900 mt-4 text-center">
            So close — keep practicing
          </Text>
          <Text className="text-slate-500 mt-2 text-center">
            You scored {moduleCheckScore}% — 70% is the bar to advance.
          </Text>

          <View style={{ width: "100%", marginTop: 24 }}>
            <CefrProgressBar
              currentPct={cefrProgressPct}
              nextBand={nextBand}
              label="CEFR progress"
            />
          </View>

          <Pressable
            onPress={goHome}
            style={{
              marginTop: 32,
              backgroundColor: "#0f172a",
              paddingVertical: 14,
              paddingHorizontal: 40,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Review weak days</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── State 1: Normal day complete ───────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: "center" }}>
        <Feather name="award" size={72} color="#22c55e" />
        <Text className="text-3xl font-extrabold text-slate-900 mt-4">
          {params.day_number ? `Day ${params.day_number}` : "Day"} Complete!
        </Text>

        <View
          style={{
            marginTop: 16,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 999,
            backgroundColor: "#dcfce7",
          }}
        >
          <Text style={{ color: "#166534", fontWeight: "700" }}>+{xpEarned} XP</Text>
        </View>

        <View style={{ width: "100%", marginTop: 32 }}>
          <CefrProgressBar currentPct={cefrProgressPct} nextBand={nextBand} label="CEFR progress" />
        </View>

        <Pressable
          onPress={goHome}
          style={{
            marginTop: 32,
            backgroundColor: "#0f172a",
            paddingVertical: 14,
            paddingHorizontal: 40,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
