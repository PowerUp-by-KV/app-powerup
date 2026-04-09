import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "react-native";

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-5">
      <Text className="text-2xl font-bold mb-7 text-slate-900">Modal</Text>
      <View className="h-px w-4/5 bg-slate-200 mb-7" />
      <EditScreenInfo path="app/modal.tsx" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}
