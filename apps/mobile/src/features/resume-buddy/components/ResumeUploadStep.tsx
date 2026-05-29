import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

interface ResumeUploadStepProps {
  onAnalyze: (file: DocumentPicker.DocumentPickerAsset, role: string) => Promise<void>;
  isLoading: boolean;
}

export function ResumeUploadStep({ onAnalyze, isLoading }: ResumeUploadStepProps) {
  const [picked, setPicked] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [targetRole, setTargetRole] = useState("Full Stack Developer");

  const handlePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      const fileAsset = result.assets[0];
      if (!fileAsset) return;

      const extension = (fileAsset.name || "").toLowerCase();
      if (!extension.endsWith(".pdf") && !extension.endsWith(".docx")) {
        Alert.alert("Invalid File Type", "Only PDF and DOCX files are accepted.");
        return;
      }

      setPicked(fileAsset);
    } catch (err) {
      console.error("Document picking failed:", err);
      Alert.alert("Error", "Failed to select document.");
    }
  };

  const handleRemove = () => {
    setPicked(null);
  };

  const handleSubmit = () => {
    if (!targetRole.trim()) {
      Alert.alert("Role Required", "Please enter a target role to proceed.");
      return;
    }
    if (!picked) {
      Alert.alert("Resume Required", "Please select a resume file to upload.");
      return;
    }
    onAnalyze(picked, targetRole.trim());
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
          paddingHorizontal: 16,
          paddingVertical: 32,
          justifyContent: "space-between",
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Centered content container */}
        <View style={{ width: "100%", maxWidth: 560 }}>
          {/* Header */}
          <Text className="text-slate-900 text-2xl font-extrabold text-center mb-1">
            Resume Buddy
          </Text>
          <Text className="text-blue-500 text-sm text-center mb-8">
            Upload your resume and target role for detailed ATS and AI suggestions
          </Text>

          {/* Target Job Role label */}
          <Text className="text-slate-700 font-bold text-sm mb-2 text-center">Target Job Role</Text>

          {/* Dropdown / input row */}
          <View className="flex-row items-center border border-slate-200 rounded-2xl bg-white px-4 py-3.5 shadow-sm mb-6 w-full">
            <Feather name="briefcase" size={16} color="#64748b" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-slate-800 text-sm font-semibold"
              placeholder="e.g. Software Engineer, Product Manager"
              placeholderTextColor="#94a3b8"
              value={targetRole}
              onChangeText={setTargetRole}
              maxLength={64}
            />
            <Feather name="chevron-down" size={16} color="#64748b" />
          </View>

          {/* Upload Resume label */}
          <Text className="text-slate-700 font-bold text-sm mb-2 text-center">Upload Resume</Text>

          {/* Upload card */}
          {picked ? (
            <View className="border border-slate-200 bg-white rounded-3xl p-5 flex-row items-center shadow-sm mb-8 justify-between w-full">
              <View className="flex-row items-center flex-1 mr-4">
                <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center">
                  <Feather name="file-text" size={20} color="#4f46e5" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-slate-900 font-bold text-sm" numberOfLines={1}>
                    {picked.name}
                  </Text>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    {picked.size
                      ? `${(picked.size / (1024 * 1024)).toFixed(2)} MB`
                      : "Ready to upload"}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={handleRemove}
                className="w-8 h-8 rounded-full bg-red-50 items-center justify-center active:opacity-70"
              >
                <Feather name="trash-2" size={14} color="#ef4444" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handlePick}
              className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-3xl py-10 items-center justify-center mb-8 active:opacity-80 shadow-sm w-full"
            >
              <View className="w-14 h-14 rounded-full bg-white border border-slate-100 shadow-sm items-center justify-center mb-4">
                <Feather name="upload" size={22} color="#4f46e5" />
              </View>
              <Text className="text-slate-900 font-bold text-base mb-1">Browse file</Text>
              <Text className="text-slate-400 text-xs">Supported: PDF, DOCX (Max 10MB)</Text>
            </Pressable>
          )}
        </View>

        {/* CTA Button — full-width within the same max-width container */}
        <View style={{ width: "100%", maxWidth: 560, paddingBottom: 8 }}>
          <Pressable
            onPress={handleSubmit}
            disabled={isLoading}
            className={`rounded-2xl py-4 items-center justify-center shadow-sm w-full ${
              isLoading ? "bg-slate-400" : "bg-slate-900 active:bg-slate-800"
            }`}
          >
            {isLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-sm">Analyzing Resume...</Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-sm">Analyze Resume</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
