import React, { useState, useEffect } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";

import { useGetProfileQuery, usePatchProfileMutation } from "@/services/auth-api";
import { useGetAvatarsQuery } from "@/services/profile-api";
import { getAvatarUri } from "@/utils/avatar";

export function AvatarPickerScreen() {
  const safeBack = useSafeBack();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: profile } = useGetProfileQuery();
  const { data: avatars = [], isLoading } = useGetAvatarsQuery();
  const [patch, { isLoading: isSaving }] = usePatchProfileMutation();
  const [selected, setSelected] = useState<string | null>(profile?.avatar_id ?? null);

  useEffect(() => {
    if (profile?.avatar_id) {
      setSelected(profile.avatar_id);
    }
  }, [profile?.avatar_id]);

  const defaultAvatars = [
    { id: "adventurer1", locked: false },
    { id: "adventurer2", locked: false },
    { id: "adventurer3", locked: false },
    { id: "adventurer4", locked: false },
    { id: "adventurer5", locked: false },
    { id: "adventurer6", locked: false },
    { id: "adventurer7", locked: false },
    { id: "adventurer8", locked: false },
    { id: "adventurer9", locked: false },
    { id: "adventurer10", locked: false },
    { id: "adventurer11", locked: false },
    { id: "adventurer12", locked: false },
  ];

  const displayAvatars = avatars.length > 0 ? avatars : defaultAvatars;

  const handleSave = async () => {
    if (!selected) return;
    try {
      await patch({ avatar_id: selected }).unwrap();
      safeBack();
    } catch {
      Alert.alert("Save failed", "Could not save your avatar.");
    }
  };

  const selectedAvatarUrl = getAvatarUri(selected, profile?.id);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 bg-white"
    >
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-slate-900">Select Your Avatar</Text>
        <View className="w-9" />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 140,
          alignItems: "center",
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={true}
      >
        <View className="w-28 h-28 rounded-full bg-slate-200 items-center justify-center overflow-hidden mb-2 border-2 border-slate-100 shadow-sm">
          <Image source={{ uri: selectedAvatarUrl }} className="w-full h-full" />
        </View>
        <Text className="text-slate-900 font-bold mb-4">{profile?.name ?? "—"}</Text>

        {/* Premium Bitmoji-style Banner Prompt */}
        <Pressable
          onPress={() => router.push("/profile/ready-player-me" as never)}
          className="w-full max-w-xs bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex-row items-center justify-between mb-6 active:opacity-90"
        >
          <View className="flex-1 mr-3">
            <Text className="text-indigo-900 font-bold text-sm">✨ Ready Player Me 3D</Text>
            <Text className="text-indigo-600 text-xs mt-1">
              Create your personal Snapchat/Bitmoji-style 3D avatar!
            </Text>
          </View>
          <View className="w-8 h-8 rounded-full bg-indigo-600 items-center justify-center">
            <Feather name="arrow-right" size={16} color="#fff" />
          </View>
        </Pressable>

        {/* Custom 2D Avatar Banner Prompt */}
        <Pressable
          onPress={() => router.push("/profile/custom-avatar" as never)}
          className="w-full max-w-xs bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex-row items-center justify-between mb-6 active:opacity-90"
        >
          <View className="flex-1 mr-3">
            <Text className="text-emerald-900 font-bold text-sm">🎨 Custom 2D Avatar</Text>
            <Text className="text-emerald-600 text-xs mt-1">
              Design your own vector avatar with custom hair, eyes, and style!
            </Text>
          </View>
          <View className="w-8 h-8 rounded-full bg-emerald-600 items-center justify-center">
            <Feather name="arrow-right" size={16} color="#fff" />
          </View>
        </Pressable>

        {isLoading ? (
          <ActivityIndicator color="#6366f1" />
        ) : (
          <View className="flex-row flex-wrap justify-center" style={{ gap: 12, maxWidth: 320 }}>
            {displayAvatars.map(
              (a: { id: string; locked: boolean; unlock_criteria?: string | null }) => {
                const isSel = a.id === selected;
                const imageUrl = getAvatarUri(a.id);
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => {
                      if (a.locked) {
                        Alert.alert(
                          "Avatar Locked",
                          a.unlock_criteria ||
                            "Keep learning and earning XP to unlock this avatar!",
                        );
                      } else {
                        setSelected(a.id);
                      }
                    }}
                    className="relative"
                  >
                    <View
                      className="w-16 h-16 rounded-full bg-slate-200 items-center justify-center overflow-hidden border border-slate-100"
                      style={{
                        borderWidth: isSel ? 3 : 1,
                        borderColor: isSel ? "#0f172a" : "#f1f5f9",
                        opacity: a.locked ? 0.4 : 1,
                      }}
                    >
                      <Image source={{ uri: imageUrl }} className="w-full h-full" />
                    </View>
                    {a.locked && (
                      <View className="absolute right-0 bottom-0 w-6 h-6 rounded-full bg-slate-900 items-center justify-center">
                        <Feather name="lock" size={10} color="#fff" />
                      </View>
                    )}
                    {isSel && (
                      <View className="absolute right-0 bottom-0 w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
                        <Feather name="check" size={12} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                );
              },
            )}
          </View>
        )}

        {selected !== profile?.avatar_id && selected && (
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            className={`mt-8 px-8 py-3 rounded-full ${isSaving ? "bg-slate-300" : "bg-slate-900"}`}
          >
            <Text className="text-white font-bold">{isSaving ? "Saving..." : "Save"}</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
