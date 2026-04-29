import React from "react";
import { ScrollView, View, Alert, StatusBar, TouchableOpacity, Text } from "react-native";
import { Zap, ChevronDown } from "lucide-react-native";

import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileStats } from "./components/ProfileStats";
import { ProfileMenu } from "./components/ProfileMenu";
import { StreakCalendar } from "./components/StreakCalendar";
import { useProfileLogic } from "./hooks/useProfileLogic";

export const ProfileScreen = () => {
  const [activeTab, setActiveTab] = React.useState<"Stats" | "Space">("Stats");
  const [calendarViewMode, setCalendarViewMode] = React.useState<"Weekly" | "Monthly">("Weekly");
  const {
    user,
    isEditing,
    editedName,
    setEditedName,
    handleSave,
    handleStartEditing,
    pickImage,
    logout,
  } = useProfileLogic();

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1, width: "100%" }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
          style={{ flex: 1 }}
        >
          <ProfileHeader
            user={user}
            isEditing={isEditing}
            editedName={editedName}
            setEditedName={setEditedName}
            handleSave={handleSave}
            handleStartEditing={handleStartEditing}
            pickImage={pickImage}
          />

          <View className="mt-2 mb-2">
            <ProfileStats user={user} />
          </View>

          {/* Tab Switcher */}
          <View className="flex-row px-5 border-b border-gray-100 mb-2">
            <TouchableOpacity
              onPress={() => setActiveTab("Stats")}
              className={`pb-1.5 mr-8 ${activeTab === "Stats" ? "border-b-2 border-black" : ""}`}
            >
              <Text
                className={`font-bold text-[13px] ${activeTab === "Stats" ? "text-black" : "text-gray-400"}`}
              >
                My Stats
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("Space")}
              className={`pb-1.5 ${activeTab === "Space" ? "border-b-2 border-black" : ""}`}
            >
              <Text
                className={`font-bold text-[13px] ${activeTab === "Space" ? "text-black" : "text-gray-400"}`}
              >
                My Space
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "Stats" ? (
            <View className="px-5">
              {/* Pro Subscription Card */}
              <View className="bg-slate-200 rounded-[32px] p-6 mb-2 flex-row justify-between items-center h-20">
                <View className="flex-1">
                  <Text className="text-slate-600 font-bold text-base">Pro Subscription</Text>
                </View>
                <View className="items-center justify-center transform scale-110">
                  <Zap size={22} color="#334155" fill="#334155" />
                </View>
              </View>

              <View className="mb-2 flex-row justify-between items-center px-1">
                <Text className="text-slate-600 font-bold text-base">Streak Calendar</Text>
                <TouchableOpacity
                  onPress={() =>
                    setCalendarViewMode((prev) => (prev === "Weekly" ? "Monthly" : "Weekly"))
                  }
                  className="bg-black px-2 py-1 rounded-lg flex-row items-center"
                >
                  <Text className="text-white text-[10px] font-bold mr-1">{calendarViewMode}</Text>
                  <ChevronDown size={12} color="white" />
                </TouchableOpacity>
              </View>

              <StreakCalendar viewMode={calendarViewMode} />
            </View>
          ) : (
            <ProfileMenu
              onLogout={logout}
              onPrivacy={() => Alert.alert("Privacy", "Commonly requested features coming soon...")}
            />
          )}

          {/* Bottom Buffer for TabBar */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    </View>
  );
};
