import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useCompleteDayMutation } from "@/services/lesson-api";
import { LinearGradient } from "expo-linear-gradient";
import { Trophy, ArrowRight, RotateCcw, PartyPopper } from "lucide-react-native";
import { useDispatch } from "react-redux";
import { completeDay as completeDayAction } from "@/store/slices/progressSlice";
import { useActivityProgress } from "./hooks/useActivityProgress";
export const DayCompleteScreen = ({
  progress,
}: {
  progress: ReturnType<typeof useActivityProgress>;
}) => {
  const params = useLocalSearchParams<{
    moduleId: string;
    dayNo: string;
    stageId: string;
    cefr_level: string;
  }>();
  const [complete] = useCompleteDayMutation();
  const dispatch = useDispatch();

  const averageScore = progress?.averageScore || 0;
  const isPassed = averageScore >= 60;
  const currentDayNo = params.dayNo ? parseInt(params.dayNo) : 1;

  useEffect(() => {
    if (isPassed && params.moduleId && params.dayNo) {
      // 1. Mark the specific day as completed within the sub-module
      complete({
        moduleId: params.moduleId,
        dayNo: currentDayNo,
        scores: progress.scores || {},
      });

      // 2. Update Redux for the sub-module's 12-day cycle
      dispatch(
        completeDayAction({
          moduleId: params.moduleId,
          dayNo: currentDayNo,
        }),
      );

      // 3. If it's the last day of the sub-module (Day 12), mark this sub-module as completed in the main Stage
      if (currentDayNo === 12 && params.stageId && params.moduleId) {
        // Extract the sub-module index from ID like "placeholder-1" -> 1
        const subModuleIndex = parseInt(params.moduleId.replace("placeholder-", ""));
        if (!isNaN(subModuleIndex)) {
          dispatch(
            completeDayAction({
              moduleId: params.stageId,
              dayNo: subModuleIndex,
            }),
          );

          // 4. If this was the 12th sub-module of the stage, mark the stage as completed in the global journey
          // Note: "stages" progress is tracked in a special "global" key or just implied.
          // For now, we follow the pattern of marking dayNo in the parent moduleId.
          if (subModuleIndex === 12) {
            dispatch(
              completeDayAction({
                moduleId: "global-journey",
                dayNo: parseInt(params.stageId.replace("m", "")),
              }),
            );
          }
        }
      }
    }
  }, [
    isPassed,
    dispatch,
    params.moduleId,
    params.dayNo,
    params.stageId,
    currentDayNo,
    progress.scores,
    complete,
  ]);

  const ScoreRow = ({ label, score }: { label: string; score: number }) => (
    <View className="flex-row justify-between items-center mb-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <Text className="text-slate-600 font-bold capitalize">{label}</Text>
      <View className="flex-row items-center">
        <View
          className={`px-2 py-0.5 rounded-lg mr-2 ${score >= 60 ? "bg-emerald-50" : "bg-red-50"}`}
        >
          <Text
            className={`text-[12px] font-bold ${score >= 60 ? "text-emerald-700" : "text-red-700"}`}
          >
            {score}%
          </Text>
        </View>
        <Text className="text-xl font-bold">{score >= 60 ? "✅" : "❌"}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-[#F8F9FA]" contentContainerStyle={{ paddingBottom: 40 }}>
      <LinearGradient
        colors={isPassed ? ["#475569", "#1E293B"] : ["#94A3B8", "#475569"]}
        className="pt-20 pb-12 px-8 items-center rounded-b-[40px] shadow-lg"
      >
        <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-6">
          {isPassed ? <Trophy size={40} color="white" /> : <RotateCcw size={40} color="white" />}
        </View>

        <Text className="text-white text-3xl font-bold text-center mb-2">
          {isPassed ? "Day Complete!" : "Keep Practicing!"}
        </Text>
        <Text className="text-white/80 text-center font-medium">
          {isPassed ? "You've mastered today's lessons." : "You need 60% average to pass today."}
        </Text>
      </LinearGradient>

      <View className="px-6 -mt-8">
        <View className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 items-center mb-8">
          <Text className="text-slate-400 font-bold text-[12px] uppercase tracking-widest mb-1">
            Average Score
          </Text>
          <Text
            className={`text-5xl font-black ${isPassed ? "text-emerald-600" : "text-slate-700"}`}
          >
            {Math.round(averageScore)}%
          </Text>

          {isPassed && (
            <View className="flex-row items-center mt-4 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
              <PartyPopper size={16} color="#d97706" />
              <Text className="ml-2 text-amber-800 font-bold">
                +{progress.totalPoints} Points Earned
              </Text>
            </View>
          )}
        </View>

        {Object.entries(progress.scores).map(([type, score]) => (
          <ScoreRow key={type} label={type} score={score as number} />
        ))}

        <View className="mt-8 gap-y-4">
          {isPassed ? (
            <>
              {parseInt(params.dayNo!) < 12 && (
                <TouchableOpacity
                  className="bg-emerald-600 p-5 rounded-full flex-row items-center justify-center shadow-lg"
                  onPress={() => {
                    router.replace({
                      pathname: "/(tabs)/my-learning/lesson/[moduleId]/[dayNo]",
                      params: {
                        moduleId: params.moduleId,
                        dayNo: parseInt(params.dayNo!) + 1,
                        cefr_level: params.cefr_level,
                        stageId: params.stageId || "m1",
                      },
                    });
                  }}
                >
                  <Text className="text-white font-bold text-lg mr-2">
                    Go to Day {parseInt(params.dayNo!) + 1}
                  </Text>
                  <ArrowRight size={22} color="white" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                className="bg-[#475569] p-5 rounded-full flex-row items-center justify-center shadow-lg"
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/my-learning/modules/[moduleId]/[subModuleId]",
                    params: {
                      moduleId: params.stageId || "m1",
                      subModuleId: params.moduleId,
                    },
                  })
                }
              >
                <Text className="text-white font-bold text-lg mr-2">Return to Journey</Text>
                <ArrowRight size={22} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => progress.resetProgress()}>
                <Text className="text-center text-slate-400 font-bold">Review Lessons</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              className="bg-[#475569] p-5 rounded-full flex-row items-center justify-center shadow-lg"
              onPress={() => progress.resetProgress()}
            >
              <RotateCcw size={22} color="white" className="mr-2" />
              <Text className="text-white font-bold text-lg">Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};
