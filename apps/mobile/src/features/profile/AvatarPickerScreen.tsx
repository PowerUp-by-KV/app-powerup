import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useGetProfileQuery, usePatchProfileMutation } from "@/services/auth-api";
import { useGetAvatarsQuery } from "@/services/profile-api";

export function AvatarPickerScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();
  const { data: avatars = [], isLoading } = useGetAvatarsQuery();
  const [patch, { isLoading: isSaving }] = usePatchProfileMutation();
  const [selected, setSelected] = useState<string | null>(profile?.avatar_id ?? null);

  const selectedAvatar = avatars.find((a) => a.id === selected);

  const handleSave = async () => {
    if (!selected) return;
    try {
      await patch({ avatar_id: selected }).unwrap();
      router.back();
    } catch {
      Alert.alert("Save failed", "Could not save your avatar.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-slate-900">Select Your Avatar</Text>
        <View className="w-9" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, alignItems: "center" }}>
        <View className="w-28 h-28 rounded-full bg-slate-200 items-center justify-center overflow-hidden mb-2">
          {selectedAvatar ? (
            <Image source={{ uri: selectedAvatar.url }} className="w-full h-full" />
          ) : (
            <Feather name="user" size={36} color="#94a3b8" />
          )}
        </View>
        <Text className="text-slate-900 font-bold mb-6">{profile?.name ?? "—"}</Text>

        {isLoading ? (
          <ActivityIndicator color="#6366f1" />
        ) : (
          <View className="flex-row flex-wrap justify-center" style={{ gap: 12, maxWidth: 320 }}>
            {avatars.map((a) => {
              const isSel = a.id === selected;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => !a.locked && setSelected(a.id)}
                  disabled={a.locked}
                  className="relative"
                >
                  <View
                    className="w-16 h-16 rounded-full bg-slate-200 items-center justify-center overflow-hidden"
                    style={{
                      borderWidth: isSel ? 3 : 0,
                      borderColor: "#0f172a",
                      opacity: a.locked ? 0.4 : 1,
                    }}
                  >
                    <Image source={{ uri: a.url }} className="w-full h-full" />
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
            })}
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
    </SafeAreaView>
  );
}
