import React from "react";
import { StyleSheet, SafeAreaView, ScrollView, View, Alert, StatusBar } from "react-native";
import { router } from "expo-router";
import { COLORS, SIZES, FONTS } from "@/constants/theme";
import {
  User,
  Settings,
  Edit3,
  Award,
  LogOut,
  TrendingUp,
  Shield,
  BookOpen,
  Star,
} from "lucide-react-native";

import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileStats } from "./components/ProfileStats";
import { ProfileMenu } from "./components/ProfileMenu";
import { useProfileLogic } from "./hooks/useProfileLogic";

export const ProfileScreen = () => {
  const {
    user,
    isEditing,
    editedName,
    setEditedName,
    handleSave,
    handleCancel,
    handleStartEditing,
    pickImage,
    toggleAvatar,
    logout,
  } = useProfileLogic();

  const menuItems = [
    {
      icon: <User size={20} color="#6366F1" />,
      label: "Edit Profile",
      onPress: handleStartEditing,
    },
    {
      icon: <Award size={20} color="#8B5CF6" />,
      label: "Badges & Achievements",
      onPress: () => router.push("/progress/badges"),
    },
    {
      icon: <TrendingUp size={20} color="#10B981" />,
      label: "Learning Progress",
      onPress: () => router.push("/(tabs)/progress"),
    },
    {
      icon: <Shield size={20} color="#F59E0B" />,
      label: "Privacy & Security",
      onPress: () =>
        Alert.alert(
          "Settings",
          "Privacy & Security settings will be available in the next update.",
        ),
    },
    {
      icon: <LogOut size={20} color="#EF4444" />,
      label: "Logout",
      isDestructive: true,
      onPress: logout,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ProfileHeader
            user={user}
            isEditing={isEditing}
            editedName={editedName}
            setEditedName={setEditedName}
            handleCancel={handleCancel}
            handleSave={handleSave}
            handleStartEditing={handleStartEditing}
            toggleAvatar={toggleAvatar}
            pickImage={pickImage}
          />

          <ProfileStats user={user} />

          <ProfileMenu menuItems={menuItems} />

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 40,
  },
});

// export default ProfileScreen;
