/**
 * Resume Home Screen
 * Main entry point - Upload PDF, Build from scratch, or Edit existing resume
 */

import { View, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/Themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrentStep, resetResume } from "@/store/slices/resume.slice";
import { selectHasExistingResume, selectLastSaved } from "@/store/slices/resume.slice";
import { Button, Section } from "../components";
import { useState } from "react";

export function ResumeHomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const hasExistingResume = useAppSelector(selectHasExistingResume);
  const lastSaved = useAppSelector(selectLastSaved);
  const [isUploading, setIsUploading] = useState(false);

  const handleBuildFromScratch = () => {
    dispatch(resetResume());
    dispatch(setCurrentStep(1));
    router.push("two/builder");
  };

  const handleEditResume = () => {
    dispatch(setCurrentStep(1));
    router.push("two/builder");
  };

  const handleUploadResume = () => {
    setIsUploading(true);
    // TODO: Implement PDF picker and upload logic
    Alert.alert("Coming Soon", "PDF upload feature will be available soon!");
    setIsUploading(false);
  };

  const handlePreviewResume = () => {
    router.push("two/preview");
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-b from-blue-600 to-blue-700 px-6 py-8">
        <Text className="mb-2 text-3xl font-bold text-white">My Resume</Text>
        <Text className="text-blue-100">Create, edit, and manage your professional resume</Text>
      </View>

      {/* Content */}
      <View className="px-6 py-6">
        {/* Existing Resume Section */}
        {hasExistingResume && (
          <Section
            title="Your Resume"
            subtitle={lastSaved ? `Last saved: ${lastSaved}` : undefined}
            className="border-l-4 border-green-500 bg-green-50"
          >
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button onPress={handleEditResume} size="md">
                  Edit Resume
                </Button>
              </View>
              <View className="flex-1">
                <Button variant="secondary" size="md" onPress={handlePreviewResume}>
                  Preview
                </Button>
              </View>
            </View>
          </Section>
        )}

        {/* Action Cards */}
        <View className="space-y-4">
          {/* Upload Resume Card */}
          <Pressable
            onPress={handleUploadResume}
            disabled={isUploading}
            className={`rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 px-6 py-8 ${
              isUploading ? "opacity-50" : ""
            }`}
          >
            <View className="items-center">
              <Text className="mb-2 text-4xl">📄</Text>
              <Text className="mb-1 text-center text-lg font-semibold text-gray-900">
                Upload Resume
              </Text>
              <Text className="text-center text-sm text-gray-600">
                Import PDF and auto-fill your resume
              </Text>
            </View>
          </Pressable>

          {/* Build from Scratch Card */}
          <Pressable onPress={handleBuildFromScratch} className="rounded-xl bg-white shadow-sm">
            <View className="border-l-4 border-green-500 px-6 py-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="mb-1 text-lg font-semibold text-gray-900">
                    Build from Scratch
                  </Text>
                  <Text className="text-sm text-gray-600">Create a new resume step by step</Text>
                </View>
                <Text className="text-3xl">✨</Text>
              </View>
            </View>
          </Pressable>

          {/* Features Section */}
          <Section title="Why Use Our Resume Builder?" className="mt-4">
            <View className="space-y-3">
              {[
                { icon: "✓", label: "Professional templates" },
                { icon: "✓", label: "Step-by-step guidance" },
                { icon: "✓", label: "Auto-formatted layout" },
                { icon: "✓", label: "PDF export & download" },
              ].map((feature, idx) => (
                <View key={idx} className="flex-row items-center gap-3">
                  <Text className="text-lg text-green-600">{feature.icon}</Text>
                  <Text className="text-gray-700">{feature.label}</Text>
                </View>
              ))}
            </View>
          </Section>
        </View>
      </View>
    </ScrollView>
  );
}
