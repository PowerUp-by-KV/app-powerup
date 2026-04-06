import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Info,
  ChevronRight,
  Share2,
  Home,
  Zap,
} from "lucide-react-native";
import { speakingPrompts } from "@/constants/verbalData";

const { width } = Dimensions.get("window");

const MetricCircle = ({ label, score, color, delay }) => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score,
      duration: 1000,
      delay: delay,
      useNativeDriver: false,
    }).start();
  }, [score]);

  return (
    <View style={styles.metricItem}>
      <View style={[styles.circleContainer, { borderColor: color + "20" }]}>
        <Animated.Text style={[styles.metricScore, { color: color }]}>
          {Math.round(score)}%
        </Animated.Text>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
};

export const SpeechAnalysisResultScreen = () => {
  const { promptId, duration } = useLocalSearchParams();

  const currentIndex = speakingPrompts.findIndex((p) => p.id === promptId);
  const nextPrompt =
    currentIndex !== -1 && currentIndex < speakingPrompts.length - 1
      ? speakingPrompts[currentIndex + 1]
      : null;

  const handleNext = () => {
    console.log("handleNext called. nextPrompt:", nextPrompt?.id);
    if (nextPrompt) {
      router.replace({
        pathname: "/SpeakingPractice",
        params: { promptData: JSON.stringify(nextPrompt) },
      });
    } else {
      console.log("No more prompts, navigating to MainTabs/HomeTab");
      router.replace("/(tabs)");
    }
  };

  // Mock analysis data
  const metrics = [
    { label: "Pronunciation", score: 85, color: "#6366F1" },
    { label: "Fluency", score: 72, color: "#EC4899" },
    { label: "Confidence", score: 90, color: "#F59E0B" },
    { label: "Clarity", score: 78, color: "#10B981" },
    { label: "Vocabulary", score: 65, color: "#3B82F6" },
  ];

  const fillerWords = [
    { word: "um", count: 3 },
    { word: "uh", count: 2 },
    { word: "like", count: 5 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <CheckCircle2 size={18} color={COLORS.white} />
            <Text style={styles.statusText}>Analysis Complete</Text>
          </View>
          <Text style={styles.mainTitle}>Speech Performance</Text>
          <Text style={styles.subTitle}>Great job! Your speaking is improving.</Text>
        </View>

        {/* Circular Metrics Grid */}
        <View style={styles.metricsGrid}>
          {metrics.map((m, i) => (
            <MetricCircle key={i} label={m.label} score={m.score} color={m.color} delay={i * 200} />
          ))}
        </View>

        {/* Filler Words Detection */}
        <View style={styles.analysisCard}>
          <View style={styles.cardHeader}>
            <AlertCircle size={20} color={COLORS.error} />
            <Text style={styles.cardTitle}>Filler Word Detection</Text>
          </View>
          <View style={styles.fillerContainer}>
            {fillerWords.map((fw, i) => (
              <View key={i} style={styles.fillerBadge}>
                <Text style={styles.fillerWord}>"{fw.word}"</Text>
                <View style={styles.fillerCount}>
                  <Text style={styles.fillerCountText}>{fw.count}</Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.fillerSuggestion}>
            Try to pause for a second instead of using "{fillerWords[2].word}" to make your speech
            sound more professional.
          </Text>
        </View>

        {/* AI Feedback */}
        <View style={styles.analysisCard}>
          <View style={styles.cardHeader}>
            <TrendingUp size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>AI Feedback & Suggestions</Text>
          </View>

          <View style={styles.feedbackItem}>
            <View style={styles.feedbackBullet} />
            <Text style={styles.feedbackText}>
              Your **Pronunciation** is very clear, especially with technical terms.
            </Text>
          </View>

          <View style={styles.feedbackItem}>
            <View style={styles.feedbackBullet} />
            <Text style={styles.feedbackText}>
              To improve **Fluency**, try to connect your sentences with transition words like
              'Furthermore' or 'In addition'.
            </Text>
          </View>

          <View style={styles.feedbackItem}>
            <View style={styles.feedbackBullet} />
            <Text style={styles.feedbackText}>
              Your **Vocabulary** usage was appropriate, but using more descriptive adjectives could
              boost your score.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Zap size={20} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>
              {nextPrompt ? "Next Speaking Prompt" : "Return to Dashboard"}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
            >
              <ArrowLeft size={18} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Share2 size={18} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Share Result</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Background Ornament */}
      <View style={styles.bgCircle} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingTop: 60,
    zIndex: 2,
  },
  bgCircle: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.primary + "10",
    zIndex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 35,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.success,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    marginLeft: 8,
    ...FONTS.bold,
  },
  mainTitle: {
    fontSize: 32,
    color: COLORS.black,
    ...FONTS.bold,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 16,
    color: COLORS.gray,
    ...FONTS.medium,
    marginTop: 5,
    textAlign: "center",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  metricItem: {
    width: (width - 60) / 3,
    alignItems: "center",
    marginBottom: 25,
  },
  circleContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  metricScore: {
    fontSize: 20,
    ...FONTS.bold,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 10,
    ...FONTS.bold,
  },
  analysisCard: {
    backgroundColor: COLORS.white,
    padding: 25,
    borderRadius: 25,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    color: COLORS.black,
    ...FONTS.bold,
    marginLeft: 10,
  },
  fillerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  fillerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  fillerWord: {
    fontSize: 14,
    color: COLORS.darkGray,
    ...FONTS.bold,
    marginRight: 8,
  },
  fillerCount: {
    backgroundColor: COLORS.error + "20",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
  },
  fillerCountText: {
    fontSize: 12,
    color: COLORS.error,
    ...FONTS.bold,
  },
  fillerSuggestion: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    fontStyle: "italic",
    ...FONTS.medium,
  },
  feedbackItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  feedbackBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 8,
    marginRight: 12,
  },
  feedbackText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkGray,
    lineHeight: 22,
    ...FONTS.medium,
  },
  actionSection: {
    marginTop: 20,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    ...FONTS.bold,
    marginLeft: 10,
  },
  secondaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 15,
    width: "48%",
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    ...FONTS.bold,
    marginLeft: 8,
  },
});

// export default SpeechAnalysisResultScreen;
