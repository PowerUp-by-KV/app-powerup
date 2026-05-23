import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";

import { useStartSessionMutation } from "@/services/assessment-api";
import {
  useExtractResumeMutation,
  useConfirmResumeMutation,
} from "@/services/onboarding-api";
import { getApiErrorMessage } from "@/utils/error-message";

export function ResumeUploadStep() {
  const router = useRouter();
  const [picked, setPicked] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  
  const [extractResume, { isLoading: isExtracting }] = useExtractResumeMutation();
  const [confirmResume, { isLoading: isConfirming }] = useConfirmResumeMutation();
  const [startSession, { isLoading: isStarting }] = useStartSessionMutation();
  
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<any>(null);

  const handlePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    setPicked(result.assets[0] ?? null);
    // Reset state if a new file is picked
    setResumeId(null);
    setEditedData(null);
  };

  const goToAssessment = async () => {
    try {
      const session = await startSession().unwrap();
      router.replace(`/read?session_id=${session.session_id}` as never);
    } catch {
      // If session start fails, still land user in the app
      router.replace("/(tabs)" as never);
    }
  };

  const handleUploadAndExtract = async () => {
    if (!picked) {
      console.warn("[ResumeUploadStep] Continue clicked but no file was picked.");
      return;
    }

    try {
      const formData = new FormData();
      if (Platform.OS === "web") {
        let fileObj = (picked as any).file;
        if (!fileObj && (picked.uri.startsWith("blob:") || picked.uri.startsWith("data:"))) {
          const response = await fetch(picked.uri);
          const blob = await response.blob();
          fileObj = new File([blob], picked.name, { type: picked.mimeType ?? "application/pdf" });
        }

        if (fileObj) {
          formData.append("file", fileObj, picked.name);
        } else {
          formData.append("file", {
            uri: picked.uri,
            name: picked.name,
            type: picked.mimeType ?? "application/pdf",
          } as unknown as File);
        }
      } else {
        formData.append("file", {
          uri: picked.uri,
          name: picked.name,
          type: picked.mimeType ?? "application/pdf",
        } as unknown as File);
      }

      console.log("[ResumeUploadStep] Invoking extractResume API call...");
      const extractResponse = await extractResume(formData).unwrap();
      console.log("[ResumeUploadStep] Resume extracted successfully.");
      
      setResumeId(extractResponse.resume_id);
      setEditedData(extractResponse.parsed_data);
    } catch (err) {
      console.error("[ResumeUploadStep] Resume extraction failed:", err);
      Alert.alert("Upload failed", getApiErrorMessage(err, "Could not extract data from your resume."));
    }
  };

  const handleConfirm = async () => {
    if (!resumeId || !editedData) return;

    try {
      const formData = new FormData();
      formData.append("resume_id", resumeId);
      formData.append("confirmed_data", JSON.stringify(editedData));

      console.log("[ResumeUploadStep] Invoking confirmResume API call...");
      await confirmResume(formData).unwrap();
      console.log("[ResumeUploadStep] Resume confirmed successfully.");

      setUploadSuccess(true);
      setTimeout(async () => {
        try {
          const session = await startSession().unwrap();
          router.replace(`/read?session_id=${session.session_id}` as never);
        } catch (sessionErr) {
          console.error("[ResumeUploadStep] Failed to start session:", sessionErr);
          router.replace("/(tabs)" as never);
        }
      }, 2000);
    } catch (err) {
      console.error("[ResumeUploadStep] Resume confirmation failed:", err);
      Alert.alert("Confirmation failed", getApiErrorMessage(err, "Could not confirm your resume data."));
    }
  };

  // Success overlay
  if (uploadSuccess) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: "#22c55e", justifyContent: "center", alignItems: "center", marginBottom: 24 }}>
            <Feather name="check" size={52} color="#fff" />
          </View>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#15803d", marginBottom: 8 }}>
            Upload Successful!
          </Text>
          <Text style={{ fontSize: 15, color: "#6b7280" }}>Redirecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Confirmation/Editing View
  if (editedData) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <View className="px-6 pt-6 pb-2">
            <Text className="text-slate-900 text-xl font-extrabold mb-2">
              Review your details
            </Text>
            <Text className="text-slate-500 text-sm">
              We extracted this from your resume. Edit any mistakes before continuing.
            </Text>
          </View>

          <ScrollView className="flex-1 px-6">
            <View className="mb-6">
              <Text className="font-bold text-slate-700 mb-2">Skills (comma separated)</Text>
              <TextInput
                className="border border-slate-300 bg-white rounded-xl p-4 text-slate-900 leading-5"
                multiline
                value={editedData.skills?.map((s: any) => typeof s === 'string' ? s : s.name).join(", ")}
                onChangeText={(text) => setEditedData({
                  ...editedData, 
                  skills: text.split(",").map(s => s.trim()).filter(Boolean)
                })}
              />
            </View>

            <View className="mb-6">
              <Text className="font-bold text-slate-700 mb-2">Experience</Text>
              {editedData.experience?.map((exp: any, index: number) => (
                <View key={index} className="mb-3 p-4 bg-white border border-slate-200 rounded-xl">
                  <TextInput 
                    className="font-semibold text-base text-slate-900 mb-1" 
                    value={exp.position} 
                    onChangeText={(text) => {
                      const newExp = [...(editedData.experience || [])];
                      newExp[index] = {...newExp[index], position: text};
                      setEditedData({...editedData, experience: newExp});
                    }}
                    placeholder="Position/Title"
                  />
                  <TextInput 
                    className="text-slate-600" 
                    value={exp.company} 
                    onChangeText={(text) => {
                      const newExp = [...(editedData.experience || [])];
                      newExp[index] = {...newExp[index], company: text};
                      setEditedData({...editedData, experience: newExp});
                    }}
                    placeholder="Company Name"
                  />
                </View>
              ))}
              {(!editedData.experience || editedData.experience.length === 0) && (
                <Text className="text-slate-400 italic">No experience found</Text>
              )}
            </View>

            <View className="mb-6">
              <Text className="font-bold text-slate-700 mb-2">Projects</Text>
              {editedData.projects?.map((proj: any, index: number) => (
                <View key={index} className="mb-3 p-4 bg-white border border-slate-200 rounded-xl">
                  <TextInput 
                    className="font-semibold text-base text-slate-900" 
                    value={proj.name} 
                    onChangeText={(text) => {
                      const newProj = [...(editedData.projects || [])];
                      newProj[index] = {...newProj[index], name: text};
                      setEditedData({...editedData, projects: newProj});
                    }}
                    placeholder="Project Name"
                  />
                </View>
              ))}
              {(!editedData.projects || editedData.projects.length === 0) && (
                <Text className="text-slate-400 italic">No projects found</Text>
              )}
            </View>
          </ScrollView>

          <View className="px-6 py-4 bg-white border-t border-slate-100">
            <Pressable
              onPress={handleConfirm}
              disabled={isConfirming || isStarting}
              className={`rounded-full py-4 items-center mb-2 ${isConfirming || isStarting ? "bg-indigo-400" : "bg-indigo-600"}`}
            >
              {isConfirming || isStarting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Confirm & Continue</Text>
              )}
            </Pressable>
            <Pressable onPress={() => { setEditedData(null); setResumeId(null); }} className="items-center py-3">
              <Text className="text-slate-500 font-semibold">Upload a different file</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Initial Upload View
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="h-1 bg-slate-100 w-full">
        <View className="h-full bg-indigo-600 w-full" />
      </View>

      <View className="flex-1 px-6 pt-6">
        <Text className="text-slate-900 text-xl font-extrabold text-center mb-8">
          Upload your Resume
        </Text>

        <Pressable
          onPress={handlePick}
          className="border-2 border-dashed border-slate-300 rounded-3xl py-12 items-center active:opacity-80"
        >
          <View className="w-14 h-14 rounded-full bg-slate-100 items-center justify-center mb-4">
            <Feather name="upload" size={24} color="#475569" />
          </View>
          <Text className="text-slate-900 font-semibold text-base mb-1 text-center px-4">
            {picked ? picked.name : "Upload your resume here"}
          </Text>
          <Pressable
            onPress={handlePick}
            className="mt-4 bg-indigo-600 px-5 py-2 rounded-lg flex-row items-center"
          >
            <Feather name="file-text" size={14} color="#fff" />
            <Text className="text-white font-semibold ml-2">Browse Files</Text>
          </Pressable>
          <Text className="text-slate-400 text-xs mt-4">Supported formats: PDF, DOC, DOCX</Text>
          <Text className="text-slate-400 text-xs">Maximum file size: 10MB</Text>
        </Pressable>

        <Text className="text-slate-500 text-sm text-center mt-6 px-4">
          Upload your resume to analyze and enhance your professional profile
        </Text>

        <View className="flex-1 justify-end pb-6">
          <Pressable
            onPress={handleUploadAndExtract}
            disabled={!picked || isExtracting}
            className={`rounded-full py-4 items-center mb-3 ${!picked || isExtracting ? "bg-slate-300" : "bg-slate-700"}`}
          >
            {isExtracting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold">Extract Details</Text>
            )}
          </Pressable>
          <Pressable onPress={goToAssessment} disabled={isExtracting} className="items-center py-2">
            <Text className="text-slate-500 font-semibold">
              Skip for now
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
