import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PaywallScreenProps {
  requiredTier?: "pro" | "premium";
  featureName?: string;
  onBack?: () => void;
}

const TIER_LABELS: Record<string, string> = {
  pro: "Pro",
  premium: "Premium",
};

const PRO_BENEFITS = [
  "All learning modules & activities",
  "AI Interview Coach (voice pipeline)",
  "Interview Playground (voice pipeline)",
  "Resume Studio & Resume Buddy",
];

const PREMIUM_BENEFITS = [
  "Everything in Pro",
  "AI Interview Coach with OpenAI Realtime (WebRTC)",
  "Interview Playground with OpenAI Realtime (WebRTC)",
  "Lowest latency, most natural voice conversation",
];

export function PaywallScreen({ requiredTier = "pro", featureName, onBack }: PaywallScreenProps) {
  const insets = useSafeAreaInsets();
  const benefits = requiredTier === "premium" ? PREMIUM_BENEFITS : PRO_BENEFITS;
  const tierLabel = TIER_LABELS[requiredTier] ?? "Pro";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#475569" />
        </Pressable>

        <View style={styles.iconCircle}>
          <Feather name="lock" size={32} color="#4F46E5" />
        </View>

        <Text style={styles.title}>
          {featureName ? `${featureName} requires ${tierLabel}` : `${tierLabel} Required`}
        </Text>
        <Text style={styles.subtitle}>
          Upgrade your plan to unlock this feature and get access to everything {tierLabel} has to
          offer.
        </Text>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>{tierLabel} includes:</Text>
          {benefits.map((b) => (
            <View key={b} style={styles.benefitRow}>
              <Feather name="check-circle" size={16} color="#4F46E5" style={styles.checkIcon} />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.ctaBtn} onPress={() => router.push("/subscription" as never)}>
          <Text style={styles.ctaBtnText}>View Plans</Text>
        </Pressable>

        <Pressable onPress={handleBack} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Maybe later</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 24, paddingBottom: 60, alignItems: "center", gap: 16 },
  backBtn: { alignSelf: "flex-start", marginBottom: 8 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  benefitsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  benefitRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkIcon: { marginTop: 2 },
  benefitText: { fontSize: 13, color: "#475569", flex: 1, lineHeight: 20 },
  ctaBtn: {
    backgroundColor: "#4F46E5",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
  },
  ctaBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancelBtn: { paddingVertical: 8 },
  cancelBtnText: { color: "#94A3B8", fontSize: 14 },
});
