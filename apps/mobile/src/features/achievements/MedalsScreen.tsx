/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Animated,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useColorScheme } from "nativewind";

import { useListAchievementsQuery, useGetMedalsQuery } from "@/services/gamification-api";

interface BadgeType {
  id: string;
  title: string;
  emoji: string;
  requirement: string;
  color: string;
  unlocked: boolean;
  progress?: number;
  progressLabel?: string | null;
}

function getBadgeEmojiAndColor(code: string): { emoji: string; color: string } {
  switch (code) {
    case "identity_builder":
      return { emoji: "👤", color: "#6366f1" };
    case "first_steps":
      return { emoji: "🗺️", color: "#3b82f6" };
    case "explorer":
      return { emoji: "🏁", color: "#10b981" };
    case "true_start":
      return { emoji: "🚀", color: "#f59e0b" };
    case "flawless_start":
      return { emoji: "🎯", color: "#ef4444" };
    case "hybrid_learner":
      return { emoji: "🔄", color: "#8b5cf6" };
    case "lesson_one_day":
      return { emoji: "⚡", color: "#ec4899" };
    case "power_learner":
      return { emoji: "⚡", color: "#f43f5e" };
    case "deep_focus":
      return { emoji: "⏳", color: "#14b8a6" };
    case "study_marathon":
      return { emoji: "🏃‍♂️", color: "#06b6d4" };
    case "dedicated_learner":
      return { emoji: "⏳", color: "#0f172a" };
    case "beginner_conqueror":
      return { emoji: "👑", color: "#d97706" };
    case "self_improver":
      return { emoji: "🧠", color: "#4f46e5" };
    case "skill_streak_voice":
      return { emoji: "🗣️", color: "#ec4899" };
    case "getting_serious":
      return { emoji: "📈", color: "#059669" };
    case "weekly_warrior":
      return { emoji: "⚔️", color: "#dc2626" };
    case "steady_climber":
      return { emoji: "🏔️", color: "#2563eb" };
    case "streak_guardian":
      return { emoji: "🛡️", color: "#7c3aed" };
    case "unstoppable_learner":
      return { emoji: "🏆", color: "#b91c1c" };
    case "first_draft":
      return { emoji: "📝", color: "#0d9488" };
    case "accuracy_starter":
      return { emoji: "🎯", color: "#e11d48" };
    case "century_solver":
      return { emoji: "💯", color: "#4f46e5" };
    case "reactivated_learner":
      return { emoji: "🔄", color: "#64748b" };
    case "interview_ready":
      return { emoji: "🎓", color: "#1e293b" };
    case "achievement_hunter":
      return { emoji: "🎯", color: "#f59e0b" };
    case "badge_collector":
      return { emoji: "🎒", color: "#10b981" };
    case "legendary_learner":
      return { emoji: "👑", color: "#7c3aed" };
    default:
      return { emoji: "🏅", color: "#6366f1" };
  }
}

interface BadgeDetailModalProps {
  visible: boolean;
  onClose: () => void;
  badge: BadgeType | null;
}

