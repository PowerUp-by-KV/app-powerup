import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAppSelector } from "@/store/hooks";
import { useNavigationBridge } from "@/utils/navigationBridge";

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = Record<string, never>;

// ── Component ─────────────────────────────────────────────────────────────────

export function HomeScreen(_props: Props) {
  const navigation = useNavigationBridge();
  // Read resume status directly from Redux store
  const resumeUploaded = useAppSelector((state) => state.profile.resumeUploaded);

  const handleInterviewCoach = (): void => {
    if (!resumeUploaded) return;
    console.log("🔥 HOME → Navigating to /interview/coach");
    router.push("/interview/coach" as never);
  };

  const handleMockInterview = (): void => {
    if (!resumeUploaded) return;
    navigation.navigate("MockInterviewList");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Interview App</Text>
      <Text style={styles.subtitle}>Upload your resume to unlock interview features</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Resume")}>
        <Text style={styles.buttonText}>Resume</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !resumeUploaded && styles.disabledButton]}
        onPress={handleInterviewCoach}
        disabled={!resumeUploaded}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Interview Coach</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !resumeUploaded && styles.disabledButton]}
        onPress={handleMockInterview}
        disabled={!resumeUploaded}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Mock Interview</Text>
      </TouchableOpacity>

      {!resumeUploaded && <Text style={styles.note}>Please upload your resume first.</Text>}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#475569",
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  note: {
    marginTop: 8,
    textAlign: "center",
    color: "#DC2626",
    fontSize: 14,
  },
});
