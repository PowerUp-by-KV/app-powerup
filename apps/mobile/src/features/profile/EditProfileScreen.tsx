import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useGetProfileQuery, usePatchProfileMutation } from "@/services/auth-api";
import { getApiErrorMessage } from "@/utils/error-message";

export function EditProfileScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();
  const [patch, { isLoading }] = usePatchProfileMutation();

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setNickname(profile.nickname ?? "");
    setPhone(profile.phone_number ?? "");
    setCountry(profile.country ?? "");
    setGender(profile.gender ?? "");
    setAddress(profile.address ?? "");
  }, [profile]);

  const handleSave = async () => {
    try {
      await patch({
        name,
        nickname: nickname || undefined,
        phone_number: phone || undefined,
        country: country || undefined,
        gender: gender || undefined,
        address: address || undefined,
      }).unwrap();
      router.back();
    } catch (err) {
      Alert.alert("Save failed", getApiErrorMessage(err, "Could not save your profile."));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-slate-900">Edit Profile</Text>
        <View className="w-9" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {[
          { label: "Full name", value: name, set: setName },
          { label: "Nick name", value: nickname, set: setNickname },
          { label: "Phone number", value: phone, set: setPhone, keyboard: "phone-pad" as const },
          { label: "Country", value: country, set: setCountry },
          { label: "Gender", value: gender, set: setGender },
        ].map((f) => (
          <View
            key={f.label}
            className="bg-slate-50 rounded-2xl px-4 py-2 mb-3 border border-slate-100"
          >
            <Text className="text-slate-500 text-xs mb-0.5">{f.label}</Text>
            <TextInput
              value={f.value}
              onChangeText={f.set}
              keyboardType={f.keyboard}
              className="text-slate-900 text-base py-1"
            />
          </View>
        ))}

        <View className="bg-slate-50 rounded-2xl px-4 py-2 mb-6 border border-slate-100">
          <Text className="text-slate-500 text-xs mb-0.5">Address</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            className="text-slate-900 text-base py-1"
          />
        </View>

        <Pressable
          onPress={handleSave}
          disabled={isLoading}
          className={`rounded-full py-4 items-center ${isLoading ? "bg-slate-300" : "bg-slate-700"}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold tracking-widest">SAVE</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
