import React from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useGetProfileQuery } from "@/services/auth-api";
import { useGetResumeScoreQuery } from "@/services/resume-api";

const { width } = Dimensions.get("window");
// Clamp the radius so it doesn't explode on large screens, and keep it tight
const SATELLITE_RADIUS = Math.min(width * 0.28, 140);

import { ResumeScoreResponse, ResumeScoreSection } from "@/services/resume-api";

function ScoreDiagram({ data }: { data: Partial<ResumeScoreResponse> | undefined | null }) {
  const overall = data?.overall_score ?? 0;
  const sections = data?.sections ?? [];

  // Default to 5 nodes to match the UI if API data is missing or empty
  const nodes =
    sections.length >= 5
      ? sections.slice(0, 5)
      : [
          { label: "Basic Information", score: 0 },
          { label: "ATS", score: 0 },
          { label: "Section completeness", score: 0 },
          { label: "Resume Quality", score: 0 },
          { label: "Professional Summary", score: 0 },
        ];

  // Angles for a pentagon layout starting top-center
  const angles = [-90, -18, 54, 126, 198];

  return (
    <View style={styles.diagramContainer}>
      {/* Center Node */}
      <View style={styles.centerNodeContainer}>
        <View style={styles.centerCircle}>
          <Text style={styles.centerScore}>{overall}%</Text>
        </View>
        <Text style={styles.centerLabel}>Overall Score</Text>
      </View>

      {/* Satellite Nodes */}
      {nodes.map((n: Partial<ResumeScoreSection>, i: number) => {
        const angle = ((angles[i % angles.length] ?? 0) * Math.PI) / 180;
        const x = SATELLITE_RADIUS * Math.cos(angle);
        const y = SATELLITE_RADIUS * Math.sin(angle);

        // Calculate the score (assuming score is absolute or out of max)
        const scoreVal = n.max
          ? Math.round(((n.score || 0) / Math.max(1, n.max)) * 100)
          : Math.round(n.score || 0);

        return (
          <View
            key={`node-${i}`}
            style={[
              styles.satelliteNodeContainer,
              {
                transform: [{ translateX: x }, { translateY: y }],
              },
            ]}
          >
            <View style={styles.satelliteCircle}>
              <Text style={styles.satelliteScore}>{scoreVal}%</Text>
            </View>
            <Text style={styles.satelliteLabel}>{n.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function ResumeScoreScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const { data: profile } = useGetProfileQuery();
  const [localUserId, setLocalUserId] = React.useState<string>("");

  React.useEffect(() => {
    const fetchUserId = async () => {
      if (Platform.OS === "web") {
        try {
          const id = window.localStorage.getItem("user_id");
          if (id) setLocalUserId(id);
        } catch (e) {
          console.warn("localStorage access failed:", e);
        }
      } else {
        const id = await SecureStore.getItemAsync("user_id");
        if (id) setLocalUserId(id);
      }
    };
    fetchUserId();
  }, []);

  const userId = profile?.id || localUserId;
  const { data, isLoading, isError } = useGetResumeScoreQuery(undefined, { skip: !userId });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background Blobs */}
      <View style={styles.blobGreen} />
      <View style={styles.blobPurple} />

      {/* Top Header */}
      <View style={styles.header}>
        <Pressable onPress={() => safeBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color="#9ca3af" />
        </Pressable>
        <Text style={styles.headerTitle}>Resume Building</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 60 }} />
        ) : isError ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={32} color="#ef4444" />
            <Text style={styles.errorText}>Failed to load score. Please try again.</Text>
            <Pressable
              onPress={() => router.replace("/resume" as never)}
              style={styles.errorButton}
            >
              <Text style={styles.errorButtonText}>Go to Resume Studio</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.mainTitle}>You're half way to a great start!</Text>

            <View style={styles.diagramWrapper}>
              <ScoreDiagram data={data} />
            </View>

            <Text style={styles.sectionSubtitle}>
              Here's what you got right and areas we'll help improve
            </Text>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather name="award" size={18} color="#1f2937" />
                <Text style={styles.cardTitle}>You got it right</Text>
              </View>
              {(data?.got_right && data.got_right.length > 0
                ? data.got_right
                : ["All sections employers look for", "Multiple contact methods"]
              ).map((b: string, index: number) => (
                <View key={index} style={styles.listItem}>
                  <Feather name="check" size={14} color="#9ca3af" style={styles.listIcon} />
                  <Text style={styles.listText}>{b}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather name="zap" size={18} color="#1f2937" />
                <Text style={styles.cardTitle}>How we'll help improve:</Text>
              </View>
              {(data?.improvements && data.improvements.length > 0
                ? data.improvements
                : ["Add education details", "Optimize section titles", "Fix grammar errors"]
              ).map((b: string, index: number) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.listText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      {/* Floating Continue Button */}
      {!isLoading && !isError && (
        <View style={styles.floatingFooter}>
          <Pressable
            onPress={() => router.replace("/resume/builder" as never)}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
            ]}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  blobGreen: {
    position: "absolute",
    left: -80,
    top: "30%",
    width: 250,
    height: 400,
    borderRadius: 150,
    backgroundColor: "rgba(209, 250, 229, 0.6)", // very soft light green
    transform: [{ rotate: "15deg" }],
  },
  blobPurple: {
    position: "absolute",
    right: -80,
    bottom: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(224, 231, 255, 0.7)", // soft light purple
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  backButtonPlaceholder: {
    width: 36,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // space for floating button
    paddingTop: 16,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: "#1f2937",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 40,
  },
  diagramWrapper: {
    height: SATELLITE_RADIUS * 2 + 140, // fixed height constraint
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  diagramContainer: {
    width: 0,
    height: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  centerNodeContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  centerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "#e5e7eb",
    borderTopColor: "#a3e635", // green highlight part of the circle (fake pie chart look)
    borderRightColor: "#3b82f6", // blue highlight
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
  },
  centerScore: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
  },
  centerLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  satelliteNodeContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 90, // constrain width for text wrapping
  },
  satelliteCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#818cf8", // matching blue node
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    // Add blue glow
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  satelliteScore: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  satelliteLabel: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 14,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    marginLeft: 10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  listIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#9ca3af",
    marginTop: 7,
    marginRight: 10,
    marginLeft: 5,
  },
  listText: {
    fontSize: 13,
    color: "#9ca3af",
    flex: 1,
    lineHeight: 18,
  },
  floatingFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: "#5468ff",
    borderRadius: 12,
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#5468ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonPressed: {
    backgroundColor: "#4338ca",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
