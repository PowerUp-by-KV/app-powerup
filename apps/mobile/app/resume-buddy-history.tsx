import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ResumeBuddyHistoryScreen } from "@/features/resume-buddy";

export default function ResumeBuddyHistoryPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc", paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: "#f1f5f9",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
          hitSlop={8}
        >
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontWeight: "700",
            fontSize: 16,
            color: "#0f172a",
          }}
        >
          Analysis History
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ResumeBuddyHistoryScreen />
    </View>
  );
}
