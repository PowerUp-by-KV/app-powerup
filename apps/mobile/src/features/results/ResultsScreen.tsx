import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { getAllResults, getOverallStats } from "@/services/results-service";
import { AssessmentResult } from "@/services/results-service";

interface OverallStats {
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  isPassed: boolean;
}

const initialOverallStats: OverallStats = {
  totalMarks: 0,
  obtainedMarks: 0,
  percentage: 0,
  isPassed: false,
};

export function ResultsScreen(): React.ReactElement {
  const router = useRouter();
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [overall, setOverall] = useState<OverallStats>(initialOverallStats);

  useEffect(() => {
    const rawResults = getAllResults();
    const resultsArray = Object.values(rawResults).filter(Boolean) as AssessmentResult[];
    setResults(resultsArray);
    setOverall(getOverallStats());
  }, []);

  const handleGoToDashboard = (): void => {
    router.replace("/dashboard");
  };

  const renderResultItem = ({ item }: { item: AssessmentResult }): React.ReactElement => (
    <View
      className={`border-2 rounded-lg p-4 mb-3 ${
        item.isPassed ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50"
      }`}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-base font-semibold text-gray-800">{item.title}</Text>
        <Text
          className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
            item.isPassed ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {item.isPassed ? "PASS" : "FAIL"}
        </Text>
      </View>

      <View className="mb-3">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-500">Score:</Text>
          <Text className="text-sm font-semibold text-gray-800">
            {item.obtainedMarks}/{item.totalMarks}
          </Text>
        </View>

        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-500">Percentage:</Text>
          <Text className="text-sm font-semibold text-gray-800">{item.percentage.toFixed(1)}%</Text>
        </View>
      </View>

      <View className="h-2 bg-gray-200 rounded overflow-hidden">
        <View
          className={`h-full rounded ${item.isPassed ? "bg-green-600" : "bg-red-600"}`}
          style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
        />
      </View>
    </View>
  );

  return (
    <View className="flex-1 p-4 bg-white">
      <View className="bg-gray-100 rounded-xl p-5 mb-6 items-center">
        <Text className="text-sm text-gray-500 mb-2">Overall Score</Text>
        <Text className="text-4xl font-bold text-indigo-600 mb-2">
          {overall.obtainedMarks}/{overall.totalMarks}
        </Text>
        <Text className="text-2xl font-semibold text-gray-800 mb-4">
          {overall.percentage.toFixed(1)}%
        </Text>

        {overall.isPassed ? (
          <View className="bg-green-100 py-3 px-4 rounded-lg mt-2">
            <Text className="text-lg font-bold text-green-600 text-center mb-1">
              🎉 Congratulations! 🎉
            </Text>
            <Text className="text-sm text-green-600 text-center">
              You have passed all assessments!
            </Text>
          </View>
        ) : (
          <View className="bg-red-100 py-3 px-4 rounded-lg mt-2">
            <Text className="text-lg font-bold text-red-600 text-center mb-1">Try Again</Text>
            <Text className="text-sm text-red-600 text-center">
              You need more practice. Keep learning!
            </Text>
          </View>
        )}
      </View>

      <Text className="text-base font-semibold text-gray-800 mb-3">Assessment Breakdown</Text>

      <FlatList
        className="flex-grow-0"
        contentContainerStyle={{ marginBottom: 16 }}
        scrollEnabled={false}
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderResultItem}
        ListEmptyComponent={() => (
          <Text className="text-center text-sm text-gray-500">No results available yet.</Text>
        )}
      />

      <TouchableOpacity
        className="bg-indigo-600 py-3.5 rounded-lg items-center mt-4"
        onPress={handleGoToDashboard}
      >
        <Text className="text-white text-base font-semibold">Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}
