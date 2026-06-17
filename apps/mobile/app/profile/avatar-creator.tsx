import React from "react";
import { View, SafeAreaView, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AvatarCreatorWebView } from "@/features/avatar";
import { usePatchProfileMutation } from "@/services/auth-api";

export default function AvatarCreatorScreen() {
  const router = useRouter();
  const [patchProfile] = usePatchProfileMutation();

  const handleAvatarExported = async (avatarUrl: string) => {
    try {
      // RPM URL looks like: https://models.readyplayer.me/63b...glb
      // Avaturn URL looks like: https://powerup.avaturn.dev/avatar/... or similar
      if (avatarUrl.includes("readyplayer.me")) {
        const urlParts = avatarUrl.split("/");
        const filename = urlParts[urlParts.length - 1];
        const rpmId = filename?.replace(".glb", "");
        if (rpmId) {
          await patchProfile({ avatar_id: `rpm_${rpmId}` }).unwrap();
        }
      } else {
        // Avaturn or other provider: store the full GLB url with a prefix
        await patchProfile({ avatar_id: `avaturn_${avatarUrl}` }).unwrap();
      }
    } catch (error) {
      console.warn("Failed to update avatar:", error);
    } finally {
      // Return to profile safely without relying on navigation history stack
      router.replace("/profile");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row px-4 py-3 border-b border-slate-100 bg-white">
        <View className="flex-1" />
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/profile");
            }
          }}
          className="bg-indigo-600 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-bold">Done</Text>
        </Pressable>
      </View>
      <View className="flex-1">
        <AvatarCreatorWebView onAvatarExported={handleAvatarExported} subdomain="powerup" />
      </View>
    </SafeAreaView>
  );
}
