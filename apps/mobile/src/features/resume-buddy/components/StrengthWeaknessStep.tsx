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
import { LinearGradient } from "expo-linear-gradient";
import { useThemeToggle } from "@/hooks/useThemeToggle";

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
  const { isDark } = useThemeToggle();
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
    <View style={{ flex: 1, backgroundColor: isDark ? "#0F1020" : "#F8F9FC" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Key Strengths Collapsible Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? "#1A1C29" : "#ffffff",
              borderColor: isDark ? "#2A2D40" : "#E5E7EB",
              shadowColor: isDark ? "#000" : "#0f172a",
              shadowOpacity: isDark ? 0.2 : 0.02,
            },
          ]}
        >
          <Pressable onPress={toggleStrengths} style={styles.cardHeader}>
            <View
              style={[
                styles.badge,
                { backgroundColor: isDark ? "rgba(76, 175, 80, 0.15)" : "rgba(76, 175, 80, 0.1)" },
              ]}
            >
              <Feather name="check-circle" size={20} color="#4CAF50" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.cardTitle, { color: isDark ? "#F8FAFC" : "#1F2937" }]}>
                Key Strengths
              </Text>
              <Text style={[styles.cardSubtitle, { color: isDark ? "#94A3B8" : "#6B7280" }]}>
                {strengths.length} items
              </Text>
            </View>
            <Feather
              name={strengthsExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={isDark ? "#64748B" : "#94a3b8"}
            />
          </Pressable>

          {strengthsExpanded && (
            <View style={styles.listContainer}>
              {strengths.length === 0 ? (
                <Text style={[styles.emptyText, { color: isDark ? "#94A3B8" : "#6B7280" }]}>
                  No key strengths detected yet.
                </Text>
              ) : (
                <>
                  {visibleStrengths.map((item, idx) => (
                    <View key={`strength-${idx}`} style={styles.listItem}>
                      <View style={[styles.bullet, { backgroundColor: "#4CAF50" }]} />
                      <Text style={[styles.itemText, { color: isDark ? "#F8FAFC" : "#1F2937" }]}>
                        {item}
                      </Text>
                    </View>
                  ))}

                  {hasMoreStrengths && !showAllStrengths && (
                    <Pressable
                      onPress={() => setShowAllStrengths(true)}
                      style={[
                        styles.viewAllButton,
                        {
                          backgroundColor: isDark ? "transparent" : "#ffffff",
                          borderColor: isDark ? "#6366f1" : "#597AF4",
                        },
                      ]}
                    >
                      <Text style={[styles.viewAllText, { color: isDark ? "#818cf8" : "#597AF4" }]}>
                        View All
                      </Text>
                    </Pressable>
                  )}
                  {showAllStrengths && (
                    <Pressable
                      onPress={() => setShowAllStrengths(false)}
                      style={[
                        styles.viewAllButton,
                        {
                          backgroundColor: isDark ? "transparent" : "#ffffff",
                          borderColor: isDark ? "#6366f1" : "#597AF4",
                        },
                      ]}
                    >
                      <Text style={[styles.viewAllText, { color: isDark ? "#818cf8" : "#597AF4" }]}>
                        Show Less
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          )}
        </View>

        {/* Areas to Improve Collapsible Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? "#1A1C29" : "#ffffff",
              borderColor: isDark ? "#2A2D40" : "#E5E7EB",
              shadowColor: isDark ? "#000" : "#0f172a",
              shadowOpacity: isDark ? 0.2 : 0.02,
            },
          ]}
        >
          <Pressable onPress={toggleWeaknesses} style={styles.cardHeader}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isDark
                    ? "rgba(148, 163, 184, 0.15)"
                    : "rgba(107, 114, 128, 0.1)",
                },
              ]}
            >
              <Feather name="alert-triangle" size={20} color={isDark ? "#94A3B8" : "#6B7280"} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.cardTitle, { color: isDark ? "#F8FAFC" : "#1F2937" }]}>
                Areas to Improve
              </Text>
              <Text style={[styles.cardSubtitle, { color: isDark ? "#94A3B8" : "#6B7280" }]}>
                {weaknesses.length} items
              </Text>
            </View>
            <Feather
              name={weaknessesExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={isDark ? "#64748B" : "#94a3b8"}
            />
          </Pressable>

          {weaknessesExpanded && (
            <View style={styles.listContainer}>
              {weaknesses.length === 0 ? (
                <Text style={[styles.emptyText, { color: isDark ? "#94A3B8" : "#6B7280" }]}>
                  All checks passed successfully!
                </Text>
              ) : (
                <>
                  {visibleWeaknesses.map((item, idx) => (
                    <View key={`weakness-${idx}`} style={styles.listItem}>
                      <View
                        style={[styles.bullet, { backgroundColor: isDark ? "#94A3B8" : "#6B7280" }]}
                      />
                      <Text style={[styles.itemText, { color: isDark ? "#F8FAFC" : "#1F2937" }]}>
                        {item}
                      </Text>
                    </View>
                  ))}

                  {hasMoreWeaknesses && !showAllWeaknesses && (
                    <Pressable
                      onPress={() => setShowAllWeaknesses(true)}
                      style={[
                        styles.viewAllButton,
                        {
                          backgroundColor: isDark ? "transparent" : "#ffffff",
                          borderColor: isDark ? "#6366f1" : "#597AF4",
                        },
                      ]}
                    >
                      <Text style={[styles.viewAllText, { color: isDark ? "#818cf8" : "#597AF4" }]}>
                        View All
                      </Text>
                    </Pressable>
                  )}
                  {showAllWeaknesses && (
                    <Pressable
                      onPress={() => setShowAllWeaknesses(false)}
                      style={[
                        styles.viewAllButton,
                        {
                          backgroundColor: isDark ? "transparent" : "#ffffff",
                          borderColor: isDark ? "#6366f1" : "#597AF4",
                        },
                      ]}
                    >
                      <Text style={[styles.viewAllText, { color: isDark ? "#818cf8" : "#597AF4" }]}>
                        Show Less
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky footer action button */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: isDark ? "#0F1020" : "#ffffff",
            borderTopColor: isDark ? "#1E293B" : "#f1f5f9",
          },
        ]}
      >
        <Pressable
          onPress={onNext}
          style={{
            borderRadius: 12,
            overflow: "hidden",
            width: "100%",
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.4 : 0.15,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <LinearGradient
            colors={isDark ? ["#6366f1", "#3b82f6"] : ["#4f46e5", "#3b82f6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 48,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </LinearGradient>
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
