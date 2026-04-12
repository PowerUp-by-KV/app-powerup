import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SessionHistory } from "../types";

interface SessionCardProps {
  session: SessionHistory;
  onPress: () => void;
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-orange-100";
    return "bg-red-100";
  };

  const formattedDate = new Date(session.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center flex-1">
          <Ionicons name="document-text-outline" size={20} color="#2563EB" />
          <Text className="ml-2 font-bold text-base text-slate-900">Mock Interview</Text>
        </View>

        <View
          className={`flex-row px-3 py-1 rounded-full items-center ${getScoreBg(session.score)}`}
        >
          <Text className={`text-xs font-bold ${getScoreColor(session.score)}`}>
            {session.score}% Score
          </Text>
        </View>
      </View>

      <View className="mb-2 flex-row justify-between">
        <Text className="text-sm text-slate-500">📅 {formattedDate}</Text>
        <Text className="text-sm font-semibold text-blue-600">Band {session.cefrBand}</Text>
      </View>

      <View className="flex-row justify-between items-center border-t border-slate-50 pt-2 mt-1">
        <Text className="text-sm text-slate-400">Tap to replay Q&A</Text>
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );
}
