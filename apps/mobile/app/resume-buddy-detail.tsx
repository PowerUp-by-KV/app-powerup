import { SafeAreaView } from "react-native-safe-area-context";
import { ResumeBuddyDetailScreen } from "@/features/resume-buddy";

export default function ResumeBuddyDetailPage() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ResumeBuddyDetailScreen />
    </SafeAreaView>
  );
}
