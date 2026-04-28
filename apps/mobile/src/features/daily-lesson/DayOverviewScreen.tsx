import React from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useGetDayActivitiesQuery } from "@/services/lesson-api";
import { HighFidelityCard } from "@/components/ui/HighFidelityCard";
import { ArrowRight } from "lucide-react-native";
import { useActivityProgress } from "./hooks/useActivityProgress";

interface DayOverviewScreenProps {
  progress: ReturnType<typeof useActivityProgress>;
  onSelect?: (index: number) => void;
}

export const DayOverviewScreen: React.FC<DayOverviewScreenProps> = ({ progress, onSelect }) => {
  const { moduleId, dayNo, cefr_level } = useLocalSearchParams<{
    moduleId: string;
    dayNo: string;
    cefr_level: string;
  }>();

  const {
    data: activities,
    isLoading,
    isError,
  } = useGetDayActivitiesQuery({
    moduleId: moduleId!,
    dayNo: parseInt(dayNo!),
    cefr_level: cefr_level!,
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#475569" />
        <Text className="mt-4 text-slate-500 font-medium tracking-tight">
          Preparing activities...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-10">
        <Text className="text-xl font-bold text-slate-800 mb-2">Error Loading Activities</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-8 pt-6 pb-6">
        <Text className="text-[28px] font-extrabold text-[#1E293B]">Daily Activities</Text>
        <Text className="text-[#94A3B8] text-[15px] font-bold mt-0.5">Focus for Day {dayNo}</Text>
      </View>

      <ScrollView className="flex-1 px-12 pt-4" showsVerticalScrollIndicator={false}>
        {activities?.map((activity, index) => {
          const isCompleted = progress.completedIndices.includes(index);
          const isLocked = index > 0 && !progress.completedIndices.includes(index - 1);
          const status = isLocked ? "locked" : isCompleted ? "completed" : "in_progress";

          const metadata: Record<string, { tag: string; duration: string; gradient: string[] }> = {
            listening: { tag: "Auditory", duration: "15m", gradient: ["#475569", "#94A3B8"] },
            reading: { tag: "Comprehension", duration: "10m", gradient: ["#64748B", "#CBD5E1"] },
            vocabulary: { tag: "Language", duration: "12m", gradient: ["#334155", "#64748B"] },
            speaking: { tag: "Communication", duration: "20m", gradient: ["#1E293B", "#475569"] },
            grammar: { tag: "Structure", duration: "10m", gradient: ["#475569", "#94A3B8"] },
            writing: { tag: "Composition", duration: "25m", gradient: ["#1E293B", "#64748B"] },
          };

          const meta = metadata[activity.type] || {
            tag: "Communication",
            duration: "20m",
            gradient: ["#1E293B", "#475569"],
          };

          const displayTitle = activity.type
            ? activity.type.charAt(0).toUpperCase() + activity.type.slice(1)
            : "Activity";

          return (
            <HighFidelityCard
              key={activity.id}
              title={displayTitle}
              tag={activity.scenario_name}
              duration={meta.duration}
              status={status}
              gradient={meta.gradient}
              onPress={() => {
                if (onSelect) {
                  onSelect(index);
                } else {
                  router.push(`/(tabs)/my-learning/lesson/${moduleId}/${dayNo}`);
                }
              }}
            />
          );
        })}

        {progress.allCompleted && (
          <TouchableOpacity
            className="bg-[#1E293B] p-6 rounded-[32px] mt-4 flex-row items-center justify-center shadow-lg"
            onPress={() => progress.nextActivity()}
          >
            <Text className="text-white font-black text-lg mr-2">Finish Lesson</Text>
            <ArrowRight size={22} color="white" />
          </TouchableOpacity>
        )}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
};
