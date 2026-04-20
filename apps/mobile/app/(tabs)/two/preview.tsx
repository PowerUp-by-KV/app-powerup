/**
 * Resume Preview Route (nested under Tab Two)
 * Display formatted resume preview
 */

import { ScrollView, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/Themed";
import { useAppSelector } from "@/store/hooks";
import { selectFormData } from "@/store/slices/resume.slice";
import { ResumePreview } from "@/features/resume/components";

export default function Preview() {
  const router = useRouter();
  const formData = useAppSelector(selectFormData);

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
        <Pressable onPress={() => router.back()} className="rounded-lg bg-blue-600 py-3">
          <Text className="text-center font-semibold text-white">Back to Editor</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
