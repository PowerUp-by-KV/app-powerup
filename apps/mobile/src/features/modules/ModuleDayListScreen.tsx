import React from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAppSelector } from "@/store/hooks";
import { selectCefrLevel } from "@/store/slices/authSlice";
import { useGetModuleDaysQuery } from "@/services/module-api";
import { RefreshCcw, ChevronLeft } from "lucide-react-native";
import { HighFidelityCard } from "@/components/ui/HighFidelityCard";
import { useGetUserProfileQuery } from "@/services/user-api";
import { useUser } from "@/features/profile/hooks/UserContext";
import { Image } from "react-native";

export const ModuleDayListScreen = () => {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const cefrLevel = useAppSelector(selectCefrLevel);

  const { data: userProfile } = useGetUserProfileQuery("user-1");
  const { user: contextUser } = useUser();

  const userName = userProfile?.name || contextUser?.name || "User";
  const userAvatar = userProfile?.avatarUri || contextUser?.avatarUri;

  const { isLoading, isError, refetch } = useGetModuleDaysQuery({
    moduleId: moduleId!,
    cefr_level: cefrLevel,
  });

  const getSubModuleMetadata = (no: number) => {
    const titles: Record<
      number,
      { name: string; tag: string; duration: string; gradient: string[] }
    > = {
      1: {
        name: "Professional Self‑Introduction",
        tag: "Communication",
        duration: "4h 30m",
        gradient: ["#475569", "#94A3B8"],
      },
      2: {
        name: "Interview Fundamentals",
        tag: "Career",
        duration: "2h 15m",
        gradient: ["#1E293B", "#475569"],
      },
      3: {
        name: "Resume & Personal Branding",
        tag: "Professional",
        duration: "3h 00m",
        gradient: ["#334155", "#64748B"],
      },
      4: {
        name: "Business Email Etiquette",
        tag: "Writing",
        duration: "2h 45m",
        gradient: ["#475569", "#94A3B8"],
      },
      5: {
        name: "Networking & Small Talk",
        tag: "Social",
        duration: "2h 30m",
        gradient: ["#1E293B", "#475569"],
      },
      6: {
        name: "Meeting Dynamics",
        tag: "Discussion",
        duration: "3h 15m",
        gradient: ["#64748B", "#CBD5E1"],
      },
      7: {
        name: "Presentation Skills",
        tag: "Speaking",
        duration: "4h 00m",
        gradient: ["#334155", "#475569"],
      },
      8: {
        name: "Negotiation Strategies",
        tag: "Business",
        duration: "3h 45m",
        gradient: ["#1E293B", "#64748B"],
      },
      9: {
        name: "Conflict & Feedback",
        tag: "Soft Skills",
        duration: "2h 50m",
        gradient: ["#475569", "#94A3B8"],
      },
      10: {
        name: "Team Collaboration",
        tag: "Cooperation",
        duration: "3h 20m",
        gradient: ["#1E293B", "#475569"],
      },
      11: {
        name: "Leadership & Management",
        tag: "Strategy",
        duration: "4h 45m",
        gradient: ["#64748B", "#CBD5E1"],
      },
      12: {
        name: "Final Module Review",
        tag: "Mastery",
        duration: "5h 00m",
        gradient: ["#1E293B", "#334155"],
      },
    };
    return (
      titles[no] || {
        name: `Module ${no}`,
        tag: "Section",
        duration: "2h",
        gradient: ["#64748B", "#CBD5E1"],
      }
    );
  };

  const completedDayNos = useAppSelector((state) => state.progress.completedDays[moduleId!] || []);

  const getProcessedDays = () => {
    const totalDayCount = 12;
    const processed = new Array(totalDayCount).fill(null).map((_, index) => {
      const dayNo = index + 1;
      const isCompleted = completedDayNos.includes(dayNo);
      const meta = getSubModuleMetadata(dayNo);

      return {
        day_no: dayNo,
        title: meta.name,
        tag: meta.tag,
        duration: meta.duration,
        gradient: meta.gradient,
        status: isCompleted ? "completed" : ("locked" as const),
      };
    });

    let foundCurrent = false;
    return processed.map((day) => {
      if (foundCurrent) {
        return { ...day, status: "locked" as const };
      }
      if (day.status !== "completed") {
        foundCurrent = true;
        return { ...day, status: "in_progress" as const };
      }
      return day;
    });
  };

  const days = getProcessedDays();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#475569" />
        <Text className="mt-4 text-slate-500 font-medium tracking-tight">Loading modules...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-10">
        <Text className="text-xl font-bold text-slate-800 mb-2">Error</Text>
        <TouchableOpacity
          className="bg-[#475569] px-8 py-3 rounded-full flex-row items-center"
          onPress={() => refetch()}
        >
          <RefreshCcw size={18} color="white" className="mr-2" />
          <Text className="text-white font-bold text-base">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <View className="px-8 pt-10 pb-6">
        {/* User Header Section */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-[20px] text-[#1E293B] font-bold">
              Hi, {userName.split(" ")[0]}!
            </Text>
            <Text className="text-[12px] text-[#94A3B8] font-medium leading-tight">
              Ready to learn?
            </Text>
          </View>

          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border border-[#E2E8F0]"
            onPress={() => router.push("/(tabs)/profile")}
          >
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} className="w-full h-full rounded-full" />
            ) : (
              <View className="w-[85%] h-[85%] rounded-full bg-[#F1F5F9] items-center justify-center overflow-hidden">
                <View className="w-3 h-3 rounded-full border-2 border-[#475569] mb-0.5" />
                <View className="w-6 h-6 rounded-full bg-[#94A3B8] absolute -bottom-4" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/(tabs)/my-learning");
            }
          }}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#F1F5F9] items-center justify-center mb-4"
        >
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-[28px] font-extrabold text-[#1E293B]">Curriculum</Text>
        <Text className="text-[#94A3B8] text-[15px] font-bold mt-0.5">Stage Content Breakdown</Text>
      </View>

      <ScrollView className="flex-1 px-12" showsVerticalScrollIndicator={false}>
        {days.map((day) => (
          <HighFidelityCard
            key={day.day_no}
            title={day.title}
            tag={day.tag}
            duration={day.duration}
            status={day.status as "locked" | "completed" | "in_progress"}
            gradient={day.gradient}
            onPress={() => {
              // stageId is moduleId (e.g. m1)
              // subModuleId is placeholder-X (e.g. placeholder-1)
              const subModuleId = `placeholder-${day.day_no}`;
              router.push(`/(tabs)/my-learning/modules/${moduleId}/${subModuleId}`);
            }}
          />
        ))}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
};
