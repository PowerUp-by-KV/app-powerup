import React, { useEffect, useRef, useState } from "react";
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
import * as DocumentPicker from "expo-document-picker";
import { useSafeBack } from "@/hooks/useSafeBack";

import { useGetProfileQuery, usePatchProfileMutation } from "@/services/auth-api";
import { useGetResumeQuery, useUploadResumeMutation } from "@/services/resume-api";
import { getApiErrorMessage } from "@/utils/error-message";

export function EditProfileScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const { data: profile } = useGetProfileQuery();
  const userId = (profile as { id?: string } | undefined)?.id ?? "";
  const { data: resume, isLoading: resumeLoading } = useGetResumeQuery(userId, { skip: !userId });
  const [patch, { isLoading }] = usePatchProfileMutation();
  const [uploadResume, { isLoading: uploading }] = useUploadResumeMutation();

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

  const handleResumeUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const file = result.assets[0];
      const fd = new FormData();
      fd.append("file", { uri: file.uri, name: file.name, type: "application/pdf" } as never);
      await uploadResume(fd).unwrap();
      Alert.alert("Resume updated", "Your resume is being processed. Skills will update shortly.");
    } catch (err) {
      Alert.alert("Upload failed", getApiErrorMessage(err, "Could not upload resume."));
    }
  };

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
      safeBack();
    } catch (err) {
      Alert.alert("Save failed", getApiErrorMessage(err, "Could not save your profile."));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-slate-900">Edit Profile</Text>
        <View className="w-9" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 96 }}>
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

        {/* Resume section */}
        <View className="mb-6">
          <Text className="text-slate-700 font-semibold text-sm mb-3">Resume</Text>
          {resumeLoading ? (
            <ActivityIndicator size="small" />
          ) : resume && resume.parse_status === "completed" ? (
            <View className="bg-slate-50 rounded-2xl px-4 py-4 border border-slate-100 gap-2">
              <View className="flex-row items-center gap-2 mb-1">
                <Feather name="file-text" size={16} color="#4f46e5" />
                <Text className="text-indigo-600 font-semibold text-sm">Resume uploaded</Text>
              </View>
              {Array.isArray((resume as Record<string, unknown>).skills) &&
                ((resume as Record<string, unknown>).skills as string[]).length > 0 && (
                  <Text className="text-slate-500 text-xs" numberOfLines={2}>
                    Skills:{" "}
                    {((resume as Record<string, unknown>).skills as string[])
                      .slice(0, 6)
                      .join(", ")}
                    {((resume as Record<string, unknown>).skills as string[]).length > 6
                      ? ` +${((resume as Record<string, unknown>).skills as string[]).length - 6} more`
                      : ""}
                  </Text>
                )}
              <Pressable
                onPress={handleResumeUpload}
                disabled={uploading}
                className="mt-2 flex-row items-center gap-1"
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#4f46e5" />
                ) : (
                  <>
                    <Feather name="upload" size={14} color="#4f46e5" />
                    <Text className="text-indigo-600 text-sm font-medium">Replace resume</Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handleResumeUpload}
              disabled={uploading}
              className="bg-slate-50 rounded-2xl px-4 py-4 border border-dashed border-slate-300 items-center gap-2"
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#4f46e5" />
              ) : (
                <>
                  <Feather name="upload-cloud" size={24} color="#94a3b8" />
                  <Text className="text-slate-500 text-sm">Upload your resume (PDF)</Text>
                </>
              )}
            </Pressable>
          )}
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
