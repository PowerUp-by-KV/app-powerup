import React from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { WizardHeader } from "../components/WizardHeader";
import { WizardFooterCTA } from "../components/WizardFooterCTA";

interface Step0ResumeAnalysisProps {
  onNext: () => void;
  onBack: () => void;
}

interface MetricCircle {
  label: string;
  percentage: string;
  top: number;
  left: number;
}

const METRICS: MetricCircle[] = [
  { label: "Basic\nInformation", percentage: "15%", top: 0, left: 200 },
  { label: "ATS", percentage: "15%", top: 70, left: 260 },
  { label: "Section\nCompleteness", percentage: "30%", top: 160, left: 240 },
  { label: "Resume\nQuality", percentage: "20%", top: 180, left: 20 },
  { label: "Professional\nSummary", percentage: "25%", top: 70, left: 0 },
];

export function Step0ResumeAnalysis({ onNext, onBack }: Step0ResumeAnalysisProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      className="bg-lumino-light-bg dark:bg-lumino-dark-bg"
    >
      <WizardHeader
        title="You're half way to a great start!"
        onBack={onBack}
        currentSubStep={1}
        totalSubSteps={4}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Visualization */}
        <View style={styles.scoreContainer}>
          {/* Center Circle */}
          <View style={styles.centerCircle}>
            <Text style={styles.centerPercentage} className="text-lumino-primary">
              80%
            </Text>
            <Text
              style={styles.centerLabel}
              className="text-lumino-light-textSec dark:text-lumino-dark-textSec"
            >
              Overall Score
            </Text>
          </View>

          {/* Metric Circles */}
          {METRICS.map((metric) => (
            <View
              key={metric.label}
              style={[styles.metricCircle, { top: metric.top, left: metric.left }]}
            >
              <Text style={styles.metricPercentage} className="text-lumino-primary">
                {metric.percentage}
              </Text>
              <Text
                style={styles.metricLabel}
                className="text-lumino-light-textSec dark:text-lumino-dark-textSec"
              >
                {metric.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <Text
          style={styles.description}
          className="text-lumino-light-textSec dark:text-lumino-dark-textSec"
        >
          Here's what you got right and areas we'll help improve
        </Text>

        {/* You got it right */}
        <View
          style={styles.feedbackCard}
          className="bg-lumino-light-surface dark:bg-lumino-dark-surface"
        >
          <View style={styles.feedbackHeader}>
            <Text style={styles.feedbackIcon}>✅</Text>
            <Text
              style={styles.feedbackTitle}
              className="text-lumino-light-text dark:text-lumino-dark-text"
            >
              You got it right
            </Text>
          </View>
          <View style={styles.feedbackItem}>
            <Feather name="check" size={16} color="#22C55E" />
            <Text
              style={styles.feedbackItemText}
              className="text-lumino-light-text dark:text-lumino-dark-text"
            >
              All sections employers look for
            </Text>
          </View>
          <View style={styles.feedbackItem}>
            <Feather name="check" size={16} color="#22C55E" />
            <Text
              style={styles.feedbackItemText}
              className="text-lumino-light-text dark:text-lumino-dark-text"
            >
              Multiple contact methods
            </Text>
          </View>
        </View>

        {/* How we'll help improve */}
        <View
          style={styles.feedbackCard}
          className="bg-lumino-light-surface dark:bg-lumino-dark-surface"
        >
          <View style={styles.feedbackHeader}>
            <Text style={styles.feedbackIcon}>💡</Text>
            <Text
              style={styles.feedbackTitle}
              className="text-lumino-light-text dark:text-lumino-dark-text"
            >
              How we'll help improve
            </Text>
          </View>
          <View style={styles.feedbackItem}>
            <View style={styles.bulletDot} className="bg-lumino-primary" />
            <Text
              style={styles.feedbackItemText}
              className="text-lumino-light-text dark:text-lumino-dark-text"
            >
              Add education details
            </Text>
          </View>
          <View style={styles.feedbackItem}>
            <View style={styles.bulletDot} className="bg-lumino-primary" />
            <Text
              style={styles.feedbackItemText}
              className="text-lumino-light-text dark:text-lumino-dark-text"
            >
              Optimize section titles
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <WizardFooterCTA onNext={onNext} nextLabel="Continue" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: undefined,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  scoreContainer: {
    height: 260,
    width: "100%",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  centerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#7174F6",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 80,
    alignSelf: "center",
  },
  centerPercentage: {
    fontSize: 24,
    fontWeight: "bold",
    color: undefined,
  },
  centerLabel: {
    fontSize: 10,
    color: undefined,
    marginTop: 2,
  },
  metricCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#7174F6",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  metricPercentage: {
    fontSize: 12,
    fontWeight: "bold",
    color: undefined,
  },
  metricLabel: {
    fontSize: 7,
    color: undefined,
    textAlign: "center",
    marginTop: 1,
  },
  description: {
    fontSize: 13,
    color: undefined,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },
  feedbackCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: undefined,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  feedbackIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: undefined,
  },
  feedbackItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  feedbackItemText: {
    fontSize: 14,
    color: undefined,
    flex: 1,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: undefined,
  },
});
