import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ResumeBuddyDetailScreen } from "@/features/resume-buddy";

export default function ResumeBuddyDetailPage() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f8fafc",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <ResumeBuddyDetailScreen />
    </View>
  );
}
