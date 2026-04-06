import React from "react";
import { View, Text, TouchableOpacity, TextInput, Platform, Image } from "react-native";
import { ArrowLeft, Check, Edit3, Camera, User, RefreshCw } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const AVATAR_COLORS = ["#6366F1", "#EC4899", "#F59E0B", "#10B981", "#8B5CF6"];

interface ProfileHeaderProps {
  user: any;
  isEditing: boolean;
  editedName: string;
  setEditedName: (name: string) => void;
  handleCancel: () => void;
  handleSave: () => void;
  handleStartEditing: () => void;
  toggleAvatar: () => void;
  pickImage: () => void;
}

export const ProfileHeader = ({
  user,
  isEditing,
  editedName,
  setEditedName,
  handleSave,
  handleStartEditing,
  toggleAvatar,
  pickImage,
}: ProfileHeaderProps) => {
  const avatarBg = AVATAR_COLORS[user.avatarIndex || 0];

  return (
    <View className={`pb-5 ${Platform.OS === "ios" ? "pt-0" : "pt-5"}`}>
      <LinearGradient
        colors={["#F8FAFC", "#F1F5F9"]}
        className="absolute top-0 left-[-20px] right-[-20px] h-[300px] opacity-50"
      />

      <View className="flex-row justify-between items-center px-5 mb-7.5">
        <TouchableOpacity
          className="w-11 h-11 rounded-[14px] bg-white justify-center items-center shadow-sm elevation-3"
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>

        <Text className="text-lg text-[#1E293B] font-bold">
          {isEditing ? "Edit Profile" : "Profile"}
        </Text>

        {isEditing ? (
          <TouchableOpacity
            className="w-11 h-11 rounded-[14px] bg-[#6366F1] justify-center items-center shadow-sm elevation-3"
            onPress={handleSave}
          >
            <Check size={22} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="w-11 h-11 rounded-[14px] bg-white justify-center items-center shadow-sm elevation-3"
            onPress={handleStartEditing}
          >
            <Edit3 size={20} color="#6366F1" />
          </TouchableOpacity>
        )}
      </View>

      <View className="items-center">
        <View className="mb-5">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={isEditing ? pickImage : handleStartEditing}
            className="relative"
          >
            <View
              className="w-[130px] h-[130px] rounded-[45px] justify-center items-center border-[6px] border-white shadow-lg elevation-10 overflow-hidden"
              style={{ backgroundColor: user.avatarUri ? "#F1F5F9" : avatarBg }}
            >
              {user.avatarUri ? (
                <Image
                  source={{ uri: user.avatarUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <User size={60} color="#FFF" opacity={0.9} />
              )}

              {isEditing && (
                <View className="absolute inset-0 bg-black/30 justify-center items-center">
                  <Camera size={24} color="#FFF" />
                </View>
              )}
            </View>

            {isEditing && (
              <View className="absolute bottom-[-15px] right-[-10px] flex-col gap-2">
                <TouchableOpacity
                  className="w-[30px] h-[30px] rounded-[10px] bg-[#6366F1] justify-center items-center border-2 border-white elevation-5"
                  onPress={pickImage}
                >
                  <Camera size={14} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="w-[30px] h-[30px] rounded-[10px] bg-[#8B5CF6] justify-center items-center border-2 border-white elevation-5"
                  onPress={toggleAvatar}
                >
                  <RefreshCw size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}

            {isEditing && !user.avatarUri && (
              <View className="absolute bottom-[-10px] self-center bg-[#F59E0B] px-3 py-1 rounded-xl border-2 border-white shadow-sm">
                <Text className="text-white text-[10px] font-bold">Choose Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="items-center">
          {isEditing ? (
            <View className="border-b-2 border-[#6366F1] w-[250px] items-center pb-1">
              <TextInput
                className="text-2xl text-[#1E293B] font-bold text-center"
                value={editedName}
                onChangeText={setEditedName}
                autoFocus
                placeholder="Your Name"
                placeholderTextColor="#94A3B8"
              />
            </View>
          ) : (
            <TouchableOpacity onPress={handleStartEditing} activeOpacity={0.7}>
              <Text className="text-[26px] text-[#1E293B] font-bold">{user.name}</Text>
            </TouchableOpacity>
          )}
          <Text className="text-sm text-[#64748B] mt-1 font-medium">
            {user.email || "alex.j@example.com"}
          </Text>
        </View>
      </View>
    </View>
  );
};
