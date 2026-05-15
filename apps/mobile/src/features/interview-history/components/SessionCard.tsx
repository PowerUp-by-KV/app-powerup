/**
 * SessionCard Component - Displays a single practice session in the list
 * Shows session date, status, response count, and navigation to detail view
 */

import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
import type { PracticeSession } from "@/services/interview-api";
import { getStatusConfig, formatSessionDate } from "../constants";

interface SessionCardProps {
  session: PracticeSession;
  onPress: () => void;
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  const statusCfg = getStatusConfig(session.status);

  return (
    <Pressable
      className="mb-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm active:scale-[0.98] active:bg-slate-50"
      onPress={onPress}
    >
      {/* Header: date + status badge */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <MaterialIcons name="event" size={18} color="#64748b" />
          <Text className="text-sm font-medium text-slate-600">
            {formatSessionDate(session.created_at)}
          </Text>
        </View>

        <View
          className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
          style={{ backgroundColor: statusCfg.bg }}
        >
          <MaterialIcons name={statusCfg.icon} size={14} color={statusCfg.color} />
          <Text className="text-xs font-semibold" style={{ color: statusCfg.color }}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      {/* Body: response count */}
      <View className="mb-3 border-b border-slate-100 pb-3">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="question-answer" size={18} color="#3b82f6" />
          <Text className="text-sm font-medium text-slate-700">
            {session.response_count} {session.response_count === 1 ? "Response" : "Responses"}
          </Text>
        </View>
      </View>

      {/* Footer: View Replay */}
      <View className="flex-row items-center justify-end gap-1">
        <Text className="text-sm font-semibold text-blue-500">View Replay</Text>
        <MaterialIcons name="chevron-right" size={22} color="#3b82f6" />
      </View>
    </Pressable>
  );
}
