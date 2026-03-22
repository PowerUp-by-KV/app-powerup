import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { getAllResults, getOverallStats } from "@/services/results-service";
import { AssessmentResult } from "@/services/results-service";

export default function Results() {
  const router = useRouter();
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [overall, setOverall] = useState({ totalMarks: 0, obtainedMarks: 0, percentage: 0, isPassed: false });

  useEffect(() => {
    const allResults = getAllResults();
    const resultsArray = Object.values(allResults).filter(Boolean) as AssessmentResult[];
    setResults(resultsArray);
    setOverall(getOverallStats());
  }, []);

  const handleGoToDashboard = () => {
    router.replace("/dashboard");
  };

  return (
    <View style={styles.container}>
      {/* Overall Score */}
      <View style={styles.overallContainer}>
        <Text style={styles.overallLabel}>Overall Score</Text>
        <Text style={styles.overallScore}>{overall.obtainedMarks}/{overall.totalMarks}</Text>
        <Text style={styles.overallPercentage}>{overall.percentage.toFixed(1)}%</Text>
        
        {overall.isPassed ? (
          <View style={styles.passContainer}>
            <Text style={styles.passText}>🎉 Congratulations! 🎉</Text>
            <Text style={styles.passMessage}>You have passed all assessments!</Text>
          </View>
        ) : (
          <View style={styles.failContainer}>
            <Text style={styles.failText}>Try Again</Text>
            <Text style={styles.failMessage}>You need more practice. Keep learning!</Text>
          </View>
        )}
      </View>

      {/* Individual Results */}
      <Text style={styles.sectionTitle}>Assessment Breakdown</Text>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
        data={results}
        keyExtractor={(item) => item.type}
        renderItem={({ item }) => (
          <View style={[styles.resultCard, item.isPassed ? styles.passCard : styles.failCard]}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>{item.title}</Text>
              <Text style={[styles.resultBadge, item.isPassed ? styles.passBadge : styles.failBadge]}>
                {item.isPassed ? "PASS" : "FAIL"}
              </Text>
            </View>
            
            <View style={styles.resultDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Score:</Text>
                <Text style={styles.detailValue}>{item.obtainedMarks}/{item.totalMarks}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Percentage:</Text>
                <Text style={styles.detailValue}>{item.percentage.toFixed(1)}%</Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: item.isPassed ? "#16A34A" : "#DC2626",
                  },
                ]}
              />
            </View>
          </View>
        )}
      />

      {/* Action Button */}
      <TouchableOpacity style={styles.button} onPress={handleGoToDashboard}>
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  overallContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  overallLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  overallScore: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4F46E5",
    marginBottom: 8,
  },
  overallPercentage: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  passContainer: {
    backgroundColor: "#DCFCE7",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  passText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16A34A",
    textAlign: "center",
    marginBottom: 4,
  },
  passMessage: {
    fontSize: 14,
    color: "#16A34A",
    textAlign: "center",
  },
  failContainer: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  failText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 4,
  },
  failMessage: {
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    marginBottom: 16,
  },
  resultCard: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  passCard: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },
  failCard: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  resultBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "bold",
  },
  passBadge: {
    backgroundColor: "#16A34A",
    color: "#fff",
  },
  failBadge: {
    backgroundColor: "#DC2626",
    color: "#fff",
  },
  resultDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
