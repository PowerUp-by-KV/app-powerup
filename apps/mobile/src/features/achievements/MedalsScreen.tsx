import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  ActivityIndicator, 
  Pressable, 
  SafeAreaView, 
  ScrollView, 
  Text, 
  View, 
  StyleSheet, 
  Animated, 
  Modal 
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeBack } from "@/hooks/useSafeBack";

import { useGetMedalsQuery } from "@/services/gamification-api";

interface BadgeType {
  id: string;
  title: string;
  emoji: string;
  requirement: string;
  color: string;
  unlocked: boolean;
}

const BADGE_DESIGNS = [
  { id: "1", title: "Daily Spark", emoji: "🔥", requirement: "Complete a daily lesson streak", color: "#ff4757" },
  { id: "2", title: "Bibliophile", emoji: "📖", requirement: "Score 5.0+ in Reading assessment", color: "#1e90ff" },
  { id: "3", title: "Sonic Ear", emoji: "🎧", requirement: "Score 5.0+ in Listening assessment", color: "#8b5cf6" },
  { id: "4", title: "Scribe", emoji: "✍️", requirement: "Score 4.0+ in Writing assessment", color: "#2ed573" },
  { id: "5", title: "Orator", emoji: "🎙️", requirement: "Score 6.0+ in Speaking assessment", color: "#ec4899" },
  { id: "6", title: "CEFR Champion", emoji: "🏆", requirement: "Advance to the next CEFR level band", color: "#ffa502" },
  { id: "7", title: "XP Collector", emoji: "⚡", requirement: "Accumulate 350+ total XP points", color: "#ff6b81" },
  { id: "8", title: "Perfect 10", emoji: "🌟", requirement: "Score 100% on any lesson activity", color: "#14b8a6" },
  { id: "9", title: "Linguist King", emoji: "👑", requirement: "Unlock and master C2 proficiency stage", color: "#a855f7" },
];

interface BadgeDetailModalProps {
  visible: boolean;
  onClose: () => void;
  badge: BadgeType | null;
}

