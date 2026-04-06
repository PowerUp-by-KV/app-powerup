import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useProgress } from "./hooks/ProgressContext";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { ProgressBar } from "@/features/progress/components";

const HeatmapSection = ({ title, items, color, icon }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>
      {title} {icon}
    </Text>
    <View style={styles.card}>
      {items.map((item: any, index: number) => (
        <View key={index} style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPercentage}>{item.percentage}%</Text>
          </View>
          <ProgressBar progress={item.percentage} color={color} style={styles.itemBar} />
        </View>
      ))}
    </View>
  </View>
);

export const StrengthWeaknessHeatmap = () => {
  const { heatmap } = useProgress();

  // Mock data if null
  const displayHeatmap = heatmap || {
    strongAreas: [
      { name: "Present Tense", percentage: 92 },
      { name: "Basic Vocabulary", percentage: 85 },
      { name: "Simple Sentences", percentage: 82 },
    ],
    needsImprovement: [
      { name: "Prepositions", percentage: 45 },
      { name: "Pronunciation: θ", percentage: 42 },
      { name: "Past Perfect", percentage: 38 },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={28} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Strengths & Weaknesses</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <HeatmapSection
          title="Strong Areas"
          items={displayHeatmap.strongAreas}
          color={COLORS.success}
          icon="✅"
        />

        <HeatmapSection
          title="Needs Improvement"
          items={displayHeatmap.needsImprovement}
          color={COLORS.warning}
          icon="⚠️"
        />

        <TouchableOpacity
          style={styles.practiceButton}
          onPress={() => router.push("/LearningModules")}
        >
          <Text style={styles.practiceButtonText}>Practice Weak Areas</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 20,
    ...FONTS.bold,
    color: COLORS.black,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    ...FONTS.bold,
    color: COLORS.black,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  itemRow: {
    marginBottom: 15,
  },
  itemInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    ...FONTS.medium,
    color: COLORS.black,
  },
  itemPercentage: {
    fontSize: 14,
    ...FONTS.bold,
    color: COLORS.gray,
  },
  itemBar: {
    height: 8,
    borderRadius: 4,
  },
  practiceButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  practiceButtonText: {
    color: COLORS.white,
    fontSize: 16,
    ...FONTS.bold,
  },
});
