import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const SUGGESTED_DOMAINS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Analyst",
  "Machine Learning Engineer",
];

interface DomainInputStepProps {
  onAnalyze: (domain: string) => void;
  onHistory: () => void;
  isLoading: boolean;
}

export function DomainInputStep({ onAnalyze, onHistory, isLoading }: DomainInputStepProps) {
  const [domain, setDomain] = useState("Full Stack Developer");

  const handleSubmit = () => {
    const trimmed = domain.trim();
    if (!trimmed) {
      Alert.alert("Domain Required", "Please enter a target role or domain to proceed.");
      return;
    }
    onAnalyze(trimmed);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 32,
          paddingBottom: 32,
          justifyContent: "space-between",
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top content */}
        <View style={{ width: "100%", maxWidth: 560 }}>
          {/* Hero Icon */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 items-center justify-center shadow-sm">
              <Feather name="file-text" size={36} color="#4f46e5" />
            </View>
          </View>

          {/* Title & Description */}
          <Text className="text-slate-900 text-2xl font-extrabold text-center mb-2">
            Resume Buddy
          </Text>
          <Text className="text-slate-500 text-sm text-center mb-8 leading-5 px-4">
            AI-powered resume analysis with ATS scoring, skills matching, and personalized
            recommendations based on your stored resume.
          </Text>

          {/* Domain Input */}
          <Text className="text-slate-700 font-bold text-sm mb-2">Target Role / Domain</Text>
          <View className="flex-row items-center border border-slate-200 rounded-2xl bg-white px-4 py-3.5 shadow-sm mb-4 w-full">
            <Feather name="briefcase" size={16} color="#64748b" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-slate-800 text-sm font-semibold"
              placeholder="e.g. Frontend Developer, Data Analyst"
              placeholderTextColor="#94a3b8"
              value={domain}
              onChangeText={setDomain}
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            {domain.length > 0 && (
              <Pressable onPress={() => setDomain("")} hitSlop={8}>
                <Feather name="x" size={14} color="#94a3b8" />
              </Pressable>
            )}
          </View>

          {/* Quick-select chips */}
          <Text className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">
            Quick Select
          </Text>
          <View className="flex-row flex-wrap mb-8">
            {SUGGESTED_DOMAINS.map((d) => {
              const isSelected = domain === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDomain(d)}
                  className={`mr-2 mb-2 px-3 py-2 rounded-xl border ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600"
                      : "bg-white border-slate-200 active:bg-slate-50"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Bottom CTA buttons */}
        <View style={{ width: "100%", maxWidth: 560, gap: 12 }}>
          {/* Analyze Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={isLoading}
            className={`rounded-2xl py-4 items-center justify-center shadow-sm w-full ${
              isLoading ? "bg-slate-300" : "bg-indigo-600 active:bg-indigo-500"
            }`}
          >
            <View className="flex-row items-center gap-2">
              <Feather name="zap" size={16} color="white" />
              <Text className="text-white font-bold text-sm">Analyze Resume</Text>
            </View>
          </Pressable>

          {/* History Button */}
          <Pressable
            onPress={onHistory}
            className="rounded-2xl py-3.5 items-center justify-center border border-slate-200 bg-white active:bg-slate-50 w-full"
          >
            <View className="flex-row items-center gap-2">
              <Feather name="clock" size={16} color="#475569" />
              <Text className="text-slate-600 font-semibold text-sm">View History</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