function BadgeDetailModal({ visible, onClose, badge }: BadgeDetailModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible || !badge) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <Animated.View
        style={[
          styles.modalOverlay,
          { backgroundColor: isDark ? "rgba(10, 11, 20, 0.85)" : "rgba(15, 23, 42, 0.78)" },
        ]}
      >
        <Animated.View
          style={[
            styles.modalCard,
            {
              backgroundColor: isDark ? "#1A1B31" : "#ffffff",
              borderColor: isDark ? "rgba(113,116,246,0.15)" : "#ECEEF8",
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Close trigger */}
          <Pressable
            onPress={handleClose}
            style={[
              styles.closeButton,
              {
                backgroundColor: isDark ? "#232540" : "#F8F8FF",
                borderColor: isDark ? "rgba(113,116,246,0.15)" : "#ECEEF8",
              },
            ]}
            hitSlop={8}
          >
            <Feather name="x" size={20} color={isDark ? "#B7BED1" : "#6B7280"} />
          </Pressable>

          {/* Glowing circle representing the badge */}
          <Animated.View
            style={[
              styles.modalBadgeCircle,
              {
                backgroundColor: badge.unlocked ? badge.color : isDark ? "#232540" : "#ECEEF8",
                borderColor: isDark ? "#1A1B31" : "#ffffff",
                transform: [{ scale: pulseAnim }],
                shadowColor: badge.unlocked ? badge.color : "transparent",
              },
            ]}
          >
            <Text style={styles.modalBadgeEmoji}>{badge.emoji}</Text>
          </Animated.View>

          {/* Badge Title */}
          <Text style={[styles.modalBadgeTitle, { color: isDark ? "#ffffff" : "#1B1F35" }]}>
            {badge.title} Badge
          </Text>

          {/* Status Label Pill */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: badge.unlocked
                  ? isDark
                    ? "rgba(180,228,38,0.15)"
                    : "#F1FCF1"
                  : isDark
                    ? "#232540"
                    : "#F4F5FA",
              },
            ]}
          >
            <Feather
              name={badge.unlocked ? "award" : "lock"}
              size={12}
              color={
                badge.unlocked ? (isDark ? "#B4E426" : "#15803d") : isDark ? "#8B93A8" : "#A0A7B8"
              }
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.statusPillText,
                {
                  color: badge.unlocked
                    ? isDark
                      ? "#B4E426"
                      : "#15803d"
                    : isDark
                      ? "#8B93A8"
                      : "#A0A7B8",
                },
              ]}
            >
              {badge.unlocked ? "Active & Unlocked" : "Locked"}
            </Text>
          </View>

          {/* Requirements Box */}
          <View
            style={[
              styles.requirementBox,
              {
                backgroundColor: isDark ? "#232540" : "#F8F8FF",
                borderColor: isDark ? "rgba(113,116,246,0.15)" : "#ECEEF8",
              },
            ]}
          >
            <Text style={[styles.requirementLabel, { color: isDark ? "#8B93A8" : "#A0A7B8" }]}>
              How to unlock:
            </Text>
            <Text style={[styles.requirementText, { color: isDark ? "#ffffff" : "#1B1F35" }]}>
              {badge.requirement}
            </Text>
            {!badge.unlocked && badge.progressLabel ? (
              <View style={{ marginTop: 12 }}>
                <Text
                  style={[
                    styles.requirementLabel,
                    { marginTop: 0, color: isDark ? "#8B93A8" : "#A0A7B8" },
                  ]}
                >
                  Progress:
                </Text>
                <Text
                  style={[
                    styles.requirementText,
                    { color: isDark ? "#B7BED1" : "#6B7280", fontSize: 12, marginBottom: 6 },
                  ]}
                >
                  {badge.progressLabel}
                </Text>
                <View
                  style={{
                    height: 6,
                    backgroundColor: isDark ? "#1A1B31" : "#ECEEF8",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      backgroundColor: "#7174F6",
                      width: `${Math.min(100, Math.max(0, Math.round((badge.progress ?? 0) * 100)))}%`,
                    }}
                  />
                </View>
              </View>
            ) : null}
          </View>

          {/* Action CTA */}
          <Pressable
            onPress={handleClose}
            style={[styles.doneButton, { backgroundColor: "#7174F6" }]}
          >
            <Text style={styles.doneButtonText}>{badge.unlocked ? "Awesome!" : "Got it"}</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export function MedalsScreen() {
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const { data: list, isLoading: isAchievementsLoading } = useListAchievementsQuery();
  const { data: medalsData, isLoading: isMedalsLoading } = useGetMedalsQuery();
  const isLoading = isAchievementsLoading || isMedalsLoading;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  // Map backend achievements data with our premium badge list
  const badges = useMemo<BadgeType[]>(() => {
    if (!list) return [];

    // Combine both unlocked (recent) and locked achievements into a single ordered list
    const all = [...list.recent, ...list.locked];

    // Dedup by achievement id just in case
    const uniqueMap = new Map<string, (typeof all)[number]>();
    all.forEach((item) => {
      uniqueMap.set(item.id, item);
    });
    const uniqueList = Array.from(uniqueMap.values());

    // Consistent ordering of badges to present in the collection grid
    const orderOfCodes = [
      "identity_builder",
      "first_steps",
      "explorer",
      "true_start",
      "flawless_start",
      "hybrid_learner",
      "lesson_one_day",
      "power_learner",
      "deep_focus",
      "study_marathon",
      "dedicated_learner",
      "beginner_conqueror",
      "self_improver",
      "skill_streak_voice",
      "getting_serious",
      "weekly_warrior",
      "steady_climber",
      "streak_guardian",
      "unstoppable_learner",
      "first_draft",
      "accuracy_starter",
      "century_solver",
      "reactivated_learner",
      "interview_ready",
      "achievement_hunter",
      "badge_collector",
      "legendary_learner",
    ];

    uniqueList.sort((a, b) => {
      const idxA = orderOfCodes.indexOf(a.code);
      const idxB = orderOfCodes.indexOf(b.code);
      if (idxA === -1 && idxB === -1) return a.title.localeCompare(b.title);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    return uniqueList.map((a) => {
      const { emoji, color } = getBadgeEmojiAndColor(a.code);
      const isUnlocked = a.unlocked_at !== null;
      return {
        id: a.id,
        title: a.title,
        emoji: emoji,
        requirement: a.description,
        color: color,
        unlocked: isUnlocked,
        progress: a.progress,
        progressLabel: a.progress_label,
      };
    });
  }, [list]);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className={`flex-1 ${isDark ? "bg-[#0F1020]" : "bg-[#F4F5FA]"}`}
    >
      {/* Dynamic Detailed Modal */}
      <BadgeDetailModal
        visible={selectedBadge !== null}
        onClose={() => setSelectedBadge(null)}
        badge={selectedBadge}
      />

      {/* Header bar */}
      <View
        className={`flex-row items-center px-4 py-3 border-b ${isDark ? "bg-[#1A1B31] border-b-transparent" : "bg-white border-b-[#ECEEF8]"}`}
      >
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color={isDark ? "#ffffff" : "#1B1F35"} />
        </Pressable>
        <Text
          className={`flex-1 text-center font-extrabold text-lg ${isDark ? "text-white" : "text-[#1B1F35]"}`}
        >
          Badges
        </Text>
        <View className="w-9" />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator color="#7174F6" size="large" />
          </View>
        ) : (
          <>
            {/* Header Banner - Congratulations */}
            <View
              style={[
                styles.bannerCard,
                {
                  backgroundColor: isDark ? "#1A1B31" : "#F8F8FF",
                  borderColor: isDark ? "rgba(113,116,246,0.15)" : "#ECEEF8",
                  shadowColor: "#7174F6",
                  shadowOpacity: isDark ? 0 : 0.04,
                },
              ]}
            >
              <Text style={styles.bannerTrophyEmoji}>🏆</Text>
              <Text style={[styles.bannerText, { color: isDark ? "#ffffff" : "#1B1F35" }]}>
                Congratulations on your learning journey!
              </Text>
            </View>

            {/* Premium Interactive Badges List */}
            <Text style={[styles.sectionTitle, { color: isDark ? "#ffffff" : "#1B1F35" }]}>
              Your Badge Collection
            </Text>
            <View style={styles.badgeGridContainer}>
              {badges.map((b) => (
                <Pressable
                  key={b.id}
                  onPress={() => setSelectedBadge(b)}
                  style={({ pressed }) => [
                    styles.badgeCardPressable,
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                >
                  {/* Badge Outer Shell */}
                  <View
                    style={[
                      styles.badgeCircleShell,
                      {
                        backgroundColor: b.unlocked ? b.color : isDark ? "#232540" : "#F4F5FA",
                        borderColor: b.unlocked
                          ? "#ffffff"
                          : isDark
                            ? "rgba(113,116,246,0.15)"
                            : "#ECEEF8",
                        shadowColor: b.unlocked ? b.color : isDark ? "transparent" : "#7174F6",
                        shadowOpacity: b.unlocked ? 0.25 : 0.05,
                      },
                    ]}
                  >
                    {/* Badge Emoji */}
                    <Text style={[styles.badgeEmoji, { opacity: b.unlocked ? 1.0 : 0.22 }]}>
                      {b.emoji}
                    </Text>

                    {/* Lock Badge Overlay */}
                    {!b.unlocked && (
                      <View
                        style={[
                          styles.lockOverlayCircle,
                          {
                            backgroundColor: isDark ? "#8B93A8" : "#A0A7B8",
                            borderColor: isDark ? "#1A1B31" : "#ffffff",
                          },
                        ]}
                      >
                        <Feather name="lock" size={10} color="#ffffff" />
                      </View>
                    )}
                  </View>

                  {/* Badge Label */}
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.badgeCardTitle,
                      {
                        color: b.unlocked
                          ? isDark
                            ? "#ffffff"
                            : "#1B1F35"
                          : isDark
                            ? "#8B93A8"
                            : "#A0A7B8",
                      },
                    ]}
                  >
                    {b.title}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Level Up Your Medal Section */}
            {medalsData &&
              medalsData.level_up_progress &&
              medalsData.level_up_progress.length > 0 && (
                <View className="mt-9 w-full">
                  <Text
                    className={`text-lg font-black mb-4 ${isDark ? "text-white" : "text-[#1B1F35]"}`}
                  >
                    Level up your Medal
                  </Text>

                  {medalsData.level_up_progress.map((p) => {
                    const percent = Math.min(100, Math.round(p.progress * 100));
                    return (
                      <View
                        key={p.medal_id}
                        style={[
                          styles.levelUpCard,
                          {
                            backgroundColor: isDark ? "#1A1B31" : "#FFFFFF",
                            borderWidth: 1,
                            borderColor: isDark ? "rgba(113,116,246,0.15)" : "#ECEEF8",
                          },
                        ]}
                      >
                        {/* Left contents */}
                        <View style={{ flex: 1, paddingRight: 12 }}>
                          <Text
                            style={[styles.levelUpText, { color: isDark ? "#ffffff" : "#1B1F35" }]}
                            numberOfLines={1}
                          >
                            {p.title}
                          </Text>

                          {/* Progress Bar Track */}
                          <View
                            style={[
                              styles.levelUpProgressTrack,
                              { backgroundColor: isDark ? "#232540" : "#ECEEF8" },
                            ]}
                          >
                            <View
                              style={[
                                styles.levelUpProgressBar,
                                { width: `${percent}%`, backgroundColor: "#7174F6" },
                              ]}
                            />
                          </View>
                        </View>

                        {/* Right Lock Icon */}
                        <View style={styles.levelUpLockContainer}>
                          <Feather name="lock" size={24} color={isDark ? "#8B93A8" : "#A0A7B8"} />
                        </View>
                      </View>
                    );
                  })}

                  {/* Share Button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.shareButton,
                      {
                        backgroundColor: "#7174F6",
                        opacity: pressed ? 0.85 : 1.0,
                      },
                    ]}
                    onPress={() => {
                      console.log("Medals shared!");
                    }}
                  >
                    <Text style={styles.shareButtonText}>Share</Text>
                  </Pressable>
                </View>
              )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerCard: {
    backgroundColor: "#eef2ff",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e7ff",
    shadowColor: "#818cf8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 28,
  },
  bannerTrophyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  bannerText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#312e81",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  badgeGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },
  badgeCardPressable: {
    width: "33.33%",
    alignItems: "center",
    marginBottom: 24,
  },
  badgeCircleShell: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  badgeEmoji: {
    fontSize: 32,
  },
  lockOverlayCircle: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#64748b",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeCardTitle: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 32,
    padding: 24,
    width: "84%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    zIndex: 20001,
  },
  modalBadgeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  modalBadgeEmoji: {
    fontSize: 48,
  },
  modalBadgeTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  requirementBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    marginBottom: 24,
  },
  requirementLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    lineHeight: 18,
  },
  doneButton: {
    paddingVertical: 14,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doneButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
  levelUpCard: {
    backgroundColor: "#d1d5db",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelUpText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#1f2937",
    marginBottom: 6,
  },
  levelUpProgressTrack: {
    height: 6,
    backgroundColor: "#ffffff",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 6,
    width: "100%",
  },
  levelUpProgressBar: {
    height: "100%",
    backgroundColor: "#4b5563",
  },
  levelUpLockContainer: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    backgroundColor: "#4b5563",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
    alignSelf: "center",
    width: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  shareButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },
});
