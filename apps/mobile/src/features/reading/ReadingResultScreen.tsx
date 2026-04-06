import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import {
  ArrowLeft,
  Trophy,
  Clock,
  Target,
  ChevronRight,
  Share2,
  RefreshCw,
} from "lucide-react-native";
import { readingData } from "@/constants/readingData";

const { width } = Dimensions.get("window");

export const ReadingResultScreen = () => {
  const { readingId, title, score, totalQuestions, time } = useLocalSearchParams();

  const currentIndex = readingData.findIndex((r) => r.id === readingId);
  const nextReading =
    currentIndex !== -1 && currentIndex < readingData.length - 1
      ? readingData[currentIndex + 1]
      : null;

  const handleNext = () => {
    if (nextReading) {
      router.replace({ pathname: "/ReadingPractice", params: { readingId: nextReading.id } });
    } else {
      router.replace("/(tabs)");
    }
  };

  const percentage = Math.round((Number(score) / Number(totalQuestions)) * 100);

  const getFeedback = () => {
    if (percentage === 100)
      return {
        title: "Reading Master!",
        text: "Exceptional work! You understood every detail of the passage. Your comprehension and vocabulary are excellent.",
        suggestion: "Try a harder lesson to continue challenging yourself.",
      };
    if (percentage >= 80)
      return {
        title: "Great Job!",
        text: "You have a solid understanding of the main ideas and most details. Just a few minor slips!",
        suggestion: "Focus on inference-based questions to reach perfection.",
      };
    if (percentage >= 60)
      return {
        title: "Good Effort",
        text: "You understood the basic meaning but missed some key details or inferred meanings.",
        suggestion:
          "Try reading the passage more slowly and using the vocabulary popups for difficult words.",
      };
    return {
      title: "Keep Practicing",
      text: "This was a challenging passage. Don't worry, reading skills take time to develop.",
      suggestion: "Focus on building your vocabulary and identifying direct facts first.",
    };
  };

  const feedback = getFeedback();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.replace({ pathname: "/ReadingPractice", params: { readingId: readingId } })
          }
        >
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>

        {/* Success Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Trophy size={60} color={COLORS.white} />
          </View>
          <Text style={styles.resultTitle}>{feedback.title}</Text>
          <Text style={styles.resultSub}>{title} Complete!</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: COLORS.primary + "20" }]}>
              <Target size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>
              {score}/{totalQuestions}
            </Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: COLORS.secondary + "20" }]}>
              <Clock size={20} color={COLORS.secondary} />
            </View>
            <Text style={styles.statValue}>{formatTime(time)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: COLORS.success + "20" }]}>
              <Target size={20} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>{percentage}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        {/* Feedback Card */}
        <View style={styles.feedbackCard}>
          <Text style={styles.cardHeader}>PERFORMANCE ANALYSIS</Text>
          <Text style={styles.feedbackText}>{feedback.text}</Text>
          <View style={styles.suggestionBox}>
            <View style={styles.suggestionHeader}>
              <RefreshCw size={16} color={COLORS.primary} />
              <Text style={styles.suggestionTitle}>Suggestion</Text>
            </View>
            <Text style={styles.suggestionText}>{feedback.suggestion}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>
              {nextReading ? `Next: ${nextReading.title}` : "Return to Dashboard"}
            </Text>
            <ChevronRight size={20} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() =>
                router.replace({ pathname: "/ReadingPractice", params: { readingId: readingId } })
              }
            >
              <RefreshCw size={18} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Share2 size={18} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.padding,
    paddingTop: 100, // Increased to accommodate back button
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 60,
    left: SIZES.padding,
    zIndex: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  resultTitle: {
    fontSize: 32,
    color: COLORS.black,
    ...FONTS.bold,
    marginBottom: 5,
  },
  resultSub: {
    fontSize: 16,
    color: COLORS.gray,
    ...FONTS.medium,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: COLORS.white,
    width: (width - SIZES.padding * 2 - 30) / 3,
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    color: COLORS.black,
    ...FONTS.bold,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    ...FONTS.medium,
    marginTop: 2,
  },
  feedbackCard: {
    backgroundColor: COLORS.white,
    padding: 25,
    borderRadius: 25,
    marginBottom: 40,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeader: {
    fontSize: 12,
    color: COLORS.primary,
    ...FONTS.bold,
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  feedbackText: {
    fontSize: 16,
    color: COLORS.darkGray,
    lineHeight: 24,
    ...FONTS.medium,
    marginBottom: 20,
  },
  suggestionBox: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  suggestionTitle: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.bold,
    marginLeft: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.darkGray,
    ...FONTS.regular,
    lineHeight: 20,
  },
  actionContainer: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 30,
    marginBottom: 15,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    ...FONTS.bold,
    marginRight: 10,
  },
  secondaryButtons: {
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

// export default ReadingResultScreen;