function BadgeDetailModal({ visible, onClose, badge }: BadgeDetailModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
        ])
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
      <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
          
          {/* Close trigger */}
          <Pressable onPress={handleClose} style={styles.closeButton} hitSlop={8}>
            <Feather name="x" size={20} color="#64748b" />
          </Pressable>

          {/* Glowing circle representing the badge */}
          <Animated.View 
            style={[
              styles.modalBadgeCircle, 
              { 
                backgroundColor: badge.unlocked ? badge.color : "#cbd5e1",
                transform: [{ scale: pulseAnim }],
                shadowColor: badge.unlocked ? badge.color : "#64748b",
              }
            ]}
          >
            <Text style={styles.modalBadgeEmoji}>{badge.emoji}</Text>
          </Animated.View>

          {/* Badge Title */}
          <Text style={styles.modalBadgeTitle}>{badge.title} Badge</Text>

          {/* Status Label Pill */}
          <View 
            style={[
              styles.statusPill, 
              { backgroundColor: badge.unlocked ? "#dcfce7" : "#f1f5f9" }
            ]}
          >
            <Feather 
              name={badge.unlocked ? "award" : "lock"} 
              size={12} 
              color={badge.unlocked ? "#15803d" : "#64748b"} 
              style={{ marginRight: 4 }}
            />
            <Text 
              style={[
                styles.statusPillText, 
                { color: badge.unlocked ? "#15803d" : "#64748b" }
              ]}
            >
              {badge.unlocked ? "Active & Unlocked" : "Locked"}
            </Text>
          </View>

          {/* Requirements Box */}
          <View style={styles.requirementBox}>
            <Text style={styles.requirementLabel}>How to unlock:</Text>
            <Text style={styles.requirementText}>{badge.requirement}</Text>
          </View>

          {/* Action CTA */}
          <Pressable 
            onPress={handleClose} 
            style={[
              styles.doneButton, 
              { backgroundColor: badge.unlocked ? "#0f172a" : "#64748b" }
            ]}
          >
            <Text style={styles.doneButtonText}>
              {badge.unlocked ? "Awesome!" : "Got it"}
            </Text>
          </Pressable>

        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export function MedalsScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const { data, isLoading } = useGetMedalsQuery();

  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  // Map backend achievements data with our premium badge list
  const badges = useMemo<BadgeType[]>(() => {
    const unlockedIds = new Set(data?.unlocked?.map((m) => String(m.id)) ?? []);
    
    return BADGE_DESIGNS.map((b, idx) => {
      // By default, unlock the 1st badge (demonstrating the "1st trophy" steak booster)
      // or if included in backend unlocked ID list
      const isUnlocked = idx === 0 || unlockedIds.has(b.id);
      return {
        ...b,
        unlocked: isUnlocked,
      };
    });
  }, [data]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Dynamic Detailed Modal */}
      <BadgeDetailModal
        visible={selectedBadge !== null}
        onClose={() => setSelectedBadge(null)}
        badge={selectedBadge}
      />

      {/* Header bar */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-extrabold text-slate-900 text-lg">Medals</Text>
        <View className="w-9" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 96 }}>
        {isLoading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator color="#6366f1" size="large" />
          </View>
        ) : (
          <>
            {/* Header Banner - Congratulations */}
            <View style={styles.bannerCard}>
              <Text style={styles.bannerTrophyEmoji}>🏆</Text>
              <Text style={styles.bannerText}>
                Congratulations for your 1st trophy!
              </Text>
            </View>

            {/* Premium Interactive Badges List */}
            <Text style={styles.sectionTitle}>Your Badge Collection</Text>
            <View style={styles.badgeGridContainer}>
              {badges.map((b) => (
                <Pressable
                  key={b.id}
                  onPress={() => setSelectedBadge(b)}
                  style={({ pressed }) => [
                    styles.badgeCardPressable,
                    { transform: [{ scale: pressed ? 0.95 : 1 }] }
                  ]}
                >
                  {/* Badge Outer Shell */}
                  <View 
                    style={[
                      styles.badgeCircleShell, 
                      { 
                        backgroundColor: b.unlocked ? b.color : "#f8fafc",
                        borderColor: b.unlocked ? "#ffffff" : "#cbd5e1",
                        shadowColor: b.unlocked ? b.color : "#94a3b8",
                      }
                    ]}
                  >
                    {/* Badge Emoji */}
                    <Text 
                      style={[
                        styles.badgeEmoji, 
                        { opacity: b.unlocked ? 1.0 : 0.22 }
                      ]}
                    >
                      {b.emoji}
                    </Text>

                    {/* Lock Badge Overlay */}
                    {!b.unlocked && (
                      <View style={styles.lockOverlayCircle}>
                        <Feather name="lock" size={10} color="#ffffff" />
                      </View>
                    )}
                  </View>

                  {/* Badge Label */}
                  <Text 
                    numberOfLines={1} 
                    style={[
                      styles.badgeCardTitle, 
                      { color: b.unlocked ? "#1e293b" : "#94a3b8" }
                    ]}
                  >
                    {b.title}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Level Up Progress List */}
            {data && data.level_up_progress.length > 0 && (
              <View className="mt-8">
                <Text style={styles.sectionTitle}>Level up your badge</Text>
                {data.level_up_progress.map((p) => {
                  const w = Math.min(100, Math.round(p.progress * 100));
                  return (
                    <View key={p.medal_id} className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-sm">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-slate-900 text-sm font-bold flex-1 pr-3">{p.title}</Text>
                        <Text className="text-slate-500 text-xs font-semibold">{p.label}</Text>
                      </View>
                      <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <View className="h-full bg-slate-900" style={{ width: `${w}%` }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
    justifyContent: "space-between",
    width: "100%",
  },
  badgeCardPressable: {
    width: "30%",
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
});
