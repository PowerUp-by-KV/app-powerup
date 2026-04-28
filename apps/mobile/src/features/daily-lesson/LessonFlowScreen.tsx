import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useGetDayActivitiesQuery } from "@/services/lesson-api";
import { useActivityProgress } from "./hooks/useActivityProgress";
import { ListeningActivity } from "./ListeningActivity";
import { ReadingActivity } from "./ReadingActivity";
import { VocabularyActivity } from "./VocabularyActivity";
import { SpeakingActivity } from "./SpeakingActivity";
import { GrammarActivity } from "./GrammarActivity";
import { WritingActivity } from "./WritingActivity";
import { DayCompleteScreen } from "./DayCompleteScreen";
import { X } from "lucide-react-native";

import { ActivityTimer } from "@/components/ui/ActivityTimer";
import { DayOverviewScreen } from "./DayOverviewScreen";

export const LessonFlowScreen = () => {
  const params = useLocalSearchParams<{
    moduleId: string;
    dayNo: string;
    cefr_level: string;
    stageId: string;
  }>();

  const { moduleId, dayNo, cefr_level, stageId } = params;

  const { data: activities, isLoading: isActivitiesLoading } = useGetDayActivitiesQuery({
    moduleId: moduleId!,
    dayNo: parseInt(dayNo!),
    cefr_level: cefr_level!,
  });

  const progress = useActivityProgress(activities || [], moduleId!, parseInt(dayNo!));

  const currentActivityData = activities?.[progress.currentIndex];

  const handleExit = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/(tabs)/my-learning/modules/${stageId || "m1"}/${moduleId}`);
    }
  };

  if (isActivitiesLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator color="#475569" />
      </View>
    );
  }

  const renderContent = () => {
    switch (progress.currentActivity) {
      case "overview":
        return (
          <DayOverviewScreen
            progress={progress}
            onSelect={(index) => progress.jumpToIndex(index)}
          />
        );
      case "listening":
        return <ListeningActivity progress={progress} />;
      case "grammar":
        return <GrammarActivity progress={progress} />;
      case "reading":
        return <ReadingActivity progress={progress} />;
      case "vocabulary":
        return <VocabularyActivity progress={progress} />;
      case "speaking":
        return <SpeakingActivity progress={progress} />;
      case "writing":
        return <WritingActivity progress={progress} />;
      case "complete":
        return <DayCompleteScreen progress={progress} />;
      default:
        return null;
    }
  };

  const getProgressPercentage = () => {
    if (progress.currentActivity === "overview") return 0;
    if (progress.currentActivity === "complete") return 100;

    const activityCount = activities?.length || 4;
    return Math.round(((progress.currentIndex + 1) / (activityCount + 1)) * 100);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header / Progress Bar */}
      <View className="px-6 pt-16 pb-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={handleExit} className="mr-4">
            <X size={24} color="#1E293B" />
          </TouchableOpacity>

          <View className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <View
              style={{ width: `${getProgressPercentage()}%` }}
              className="h-full bg-[#475569] rounded-full"
            />
          </View>

          <Text className="ml-4 text-[12px] font-bold text-slate-500">
            {progress.currentActivity === "complete" ? "100%" : `${getProgressPercentage()}%`}
          </Text>
        </View>

        {currentActivityData?.time_limit && progress.currentActivity !== "complete" && (
          <View className="flex-row justify-center">
            <ActivityTimer
              duration={currentActivityData.time_limit}
              paused={progress.currentActivity === "overview"}
              onTimeUp={() => console.log("Time is up!")}
            />
          </View>
        )}
      </View>

      <View className="flex-1">{renderContent()}</View>
    </View>
  );
};
