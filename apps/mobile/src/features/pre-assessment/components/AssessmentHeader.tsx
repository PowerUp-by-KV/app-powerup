import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, SafeAreaView, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface AssessmentHeaderProps {
  sectionName?: string;
  skillName: string;
  currentQuestion: number; // 0-indexed
  totalQuestions: number;
  onFinishTest: () => void;
  sessionId?: string;
}

const SKILLS_MAP = [
  { label: "Reading Skills", route: "/read" },
  { label: "Speaking Skills", route: "/speak-read" },
  { label: "Expressive Speaking", route: "/listen-audio" },
  { label: "Speaking Practice", route: "/speak" },
  { label: "Grammar & Language Usage", route: "/grammar" },
  { label: "Listening Comprehension", route: "/listen" },
];

export function AssessmentHeader({
  sectionName = "Section A",
  skillName,
  currentQuestion,
  totalQuestions,
  onFinishTest,
  sessionId,
}: AssessmentHeaderProps) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleSkillSelect = (route: string) => {
    setModalVisible(false);
    router.replace({
      pathname: route as any,
      params: sessionId ? { session_id: sessionId } : undefined,
    });
  };

  const progressPercent = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  return (
    <View className="mb-6 pt-2">
      {/* Top Row: Timer and Finish Button */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="bg-slate-100 px-4 py-2.5 rounded-full border border-slate-200 flex-row items-center shadow-sm">
          <Feather name="clock" size={14} color="#64748B" className="mr-2" />
          <Text className="text-xs font-bold text-slate-700">
            Test Time:{formatTime(secondsElapsed)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleFinishPress}
          className="bg-slate-100 px-5 py-2.5 rounded-full border border-slate-200 shadow-sm"
        >
          <Text className="text-xs font-bold text-slate-800">Finish Test</Text>
        </TouchableOpacity>
      </View>

      {/* Second Row: Section & Skill Selector */}
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

      {/* Progress Bar */}
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

      {/* Skills Dropdown Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <SafeAreaView className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-bold text-slate-900">Select Skill Section</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="p-2 bg-slate-100 rounded-full"
              >
                <Feather name="x" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <View className="gap-3">
              {SKILLS_MAP.map((skill, index) => {
                const isSelected = skill.label === skillName;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSkillSelect(skill.route)}
                    className={`py-4 px-5 rounded-2xl flex-row justify-between items-center border ${
                      isSelected ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold ${isSelected ? "text-indigo-600" : "text-slate-700"}`}
                    >
                      {skill.label}
                    </Text>
                    {isSelected && <Feather name="check-circle" size={18} color="#4F46E5" />}
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
