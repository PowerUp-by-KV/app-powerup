import React from "react";
import { View, Text, TouchableOpacity, TextInput, Image } from "react-native";
import { Settings, Edit2, Camera } from "lucide-react-native";
import { UserProfile } from "@/services/types";

interface ProfileHeaderProps {
  user: UserProfile;
  isEditing: boolean;
  editedName: string;
  setEditedName: (name: string) => void;
  handleSave: () => void;
  handleStartEditing: () => void;
  pickImage: () => void;
}

export const ProfileHeader = ({
  user,
  isEditing,
  editedName,
  setEditedName,
  handleSave,
  handleStartEditing,
  pickImage,
}: ProfileHeaderProps) => {
  return (
    <View className="px-5 pt-8 pb-2">
      {/* Top Navigation Bar */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-slate-800">Profile</Text>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center bg-slate-100 rounded-full relative"
          onPress={() => {
            /* Settings navigation */
          }}
        >
          <Settings size={20} color="#64748B" />
          {/* Notification Dot */}
          <View className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white" />
        </TouchableOpacity>
      </View>

      {/* Profile Identity Section */}
      <View className="flex-row items-center">
        {/* Square Avatar Container */}
        <TouchableOpacity
          onPress={isEditing ? pickImage : undefined}
          activeOpacity={isEditing ? 0.7 : 1}
          className="w-20 h-20 bg-slate-300 rounded-[28px] shadow-sm items-center justify-center overflow-hidden mr-5 relative"
        >
          {user.avatarUri ? (
            <Image source={{ uri: user.avatarUri }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full bg-slate-400" />
          )}

          {/* Edit Overlay */}
          {isEditing && (
            <View className="absolute inset-0 bg-black/40 items-center justify-center">
              <Camera size={20} color="white" />
            </View>
          )}
        </TouchableOpacity>

        {/* Identity Details */}
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            {isEditing ? (
              <TextInput
                value={editedName}
                onChangeText={setEditedName}
                className="text-2xl font-bold text-slate-800 p-0 border-b border-slate-300 flex-1 mr-2"
                autoFocus
                onSubmitEditing={handleSave}
                returnKeyType="done"
                onBlur={handleSave}
              />
            ) : (
              <>
                <Text className="text-2xl font-bold text-slate-800 mr-2">{user.name}</Text>
                <TouchableOpacity onPress={handleStartEditing}>
                  <Edit2 size={16} color="#64748B" />
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-0.5">
            LVL 2
          </Text>
          <Text className="text-slate-400 font-medium text-[10px] mb-2">Lesson Name</Text>

          {/* Level Progress Bar */}
          <View className="h-2 bg-slate-100 rounded-full overflow-hidden w-full max-w-[180px]">
            <View className="h-full bg-slate-300 rounded-full" style={{ width: "45%" }} />
          </View>
        </View>
      </View>
    </View>
  );
};
