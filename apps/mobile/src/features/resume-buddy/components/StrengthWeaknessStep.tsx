import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface StrengthWeaknessStepProps {
  strengths: string[];
  weaknesses: string[];
  onNext: () => void;
}

export function StrengthWeaknessStep({
  strengths = [],
  weaknesses = [],
  onNext,
}: StrengthWeaknessStepProps) {
  const [strengthsExpanded, setStrengthsExpanded] = useState(true);
  const [weaknessesExpanded, setWeaknessesExpanded] = useState(true);

  const [showAllStrengths, setShowAllStrengths] = useState(false);
  const [showAllWeaknesses, setShowAllWeaknesses] = useState(false);

  const toggleStrengths = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStrengthsExpanded(!strengthsExpanded);
  };

  const toggleWeaknesses = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setWeaknessesExpanded(!weaknessesExpanded);
  };

  const limit = 4;
  const hasMoreStrengths = strengths.length > limit;
  const hasMoreWeaknesses = weaknesses.length > limit;

  const visibleStrengths = showAllStrengths ? strengths : strengths.slice(0, limit);
  const visibleWeaknesses = showAllWeaknesses ? weaknesses : weaknesses.slice(0, limit);

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9FC" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Key Strengths Collapsible Card */}
        <View style={styles.card}>
          <Pressable onPress={toggleStrengths} style={styles.cardHeader}>
            <View style={[styles.badge, { backgroundColor: "rgba(76, 175, 80, 0.1)" }]}>
              <Feather name="check-circle" size={20} color="#4CAF50" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle}>Key Strengths</Text>
              <Text style={styles.cardSubtitle}>{strengths.length} items</Text>
            </View>
            <Feather
              name={strengthsExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#94a3b8"
            />
          </Pressable>

          {strengthsExpanded && (
            <View style={styles.listContainer}>
              {strengths.length === 0 ? (
                <Text style={styles.emptyText}>No key strengths detected yet.</Text>
              ) : (
                <>
                  {visibleStrengths.map((item, idx) => (
                    <View key={`strength-${idx}`} style={styles.listItem}>
                      <View style={[styles.bullet, { backgroundColor: "#4CAF50" }]} />
                      <Text style={styles.itemText}>{item}</Text>
                    </View>
                  ))}

                  {hasMoreStrengths && !showAllStrengths && (
                    <Pressable
                      onPress={() => setShowAllStrengths(true)}
                      style={styles.viewAllButton}
                    >
                      <Text style={styles.viewAllText}>View All</Text>
                    </Pressable>
                  )}
                  {showAllStrengths && (
                    <Pressable
                      onPress={() => setShowAllStrengths(false)}
                      style={styles.viewAllButton}
                    >
                      <Text style={styles.viewAllText}>Show Less</Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          )}
        </View>

        {/* Areas to Improve Collapsible Card */}
        <View style={styles.card}>
          <Pressable onPress={toggleWeaknesses} style={styles.cardHeader}>
            <View style={[styles.badge, { backgroundColor: "rgba(107, 114, 128, 0.1)" }]}>
              <Feather name="alert-triangle" size={20} color="#6B7280" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle}>Areas to Improve</Text>
              <Text style={styles.cardSubtitle}>{weaknesses.length} items</Text>
            </View>
            <Feather
              name={weaknessesExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#94a3b8"
            />
          </Pressable>

          {weaknessesExpanded && (
            <View style={styles.listContainer}>
              {weaknesses.length === 0 ? (
                <Text style={styles.emptyText}>All checks passed successfully!</Text>
              ) : (
                <>
                  {visibleWeaknesses.map((item, idx) => (
                    <View key={`weakness-${idx}`} style={styles.listItem}>
                      <View style={[styles.bullet, { backgroundColor: "#6B7280" }]} />
                      <Text style={styles.itemText}>{item}</Text>
                    </View>
                  ))}

                  {hasMoreWeaknesses && !showAllWeaknesses && (
                    <Pressable
                      onPress={() => setShowAllWeaknesses(true)}
                      style={styles.viewAllButton}
                    >
                      <Text style={styles.viewAllText}>View All</Text>
                    </Pressable>
                  )}
                  {showAllWeaknesses && (
                    <Pressable
                      onPress={() => setShowAllWeaknesses(false)}
                      style={styles.viewAllButton}
                    >
                      <Text style={styles.viewAllText}>Show Less</Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky footer action button */}
      <View style={styles.footer}>
        <Pressable onPress={onNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  listContainer: {
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 12,
  },
  itemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    flex: 1,
    lineHeight: 20,
  },
  viewAllButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#597AF4",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    width: "100%",
  },
  viewAllText: {
    color: "#597AF4",
    fontSize: 15,
    fontWeight: "700",
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
  },
  nextButton: {
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
  nextButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
});
