import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, SafeAreaView, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
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
  onFinishTest,
  sessionId,
  stopTimer,
}: AssessmentHeaderProps) {
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
    Alert.alert(
      "Finish Test",
      "Are you sure you want to submit your assessment and finish the test?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Finish", style: "destructive", onPress: onFinishTest },
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
    <View className="mb-6 pt-2">
      <View className="flex-row justify-between items-center mb-4">
        <View className="bg-slate-100 px-4 py-2.5 rounded-full border border-slate-200 flex-row items-center shadow-sm">
          <Feather name="clock" size={14} color="#64748B" className="mr-2" />
          <Text className="text-xs font-bold text-slate-700">
            Test Time: {formatTime(secondsElapsed)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleFinishPress}
          className="bg-slate-100 px-5 py-2.5 rounded-full border border-slate-200 shadow-sm"
        >
          <Text className="text-xs font-bold text-slate-800">Finish Test</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <View className="bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
          <Text className="text-xs font-bold text-slate-700">{sectionName}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-slate-100 px-4 py-2 rounded-full border border-slate-200 flex-row items-center shadow-sm"
        >
          <Text className="text-xs font-bold text-slate-900 mr-1.5">{skillName}</Text>
          <Feather name="chevron-down" size={14} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <View className="mb-1">
        <View className="h-2.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
          <View
            className="h-full bg-slate-800 rounded-full shadow-sm"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </View>
        <Text className="text-xs font-bold text-slate-400 text-right">
          {currentQuestion + 1}/{totalQuestions}
        </Text>
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
