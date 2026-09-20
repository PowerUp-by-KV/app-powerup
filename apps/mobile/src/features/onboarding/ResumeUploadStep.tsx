import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useStartSessionMutation } from "@/services/assessment-api";
import { useConfirmOnboardingResumeMutation } from "@/services/onboarding-api";
import { showAlert } from "@/utils/alert";
import { uploadFileToApi } from "@/services/upload-file";

export function ResumeUploadStep() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);
  const [isExtracting, setIsExtracting] = useState(false);
  const [confirmResume, { isLoading: isConfirming }] = useConfirmOnboardingResumeMutation();
  const [startSession, { isLoading: isStarting }] = useStartSessionMutation();
  const isLoading = isExtracting || isConfirming || isStarting;

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
      router.replace(`/assessment-entry?session_id=${session.session_id}` as never);
    } catch {
      // If session start fails, still land user in the app — they can retry from My Learning
      router.replace("/(tabs)" as never);
    }
  };

  const handleContinue = async () => {
    if (!picked || isLoading) return;
    setIsExtracting(true);
    try {
      // 1. Extract resume data and save file. Native uploads go through
      // FileSystem.uploadAsync: RN's FormData could not read some picked Android
      // URIs, so the request was never sent at all.
      const extractRes = await uploadFileToApi<{ resume_id?: string; parsed_data?: unknown }>(
        "/v1/onboarding/resume/extract",
        picked.uri,
        { mimeType: picked.mimeType ?? "application/pdf", fileName: picked.name },
      );
      const resumeId = extractRes?.resume_id;
      const parsedData = extractRes?.parsed_data;

      // 2. Confirm immediately using the extracted parsed data
      if (resumeId && parsedData) {
        await confirmResume({
          resume_id: resumeId,
          confirmed_data: JSON.stringify(parsedData),
        }).unwrap();
      }

      // Show success screen for 2 seconds, then navigate
      setIsExtracting(false);
      setUploadSuccess(true);
      navTimerRef.current = setTimeout(async () => {
        try {
          const session = await startSession().unwrap();
          router.replace(`/assessment-entry?session_id=${session.session_id}` as never);
        } catch {
          router.replace("/(tabs)" as never);
        }
      }, 2000);
    } catch (err) {
      setIsExtracting(false);
      showAlert(
        "Upload failed",
        (err as { message?: string })?.message ||
          "Could not upload and extract your resume. You can try again or continue without it.",
        [
          { text: "Try Again", style: "cancel" },
          {
            text: "Continue Without Resume",
            onPress: async () => {
              await goToAssessment();
            },
          },
        ],
      );
    }
  };

  const handleSkip = async () => {
    await goToAssessment();
  };

  // Success overlay
  if (uploadSuccess) {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: "#fff",
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#22c55e",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Feather name="check" size={52} color="#fff" />
          </View>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#15803d", marginBottom: 8 }}>
            Upload Successful!
          </Text>
          <Text style={{ fontSize: 15, color: "#6b7280" }}>Redirecting...</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 bg-white"
    >
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
          <View
            pointerEvents="none"
            className="mt-4 bg-indigo-600 px-5 py-2 rounded-lg flex-row items-center"
          >
            <Feather name="file-text" size={14} color="#fff" />
            <Text className="text-white font-semibold ml-2">Browse Files</Text>
          </View>
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
    </View>
  );
}
