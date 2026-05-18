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
import * as DocumentPicker from "expo-document-picker";
import { useSafeBack } from "@/hooks/useSafeBack";

import { useGetProfileQuery, usePatchProfileMutation } from "@/services/auth-api";
import { useGetResumeQuery, useUploadResumeMutation } from "@/services/resume-api";
import { getApiErrorMessage } from "@/utils/error-message";

export function EditProfileScreen() {
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
  const [learningGoal, setLearningGoal] = useState("");
  const [learningFrequency, setLearningFrequency] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setNickname(profile.nickname ?? "");
    setPhone(profile.phone_number ?? "");
    setCountry(profile.country ?? "");
    setGender(profile.gender ?? "");
    setAddress(profile.address ?? "");
    setLearningGoal(profile.learning_goal ?? "");
    setLearningFrequency(profile.learning_frequency ?? "");
  }, [profile]);

  const GOAL_CHIPS = [
    "Job interview",
    "Business communication",
    "Everyday English",
    "Academic English",
    "Travel",
    "Other",
  ];
  const FREQUENCY_CHIPS = [
    "Daily · 15 min",
    "Daily · 30 min",
    "3×/week · 30 min",
    "Weekends only",
    "As needed",
  ];

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
        learning_goal: learningGoal || undefined,
        learning_frequency: learningFrequency || undefined,
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

        {/* Learning Goal */}
        <View className="mb-5">
          <Text className="text-slate-700 font-semibold text-sm mb-2">Learning Goal</Text>
          <View className="flex-row flex-wrap gap-2">
            {GOAL_CHIPS.map((chip) => (
              <Pressable
                key={chip}
                onPress={() => setLearningGoal(chip === learningGoal ? "" : chip)}
                className={`px-4 py-2 rounded-full border ${chip === learningGoal ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"}`}
              >
                <Text
                  className={`text-sm font-medium ${chip === learningGoal ? "text-white" : "text-slate-700"}`}
                >
                  {chip}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Learning Frequency */}
        <View className="mb-5">
          <Text className="text-slate-700 font-semibold text-sm mb-2">Study Frequency</Text>
          <View className="flex-row flex-wrap gap-2">
            {FREQUENCY_CHIPS.map((chip) => (
              <Pressable
                key={chip}
                onPress={() => setLearningFrequency(chip === learningFrequency ? "" : chip)}
                className={`px-4 py-2 rounded-full border ${chip === learningFrequency ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"}`}
              >
                <Text
                  className={`text-sm font-medium ${chip === learningFrequency ? "text-white" : "text-slate-700"}`}
                >
                  {chip}
                </Text>
              </Pressable>
            ))}
          </View>
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
              {(resume.skills?.length ?? 0) > 0 && (
                <Text className="text-slate-500 text-xs" numberOfLines={2}>
                  Skills: {resume.skills.slice(0, 6).join(", ")}
                  {resume.skills.length > 6 ? ` +${resume.skills.length - 6} more` : ""}
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
