import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { showAlert } from "@/utils/alert";

const SUGGESTED_DOMAINS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Analyst",
  "Machine Learning Engineer",
];

interface DomainInputStepProps {
  onAnalyze: (domain: string, file?: DocumentPicker.DocumentPickerAsset) => void;
  onHistory: () => void;
  isLoading: boolean;
}

export function DomainInputStep({ onAnalyze, onHistory, isLoading }: DomainInputStepProps) {
  const [domain, setDomain] = useState("Full Stack Developer");
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const { isDark } = useThemeToggle();

  const handleBrowseFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;
      if (result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0] || null);
      }
    } catch {
      showAlert("Error", "Failed to pick document. Please try again.");
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = () => {
    const trimmed = domain.trim();
    if (!trimmed) {
      showAlert("Domain Required", "Please enter a target role or domain to proceed.");
      return;
    }
    onAnalyze(trimmed, selectedFile || undefined);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: isDark ? "#0F1020" : "#F4F5FA" }}
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
            colors={isDark ? ["#4338CA", "#312E81", "#064E3B"] : ["#597AF4", "#AFC0FF", "#DEF684"]}
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
              shadowColor: isDark ? "#000" : "#597AF4",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.4 : 0.15,
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
          <Text
            className={`font-extrabold text-[11px] mb-2.5 uppercase tracking-widest pl-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            Target Role
          </Text>
          <View
            style={{
              height: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#2A2D40" : "#E5E7EB",
              backgroundColor: isDark ? "#1A1C29" : "#FFFFFF",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              marginBottom: 24,
              width: "100%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.2 : 0.03,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Feather name="search" size={18} color="#6B7280" style={{ marginRight: 10 }} />
            <TextInput
              style={{
                flex: 1,
                color: isDark ? "#F8FAFC" : "#1F2937",
                fontSize: 15,
                fontWeight: "600",
                padding: 0,
              }}
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
          <Text
            className={`font-extrabold text-[11px] mb-3 uppercase tracking-widest pl-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
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
                    backgroundColor: isSelected
                      ? isDark
                        ? "rgba(89, 122, 244, 0.15)"
                        : "rgba(89, 122, 244, 0.08)"
                      : isDark
                        ? "#1A1C29"
                        : "#FFFFFF",
                    borderColor: isSelected ? "#597AF4" : isDark ? "#2A2D40" : "#E5E7EB",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: isSelected ? "#597AF4" : isDark ? "#94A3B8" : "#6B7280",
                    }}
                  >
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Optional Resume Upload Section */}
          <Text
            className={`font-extrabold text-[11px] mb-2.5 uppercase tracking-widest pl-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            Optional Resume Upload
          </Text>
          <View style={{ marginBottom: 24, width: "100%" }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBrowseFiles}
              style={{
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: selectedFile
                  ? isDark
                    ? "#6366F1"
                    : "#4F46E5"
                  : isDark
                    ? "#313244"
                    : "#C7D2FE",
                borderRadius: 16,
                padding: 20,
                alignItems: "center",
                backgroundColor: selectedFile
                  ? isDark
                    ? "rgba(79, 70, 229, 0.1)"
                    : "#EEF2FF"
                  : isDark
                    ? "rgba(255, 255, 255, 0.02)"
                    : "#F5F8FF",
              }}
            >
              {selectedFile ? (
                <View style={{ alignItems: "center", width: "100%" }}>
                  <MaterialIcons
                    name="picture-as-pdf"
                    size={32}
                    color="#ef4444"
                    style={{ marginBottom: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: isDark ? "#F8FAFC" : "#1F2937",
                      marginBottom: 4,
                    }}
                    numberOfLines={1}
                  >
                    {selectedFile.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: isDark ? "#94A3B8" : "#6B7280",
                      marginBottom: 12,
                    }}
                  >
                    {selectedFile.size
                      ? (selectedFile.size / 1024 / 1024).toFixed(2) + " MB"
                      : "Unknown size"}
                  </Text>
                  <TouchableOpacity
                    onPress={handleClearFile}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#FEE2E2",
                      borderWidth: 1,
                      borderColor: isDark ? "rgba(239, 68, 68, 0.2)" : "transparent",
                      borderRadius: 100,
                    }}
                  >
                    <Text
                      style={{
                        color: isDark ? "#F87171" : "#EF4444",
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      Remove File
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ alignItems: "center" }}>
                  <MaterialIcons
                    name="cloud-upload"
                    size={32}
                    color="#4F46E5"
                    style={{ marginBottom: 8 }}
                  />
                  <Text
                    style={{ fontSize: 14, fontWeight: "600", color: "#4F46E5", marginBottom: 4 }}
                  >
                    Tap to upload a new resume
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: isDark ? "#64748B" : "#6B7280",
                      textAlign: "center",
                    }}
                  >
                    If no resume is provided, your saved resume will be analyzed.
                  </Text>
                </View>
              )}
            </TouchableOpacity>
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
                backgroundColor: isDark ? "#334155" : "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <View className="flex-row items-center gap-2">
                <Feather name="zap" size={16} color={isDark ? "#94A3B8" : "white"} />
                <Text
                  className={`font-bold text-[15px] ${isDark ? "text-[#94A3B8]" : "text-white"}`}
                >
                  Analyze Resume
                </Text>
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
                shadowOpacity: isDark ? 0.4 : 0.15,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <LinearGradient
                colors={isDark ? ["#6366f1", "#3b82f6"] : ["#4f46e5", "#3b82f6"]}
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
              backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "#FFFFFF",
              borderWidth: 1,
              borderColor: isDark ? "rgba(59, 130, 246, 0.5)" : "#3b82f6",
              height: 48,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <View className="flex-row items-center gap-2">
              <Feather name="clock" size={16} color={isDark ? "#60A5FA" : "#3b82f6"} />
              <Text
                style={{ color: isDark ? "#60A5FA" : "#3b82f6", fontWeight: "600", fontSize: 15 }}
              >
                View History
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
