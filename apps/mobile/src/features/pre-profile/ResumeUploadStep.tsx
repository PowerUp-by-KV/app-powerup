import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, SafeAreaView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";

import { useStartSessionMutation } from "@/services/assessment-api";
import { useUploadResumeMutation } from "@/services/onboarding-api";
import { getApiErrorMessage } from "@/utils/error-message";

export function ResumeUploadStep() {
  const router = useRouter();
  const [picked, setPicked] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploadResume, { isLoading }] = useUploadResumeMutation();
  const [startSession, { isLoading: isStarting }] = useStartSessionMutation();

  const handlePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    setPicked(result.assets[0] ?? null);
  };

  const goToAssessment = async () => {
    try {
      const session = await startSession().unwrap();
      router.replace(`/read?session_id=${session.session_id}` as never);
    } catch {
      // If session start fails, still land user in the app — they can retry from My Learning
      router.replace("/(tabs)" as never);
    }
  };

  const handleContinue = async () => {
    if (!picked) return;
    try {
      const formData = new FormData();
      formData.append("file", {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        uri: picked.uri,
        name: picked.name,
        type: picked.mimeType ?? "application/pdf",
      } as unknown as Blob);
      await uploadResume(formData).unwrap();
      await goToAssessment();
    } catch (err) {
      Alert.alert("Upload failed", getApiErrorMessage(err, "Could not upload your resume."));
    }
  };

  const handleSkip = async () => {
    await goToAssessment();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="h-1 bg-slate-100 w-full">
        <View className="h-full bg-indigo-600 w-full" />
      </View>

      <View className="flex-1 px-6 pt-6">
        <Text className="text-slate-900 text-xl font-extrabold text-center mb-8">
          Upload your Resume
        </Text>

        <Pressable
          onPress={handlePick}
          className="border-2 border-dashed border-slate-300 rounded-3xl py-12 items-center active:opacity-80"
        >
          <View className="w-14 h-14 rounded-full bg-slate-100 items-center justify-center mb-4">
            <Feather name="upload" size={24} color="#475569" />
          </View>
          <Text className="text-slate-900 font-semibold text-base mb-1">
            {picked ? picked.name : "Upload your resume here"}
          </Text>
          <Pressable
            onPress={handlePick}
            className="mt-4 bg-indigo-600 px-5 py-2 rounded-lg flex-row items-center"
          >
            <Feather name="file-text" size={14} color="#fff" />
            <Text className="text-white font-semibold ml-2">Browse Files</Text>
          </Pressable>
          <Text className="text-slate-400 text-xs mt-4">Supported formats: PDF, DOC, DOCX</Text>
          <Text className="text-slate-400 text-xs">Maximum file size: 10MB</Text>
        </Pressable>

        <Text className="text-slate-500 text-sm text-center mt-6 px-4">
          Upload your resume to analyze and enhance your professional profile
        </Text>

        <View className="flex-1 justify-end pb-6">
          <Pressable
            onPress={handleContinue}
            disabled={!picked || isLoading || isStarting}
            className={`rounded-full py-4 items-center mb-3 ${!picked || isLoading || isStarting ? "bg-slate-300" : "bg-slate-700"}`}
          >
            {isLoading || isStarting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold">Continue</Text>
            )}
          </Pressable>
          <Pressable onPress={handleSkip} disabled={isStarting} className="items-center py-2">
            <Text className="text-slate-500 font-semibold">
              {isStarting ? "Starting assessment..." : "Skip for now"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
