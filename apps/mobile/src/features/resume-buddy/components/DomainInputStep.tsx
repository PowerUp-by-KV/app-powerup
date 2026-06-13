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
import { LinearGradient } from "expo-linear-gradient";

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
          paddingTop: 16,
          paddingBottom: 32,
          justifyContent: "space-between",
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top content */}
        <View style={{ width: "100%", maxWidth: 560 }}>
          {/* Hero Card with Gradient and Glassmorphism Circles */}
          <LinearGradient
            colors={["#597AF4", "#AFC0FF", "#DEF684"]}
            locations={[0, 0.6, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              padding: 24,
              paddingVertical: 28,
              marginBottom: 32,
              width: "100%",
              position: "relative",
              shadowColor: "#597AF4",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 4,
            }}
          >
            {/* Background overlapping semi-transparent circles */}
            <View
              style={{
                position: "absolute",
                right: -60,
                top: -60,
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              }}
            />
            <View
              style={{
                position: "absolute",
                right: 20,
                bottom: -80,
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: "rgba(255, 255, 255, 0.12)",
              }}
            />
            <View
              style={{
                position: "absolute",
                left: -80,
                bottom: -40,
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: "rgba(255, 255, 255, 0.04)",
              }}
            />

            {/* Document Icon Box */}
            <View className="w-14 h-14 bg-white/20 items-center justify-center rounded-2xl mb-6 border border-white/10 shadow-sm">
              <Feather name="file-text" size={24} color="white" />
            </View>

            {/* Card Typography */}
            <Text className="text-white text-3xl font-extrabold mb-2 tracking-tight">
              Resume Buddy
            </Text>
            <Text className="text-white/95 text-sm leading-relaxed font-medium">
              AI-powered analysis with ATS scoring, skill matching & tailored tips.
            </Text>
          </LinearGradient>

          {/* Domain Input Section */}
          <Text className="text-slate-400 font-extrabold text-[11px] mb-2.5 uppercase tracking-widest pl-1">
            Target Role
          </Text>
          <View
            style={{
              height: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              backgroundColor: "#FFFFFF",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              marginBottom: 24,
              width: "100%",
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.03,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Feather name="search" size={18} color="#6B7280" style={{ marginRight: 10 }} />
            <TextInput
              style={{ flex: 1, color: "#1F2937", fontSize: 15, fontWeight: "600", padding: 0 }}
              placeholder="e.g. Frontend Developer, Data Analyst"
              placeholderTextColor="#6B7280"
              value={domain}
              onChangeText={setDomain}
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            {domain.length > 0 && (
              <Pressable onPress={() => setDomain("")} hitSlop={8}>
                <Feather name="x" size={16} color="#6B7280" />
              </Pressable>
            )}
          </View>

          {/* Quick-select chips */}
          <Text className="text-slate-400 font-extrabold text-[11px] mb-3 uppercase tracking-widest pl-1">
            Quick Select
          </Text>
          <View className="flex-row flex-wrap mb-8">
            {SUGGESTED_DOMAINS.map((d) => {
              const isSelected = domain === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDomain(d)}
                  style={{
                    marginRight: 10,
                    marginBottom: 10,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    backgroundColor: isSelected ? "rgba(89, 122, 244, 0.08)" : "#FFFFFF",
                    borderColor: isSelected ? "#597AF4" : "#E5E7EB",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: isSelected ? "#597AF4" : "#6B7280",
                    }}
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
          {/* Analyze Button with Optional Gradient */}
          {isLoading ? (
            <View
              style={{
                height: 48,
                borderRadius: 12,
                backgroundColor: "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <View className="flex-row items-center gap-2">
                <Feather name="zap" size={16} color="white" />
                <Text className="text-white font-bold text-[15px]">Analyze Resume</Text>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={handleSubmit}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                width: "100%",
                shadowColor: "#3b82f6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <LinearGradient
                colors={["#4f46e5", "#3b82f6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="zap" size={16} color="white" />
                  <Text className="text-white font-bold text-[15px]">Analyze Resume</Text>
                </View>
              </LinearGradient>
            </Pressable>
          )}

          {/* History Button */}
          <Pressable
            onPress={onHistory}
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#3b82f6",
              height: 48,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <View className="flex-row items-center gap-2">
              <Feather name="clock" size={16} color="#3b82f6" />
              <Text style={{ color: "#3b82f6", fontWeight: "600", fontSize: 15 }}>
                View History
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
