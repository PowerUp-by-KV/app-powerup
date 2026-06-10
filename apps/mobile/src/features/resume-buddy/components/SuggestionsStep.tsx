import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SkillChip } from "./SkillChip";

interface SuggestionsStepProps {
  missingSkills: string[];
  recommendedTech: string[];
  atsFindings: string[];
  suggestions: string[];
  onNext: () => void;
  onHistory: () => void;
  qualitySummary: string;
  targetRole: string;
}

export function SuggestionsStep({
  missingSkills = [],
  recommendedTech = [],
  atsFindings = [],
  suggestions = [],
  onNext,
  onHistory,
  qualitySummary,
  targetRole,
}: SuggestionsStepProps) {
  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9FC" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 170 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Motivator Gradient Card */}
        <LinearGradient
          colors={["#597AF4", "#AFC0FF", "#DEF684"]}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Background overlapping semi-transparent circles */}
          <View
            style={{
              position: "absolute",
              right: -60,
              top: -60,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            }}
          />
          <View
            style={{
              position: "absolute",
              right: 20,
              bottom: -80,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: "rgba(255, 255, 255, 0.12)",
            }}
          />
          <View
            style={{
              position: "absolute",
              left: -80,
              bottom: -40,
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
            }}
          />

          {/* Badge */}
          <View style={styles.qualityBadge}>
            <Feather name="award" size={12} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.qualityBadgeText}>Resume Quality</Text>
          </View>

          {/* Quality Summary Text */}
          <Text style={styles.cardSummary}>{qualitySummary}</Text>
        </LinearGradient>

        {/* Missing Skills Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Missing Skills</Text>
            <Text style={styles.cardSubtitle}>Add these to match the role</Text>
          </View>
          {missingSkills.length === 0 ? (
            <Text style={styles.emptyText}>All target skills are matched!</Text>
          ) : (
            <View style={styles.chipRow}>
              {missingSkills.map((s, idx) => (
                <SkillChip key={`${s}-${idx}`} label={s} variant="missing" />
              ))}
            </View>
          )}
        </View>

        {/* Recommended Tech Stack Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recommended Tech Stack</Text>
            <Text style={styles.cardSubtitle}>Trending for {targetRole || "Full Stack Dev"}</Text>
          </View>
          {recommendedTech.length === 0 ? (
            <Text style={styles.emptyText}>No extra tech stack recommended.</Text>
          ) : (
            <View style={styles.chipRow}>
              {recommendedTech.map((t, idx) => (
                <SkillChip key={`${t}-${idx}`} label={t} variant="recommended" />
              ))}
            </View>
          )}
        </View>

        {/* ATS Layout Findings Card (Retained from Old Design, Styled to match New Design) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderWithIcon}>
            <View style={[styles.badgeCircle, { backgroundColor: "rgba(89, 122, 244, 0.1)" }]}>
              <Feather name="shield" size={18} color="#597AF4" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle}>ATS Layout Findings</Text>
              <Text style={styles.cardSubtitle}>ATS compatibility checklist</Text>
            </View>
          </View>
          {atsFindings.length === 0 ? (
            <Text style={styles.emptyText}>No layout findings detected.</Text>
          ) : (
            <View style={styles.listContainer}>
              {atsFindings.map((finding, idx) => (
                <View key={`finding-${idx}`} style={styles.listItem}>
                  <View style={styles.checkIconWrapper}>
                    <Feather name="check" size={13} color="#4CAF50" />
                  </View>
                  <Text style={styles.itemText}>{finding}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Personalized Suggestions Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderWithIcon}>
            <View style={[styles.badgeCircle, { backgroundColor: "rgba(89, 122, 244, 0.1)" }]}>
              <Feather name="zap" size={18} color="#597AF4" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle}>Personalized Suggestions</Text>
              <Text style={styles.cardSubtitle}>From AI Coach</Text>
            </View>
          </View>
          {suggestions.length === 0 ? (
            <Text style={styles.emptyText}>No recommendations available.</Text>
          ) : (
            <View style={styles.listContainer}>
              {suggestions.map((sug, idx) => (
                <View key={`suggestion-${idx}`} style={styles.listItem}>
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberBadgeText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.itemText}>{sug}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Double Sticky Footer Action Buttons */}
      <View style={styles.footer}>
        <Pressable
          onPress={onNext}
          style={{
            backgroundColor: "#597AF4",
            height: 48,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            marginBottom: 12,
            shadowColor: "#597AF4",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text style={styles.primaryButtonText}>Save and Exit</Text>
        </Pressable>
        <Pressable onPress={onHistory} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>View History</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardGradient: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 24,
    paddingVertical: 28,
    marginBottom: 16,
    width: "100%",
    position: "relative",
    shadowColor: "#597AF4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  qualityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  qualityBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  cardSummary: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "700",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardHeaderWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  badgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  listContainer: {
    marginTop: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 8,
  },
  checkIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    marginRight: 12,
  },
  numberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(89, 122, 244, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    marginRight: 12,
  },
  numberBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#597AF4",
  },
  itemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#597AF4",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#597AF4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#597AF4",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#597AF4",
    fontSize: 15,
    fontWeight: "700",
  },
});
