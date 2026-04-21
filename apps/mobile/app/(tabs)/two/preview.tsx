/**
 * Resume Preview Route (nested under Tab Two)
 * Display formatted resume preview
 */

import { ScrollView, View, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/Themed";
import { useAppSelector } from "@/store/hooks";
import { selectFormData } from "@/store/slices/resume.slice";
import { ResumePreview } from "@/features/resume/components";
import { exportResumePDF } from "@/services/pdf-export";
import { useState } from "react";

export default function Preview() {
  const router = useRouter();
  const formData = useAppSelector(selectFormData);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportResumePDF(formData);
      Alert.alert("Success", "Resume exported successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to export resume";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between bg-white px-6 py-4 shadow-sm">
        <Text className="text-xl font-bold text-gray-900">Resume Preview</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-2xl text-gray-600">✕</Text>
        </Pressable>
      </View>

      {/* Preview */}
      <ResumePreview data={formData} />

      {/* Footer Actions */}
      <View className="gap-3 border-t border-gray-200 bg-white px-6 py-4">
        <Pressable
          onPress={handleExportPDF}
          disabled={isExporting}
          className={`flex-row items-center justify-center rounded-lg bg-green-600 py-3 ${
            isExporting ? "opacity-70" : ""
          }`}
        >
          {isExporting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center font-semibold text-white">📥 Export as PDF</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.back()} className="rounded-lg bg-blue-600 py-3">
          <Text className="text-center font-semibold text-white">Back to Editor</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
