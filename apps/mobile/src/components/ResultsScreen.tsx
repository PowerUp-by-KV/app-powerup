import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { getAllResults, getOverallStats } from "@/services/results-service";
import { AssessmentResult } from "@/services/results-service";

export default function ResultsScreen() {
  const router = useRouter();
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [overall, setOverall] = useState({
    totalMarks: 0,
    obtainedMarks: 0,
    percentage: 0,
    isPassed: false,
  });

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
    <View className="flex-1 p-4 bg-white">
      {/* Overall Score */}
      <View className="bg-gray-100 rounded-2xl p-5 mb-6 items-center">
        <Text className="text-sm text-gray-600 mb-2">Overall Score</Text>
        <Text className="text-4xl font-bold text-indigo-600 mb-2">
          {overall.obtainedMarks}/{overall.totalMarks}
        </Text>
        <Text className="text-2xl font-semibold text-gray-800 mb-4">
          {overall.percentage.toFixed(1)}%
        </Text>

        {overall.isPassed ? (
          <View className="bg-green-100 py-3 px-4 rounded-lg mt-2">
            <Text className="text-lg font-bold text-green-700 text-center mb-1">
              🎉 Congratulations! 🎉
            </Text>
            <Text className="text-sm text-green-700 text-center">
              You have passed all assessments!
            </Text>
          </View>
        ) : (
          <View className="bg-red-100 py-3 px-4 rounded-lg mt-2">
            <Text className="text-lg font-bold text-red-700 text-center mb-1">Try Again</Text>
            <Text className="text-sm text-red-700 text-center">
              You need more practice. Keep learning!
            </Text>
          </View>
        )}
      </View>

      {/* Individual Results */}
      <Text className="text-base font-semibold text-gray-800 mb-3">Assessment Breakdown</Text>
      <FlatList
        scrollEnabled={false}
        data={results}
        keyExtractor={(item) => item.type}
        renderItem={({ item }) => (
          <View
            className={`border-2 rounded-2xl p-4 mb-3 ${item.isPassed ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50"}`}
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-semibold text-gray-800">{item.title}</Text>
              <Text
                className={`py-1 px-3 rounded-full text-xs font-bold text-white ${item.isPassed ? "bg-green-600" : "bg-red-600"}`}
              >
                {item.isPassed ? "PASS" : "FAIL"}
              </Text>
            </View>

            <View className="mb-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">Score:</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {item.obtainedMarks}/{item.totalMarks}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Percentage:</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {item.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>

            <View className="h-2 bg-gray-300 rounded-full overflow-hidden">
              <View
                style={{
                  width: `${item.percentage}%`,
                }}
                className={item.isPassed ? "bg-green-500 h-full" : "bg-red-500 h-full"}
              />
            </View>
          </View>
        )}
      />

      {/* Action Button */}
      <TouchableOpacity
        className="bg-indigo-600 py-3 rounded-lg items-center mt-4"
        onPress={handleGoToDashboard}
      >
        <Text className="text-white text-base font-semibold">Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}
