/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, SafeAreaView, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { getCompletedSections } from "@/services/auth-storage";
import { useGetAssessmentStatusQuery } from "@/services/assessment-api";

export type SectionCode =
  | "A_READING"
  | "A_SPEAKING"
  | "A_LISTEN"
  | "B_SPEAKING"
  | "C_GRAMMAR"
  | "D_LISTEN_ANSWER";

interface AssessmentHeaderProps {
  sectionName?: string;
  skillName: string;
  currentQuestion: number; // 0-indexed
  totalQuestions: number;
  onFinishTest: () => void;
  sessionId?: string;
  stopTimer?: boolean;
}

const SKILLS_MAP = [
  { label: "Reading Skills", route: "/read", code: "A_READING" as const },
  { label: "Speaking Skills", route: "/speak-read", code: "A_SPEAKING" as const },
  { label: "Expressive Speaking", route: "/listen-audio", code: "A_LISTEN" as const },
  { label: "Speaking Practice", route: "/speak", code: "B_SPEAKING" as const },
  { label: "Grammar & Language Usage", route: "/grammar", code: "C_GRAMMAR" as const },
  { label: "Listening Comprehension", route: "/listen", code: "D_LISTEN_ANSWER" as const },
];

export function AssessmentHeader({
  sectionName = "Section A",
  skillName,
  currentQuestion,
  totalQuestions,
  onFinishTest: _onFinishTest,
  sessionId,
  stopTimer,
}: AssessmentHeaderProps) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Fetch assessment status from backend using RTK Query
  const { data: backendStatus } = useGetAssessmentStatusQuery(
    { session_id: sessionId! },
    { skip: !sessionId },
  );

  useEffect(() => {
    if (backendStatus) {
      const sections = backendStatus.completed_sections || (backendStatus as any).completedSections;
      if (sections && Array.isArray(sections)) {
        setCompletedSections(sections);
      } else {
        getCompletedSections().then(setCompletedSections);
      }
    } else {
      getCompletedSections().then(setCompletedSections);
    }
  }, [backendStatus, modalVisible]);

  useEffect(() => {
    if (stopTimer) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [stopTimer]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFinishPress = () => {
    if (Platform.OS === "web") {
      const confirmExit = window.confirm(
        "Are you sure you want to exit the assessment? You can resume it later from where you left off.",
      );
      if (confirmExit) {
        router.replace("/(tabs)/my-learning" as never);
      }
      return;
    }

    Alert.alert(
      "Exit Assessment",
      "Are you sure you want to exit the assessment? You can resume it later from where you left off.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => {
            router.replace("/(tabs)/my-learning" as never);
          },
        },
      ],
    );
  };

  const handleSkillSelect = (skill: (typeof SKILLS_MAP)[number]) => {
    const isDone = completedSections.includes(skill.code);
    const isActive = skill.label === skillName;

    // Block navigation to completed or future sections
    if (isDone) {
      return; // Already completed — locked
    }
    if (isActive) {
      setModalVisible(false);
      return; // Already on this section
    }

    // Only allow navigating to the current active section (not forward or backward)
    setModalVisible(false);
  };

  const progressPercent = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  return (
    <View className="mb-5 pt-1">
      {/* Top Header Row with Close 'X' and Horizontal Progress Bar */}
      <View className="flex-row items-center w-full px-1 mb-5">
        <TouchableOpacity
          onPress={handleFinishPress}
          className="w-10 h-10 rounded-full bg-white border border-slate-100 items-center justify-center shadow-sm active:opacity-85"
        >
          <Feather name="x" size={20} color="#0f172a" />
        </TouchableOpacity>
        <View className="flex-1 h-2 bg-slate-200/80 rounded-full ml-4 overflow-hidden">
          <LinearGradient
            colors={["#3b82f6", "#22c55e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            className="h-full rounded-full"
          />
        </View>
      </View>

      {/* Section details with Category title, Timer and Dropdown trigger */}
      <View className="flex-row items-center justify-between px-1 mb-2">
        <View className="flex-row items-center">
          <Text className="text-xs font-extrabold text-slate-400 tracking-widest uppercase mr-2.5">
            {sectionName}
          </Text>
          <View className="bg-slate-100/60 px-2 py-0.5 rounded-md border border-slate-200/20">
            <Text className="text-[10px] font-extrabold text-slate-500">
              🕒 {formatTime(secondsElapsed)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-row items-center bg-slate-100/80 active:bg-slate-200/60 px-3.5 py-1.5 rounded-full border border-slate-200/40 shadow-xs"
          activeOpacity={0.7}
        >
          <Text className="text-[11px] font-extrabold text-slate-700 mr-1.5">{skillName}</Text>
          <Feather name="chevron-down" size={11} color="#334155" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <SafeAreaView className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-bold text-slate-900">Assessment Sections</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="p-2 bg-slate-100 rounded-full"
              >
                <Feather name="x" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <View className="gap-3">
              {SKILLS_MAP.map((skill, index) => {
                const isActive = skill.label === skillName;
                const isDone = completedSections.includes(skill.code);
                const isLocked = !isDone && !isActive;

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSkillSelect(skill)}
                    disabled={isDone || isLocked}
                    activeOpacity={isDone || isLocked ? 1 : 0.7}
                    className={`py-4 px-5 rounded-2xl flex-row justify-between items-center border ${
                      isDone
                        ? "bg-green-50 border-green-200"
                        : isActive
                          ? "bg-indigo-50 border-indigo-200"
                          : "bg-slate-50 border-slate-100 opacity-50"
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      {isDone && (
                        <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3">
                          <Feather name="check" size={14} color="#fff" />
                        </View>
                      )}
                      {isActive && !isDone && (
                        <View className="w-6 h-6 bg-indigo-500 rounded-full items-center justify-center mr-3">
                          <Feather name="edit-3" size={12} color="#fff" />
                        </View>
                      )}
                      {isLocked && (
                        <View className="w-6 h-6 bg-slate-300 rounded-full items-center justify-center mr-3">
                          <Feather name="lock" size={12} color="#fff" />
                        </View>
                      )}
                      <View>
                        <Text
                          className={`text-sm font-bold ${
                            isDone
                              ? "text-green-700"
                              : isActive
                                ? "text-indigo-600"
                                : "text-slate-400"
                          }`}
                        >
                          {skill.label}
                        </Text>
                        <Text
                          className={`text-[11px] mt-0.5 ${
                            isDone
                              ? "text-green-500"
                              : isActive
                                ? "text-indigo-400"
                                : "text-slate-300"
                          }`}
                        >
                          {isDone ? "Completed" : isActive ? "In Progress" : "Locked"}
                        </Text>
                      </View>
                    </View>
                    {isDone && <Feather name="check-circle" size={20} color="#22C55E" />}
                    {isActive && !isDone && (
                      <Feather name="arrow-right-circle" size={20} color="#6366f1" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
