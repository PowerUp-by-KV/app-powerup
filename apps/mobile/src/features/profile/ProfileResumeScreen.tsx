import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeBack } from "@/hooks/useSafeBack";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import { useGetProfileResumeQuery, useUpdateProfileResumeMutation } from "@/services/resume-api";

export function ProfileResumeScreen() {
  const safeBack = useSafeBack();
  const { data: resume, isLoading: isFetching, refetch } = useGetProfileResumeQuery();
  const [updateProfileResume, { isLoading: isUpdating }] = useUpdateProfileResumeMutation();

  const [activeTab, setActiveTab] = useState<"view" | "edit">("view");

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");

  // Sync state with fetched resume data
  useEffect(() => {
    if (resume) {
      const res = resume as any;
      const contact = res.parsed_data?.contact || res.contact || {};
      setFullName(res.full_name || contact.name || contact.fullName || "");
      setEmail(res.email || contact.email || "");
      setPhone(res.phone || contact.phone || "");
      setLocation(res.location || contact.location || "");
      setLinkedinUrl(res.linkedin_url || contact.linkedin || "");
      setGithubUrl(res.github_url || "");
      setSummary(res.summary || res.parsed_data?.summary?.text || res.summary?.text || "");

      const skillsList = res.skills || res.parsed_data?.skills || [];
      setSkills(skillsList.map((s: any) => (typeof s === "string" ? s : s.name || "")).join(", "));
    }
  }, [resume]);

  const handleSave = async () => {
    if (isUpdating) return;
    try {
      const res = resume as any;
      const parsedSkills = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const updatePayload = {
        parsed_data: {
          contact: {
            name: fullName,
            email: email,
            phone: phone,
            linkedin: linkedinUrl,
            location: location,
          },
          summary: {
            text: summary,
          },
          skills: parsedSkills,
          education: res?.parsed_data?.education || res?.education || [],
          experience: res?.parsed_data?.experience || res?.experience || [],
          projects: res?.parsed_data?.projects || res?.projects || [],
          certifications: res?.parsed_data?.certifications || res?.certifications || [],
        },
      };

      await updateProfileResume(updatePayload).unwrap();
      Alert.alert("Success", "Your resume details have been updated successfully!");
      setActiveTab("view");
      refetch();
    } catch (err) {
      console.error("Failed to update profile resume:", err);
      Alert.alert("Update Failed", "Could not update your resume details. Please try again.");
    }
  };

  if (isFetching) {
    return <GamifiedMascotLoader title="Loading Your Resume..." />;
  }

  const parsedSkillsArray = skills
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-slate-100 bg-white">
          <Pressable
            onPress={() => safeBack()}
            className="w-9 h-9 items-center justify-center rounded-xl bg-slate-50 active:bg-slate-100"
          >
            <Feather name="chevron-left" size={22} color="#0f172a" />
          </Pressable>
          <Text className="flex-1 text-center font-extrabold text-slate-900 text-lg">
            My Resume
          </Text>
          <View className="w-9" />
        </View>

        {/* Custom Tab Selector */}
        <View className="flex-row p-2 bg-white border-b border-slate-100">
          <Pressable
            onPress={() => setActiveTab("view")}
            className={`flex-1 py-3 items-center justify-center rounded-2xl ${activeTab === "view" ? "bg-slate-900 shadow-sm" : "bg-transparent"}`}
          >
            <Text
              className={`font-bold text-sm ${activeTab === "view" ? "text-white" : "text-slate-500"}`}
            >
              View Resume
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("edit")}
            className={`flex-1 py-3 items-center justify-center rounded-2xl ${activeTab === "edit" ? "bg-slate-900 shadow-sm" : "bg-transparent"}`}
          >
            <Text
              className={`font-bold text-sm ${activeTab === "edit" ? "text-white" : "text-slate-500"}`}
            >
              Edit Details
            </Text>
          </Pressable>
        </View>

        {/* Main Content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === "view" ? (
            <View className="gap-6">
              {/* Profile Overview Card */}
              <View className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <Text className="text-slate-900 font-black text-xl mb-4">
                  {fullName || "No Name Provided"}
                </Text>

                {/* Contact grid */}
                <View className="gap-2.5">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center mr-3">
                      <Feather name="mail" size={14} color="#64748b" />
                    </View>
                    <Text className="text-slate-600 text-sm font-semibold">{email || "—"}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center mr-3">
                      <Feather name="phone" size={14} color="#64748b" />
                    </View>
                    <Text className="text-slate-600 text-sm font-semibold">{phone || "—"}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center mr-3">
                      <Feather name="map-pin" size={14} color="#64748b" />
                    </View>
                    <Text className="text-slate-600 text-sm font-semibold">{location || "—"}</Text>
                  </View>
                  {(linkedinUrl || githubUrl) && (
                    <View className="border-t border-slate-100 mt-2 pt-3 flex-row gap-4">
                      {linkedinUrl && (
                        <View className="flex-row items-center">
                          <Feather name="linkedin" size={14} color="#0077b5" className="mr-1.5" />
                          <Text className="text-slate-500 text-xs font-bold">LinkedIn</Text>
                        </View>
                      )}
                      {githubUrl && (
                        <View className="flex-row items-center">
                          <Feather name="github" size={14} color="#24292e" className="mr-1.5" />
                          <Text className="text-slate-500 text-xs font-bold">GitHub</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>

              {/* Professional Summary */}
              <View className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <Text className="text-slate-900 font-extrabold text-base mb-3">
                  Professional Summary
                </Text>
                <Text className="text-slate-600 text-sm leading-6">
                  {summary || "No professional summary provided. Tap Edit Details to write one!"}
                </Text>
              </View>

              {/* Skills Card */}
              <View className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <Text className="text-slate-900 font-extrabold text-base mb-4">
                  Key Expertise & Skills
                </Text>
                {parsedSkillsArray.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {parsedSkillsArray.map((skill, index) => (
                      <View key={index} className="bg-slate-100 px-3.5 py-1.5 rounded-full">
                        <Text className="text-slate-700 text-xs font-bold">{skill}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-slate-400 text-sm italic">No skills listed yet.</Text>
                )}
              </View>

              {/* Interactive Edit Callout */}
              <Pressable
                onPress={() => setActiveTab("edit")}
                className="bg-slate-900 active:bg-slate-800 py-4.5 rounded-2xl flex-row items-center justify-center gap-2.5 shadow-sm"
              >
                <Feather name="edit-3" size={16} color="#fff" />
                <Text className="text-white font-extrabold text-sm">Edit Resume Details</Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-5">
              {/* Personal Details Form */}
              <View className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm gap-4">
                <Text className="text-slate-900 font-extrabold text-base border-b border-slate-100 pb-2">
                  Contact Information
                </Text>

                <View>
                  <Text className="text-slate-500 text-xs font-bold mb-1.5">Full Name</Text>
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter full name"
                    placeholderTextColor="#94a3b8"
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-semibold"
                  />
                </View>

                <View>
                  <Text className="text-slate-500 text-xs font-bold mb-1.5">Email Address</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email address"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-semibold"
                  />
                </View>

                <View>
                  <Text className="text-slate-500 text-xs font-bold mb-1.5">Phone Number</Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter phone number"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-semibold"
                  />
                </View>

                <View>
                  <Text className="text-slate-500 text-xs font-bold mb-1.5">Location</Text>
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="e.g. San Francisco, CA"
                    placeholderTextColor="#94a3b8"
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-semibold"
                  />
                </View>

                <View>
                  <Text className="text-slate-500 text-xs font-bold mb-1.5">
                    LinkedIn Profile URL
                  </Text>
                  <TextInput
                    value={linkedinUrl}
                    onChangeText={setLinkedinUrl}
                    placeholder="linkedin.com/in/username"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-semibold"
                  />
                </View>
              </View>

              {/* Summary Form */}
              <View className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <Text className="text-slate-900 font-extrabold text-base mb-3">
                  Professional Summary
                </Text>
                <TextInput
                  value={summary}
                  onChangeText={setSummary}
                  placeholder="Write a brief professional summary..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-semibold min-h-[100]"
                />
              </View>

              {/* Skills Form */}
              <View className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <Text className="text-slate-900 font-extrabold text-base mb-1.5">Key Skills</Text>
                <Text className="text-slate-400 text-xs mb-3">
                  Separate each skill with a comma
                </Text>
                <TextInput
                  value={skills}
                  onChangeText={setSkills}
                  placeholder="e.g. React Native, TypeScript, Python, UI/UX"
                  placeholderTextColor="#94a3b8"
                  multiline
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-semibold min-h-[80]"
                />
              </View>

              {/* Save CTA */}
              <Pressable
                onPress={handleSave}
                disabled={isUpdating}
                className={`py-4.5 rounded-2xl items-center justify-center flex-row shadow-sm ${isUpdating ? "bg-slate-300" : "bg-emerald-600 active:bg-emerald-700"}`}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Feather name="check-circle" size={16} color="#fff" className="mr-2" />
                    <Text className="text-white font-black text-sm">Save Changes</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
