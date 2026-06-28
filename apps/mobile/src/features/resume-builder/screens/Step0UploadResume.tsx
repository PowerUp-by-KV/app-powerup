import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Text,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import * as DocumentPicker from "expo-document-picker";
import * as SecureStore from "expo-secure-store";
import { WizardHeader } from "../components/WizardHeader";
import { useUploadResumeMutation } from "@/services/resume-api";
import { useThemeToggle } from "@/hooks/useThemeToggle";

interface Step0UploadResumeProps {
  onNext: () => void;
  onBack: () => void;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isPickerCanceled = (result: unknown) => {
  if (!isRecord(result)) return true;
  if (typeof result.canceled === "boolean") return result.canceled;
  return result.type === "cancel";
};

export function Step0UploadResume({ onNext, onBack }: Step0UploadResumeProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeToggle();
  const screenWidth = Dimensions.get("window").width;
  const [uploadResume] = useUploadResumeMutation();

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
    type: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleBrowse = async () => {
    try {
      if (Platform.OS === "web") {
        const result = await DocumentPicker.getDocumentAsync({
          type: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "text/html",
            "text/rtf",
          ],
          copyToCacheDirectory: true,
          multiple: false,
        });
        if (isPickerCanceled(result)) return;
        const file = (result as any).assets?.[0] || result;
        setSelectedFile({
          name: file.name,
          uri: file.uri,
          type: file.mimeType || "application/pdf",
        });
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "text/html",
            "text/rtf",
          ],
          copyToCacheDirectory: true,
          multiple: false,
        });

        if (isPickerCanceled(result)) return;
        const file = (result as any).assets?.[0] || result;
        setSelectedFile({
          name: file.name,
          uri: file.uri,
          type: file.mimeType || "application/pdf",
        });
      }
    } catch {
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const handleGoogleDrive = () => {
    handleBrowse();
  };

  const handleDropbox = () => {
    handleBrowse();
  };

  const handleContinue = async () => {
    if (!selectedFile) {
      Alert.alert("No File Selected", "Please select a resume file first.");
      return;
    }

    try {
      setUploading(true);
      const uploadData = new FormData();
      if (Platform.OS === "web") {
        const response = await fetch(selectedFile.uri);
        const blob = await response.blob();
        uploadData.append("file", blob, selectedFile.name);
      } else {
        uploadData.append("file", {
          uri: selectedFile.uri,
          type: selectedFile.type,
          name: selectedFile.name,
        } as unknown as Blob);
      }

      const response = await uploadResume(uploadData).unwrap();

      if (response && response.user_id) {
        if (Platform.OS === "web") {
          try {
            window.localStorage.setItem("user_id", response.user_id);
          } catch {
            console.warn("localStorage not available on web");
          }
        } else {
          await SecureStore.setItemAsync("user_id", response.user_id);
        }
      }

      setUploading(false);
      onNext();
    } catch (error) {
      setUploading(false);
      Alert.alert("Upload Failed", "There was an error uploading your resume. Please try again.");
      console.error("Upload error:", error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: isDark ? "#0f172a" : "#ffffff" },
      ]}
    >
      {/* Background Blobs */}
      <View style={[StyleSheet.absoluteFillObject, { overflow: "hidden" }]} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="blueGlow" cx="100%" cy="100%" rx="80%" ry="80%" fx="100%" fy="100%">
              <Stop offset="0%" stopColor={isDark ? "#1e3a8a" : "#E0E7FF"} stopOpacity="0.5" />
              <Stop offset="100%" stopColor={isDark ? "#1e3a8a" : "#E0E7FF"} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="greenGlow" cx="0%" cy="50%" rx="60%" ry="60%" fx="0%" fy="50%">
              <Stop offset="0%" stopColor={isDark ? "#064e3b" : "#ECFDF5"} stopOpacity="0.5" />
              <Stop offset="100%" stopColor={isDark ? "#064e3b" : "#ECFDF5"} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="100%" cy="100%" r={screenWidth * 0.7} fill="url(#blueGlow)" />
          <Circle cx="0%" cy="50%" r={screenWidth * 0.5} fill="url(#greenGlow)" />
        </Svg>
      </View>

      <WizardHeader title="How do you want to upload your resume?" onBack={onBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Drop Zone */}
        <View style={[styles.dropZone, { backgroundColor: isDark ? "#1e293b" : "#ffffff" }]}>
          {selectedFile ? (
            <>
              <Feather name="file-text" size={36} color="#5A7CFF" />
              <Text
                style={[
                  styles.dropZoneText,
                  { fontWeight: "600", color: isDark ? "#F3F4F6" : "#374151" },
                ]}
              >
                {selectedFile.name}
              </Text>
              <Pressable
                onPress={handleBrowse}
                style={[
                  styles.browseButton,
                  { backgroundColor: isDark ? "#374151" : "#F3F4F6", marginTop: 12 },
                ]}
              >
                <Text style={[styles.browseButtonText, { color: isDark ? "#F3F4F6" : "#4B5563" }]}>
                  Change File
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Feather name="upload" size={36} color="#5A7CFF" />
              <Text style={[styles.dropZoneText, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
                Drag and drop a file here
              </Text>
              <Pressable
                onPress={handleBrowse}
                style={[styles.browseButton, { backgroundColor: isDark ? "#5A7CFF" : "#F3F4F6" }]}
              >
                <Text style={[styles.browseButtonText, { color: isDark ? "#ffffff" : "#4B5563" }]}>
                  Browse
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {/* OR Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: isDark ? "#374151" : "#E5E7EB" }]} />
          <Text style={[styles.dividerText, { color: isDark ? "#9CA3AF" : "#9CA3AF" }]}>OR</Text>
          <View style={[styles.dividerLine, { backgroundColor: isDark ? "#374151" : "#E5E7EB" }]} />
        </View>

        {/* Google Drive Button */}
        <Pressable
          onPress={handleGoogleDrive}
          style={[
            styles.serviceButton,
            {
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: isDark ? "#374151" : "#E5E7EB",
            },
          ]}
        >
          <View style={[styles.iconWrapper, { backgroundColor: isDark ? "#374151" : "#F3F4F6" }]}>
            <FontAwesome5 name="google-drive" size={18} color="#EA4335" />
          </View>
          <Text style={[styles.serviceButtonText, { color: isDark ? "#F3F4F6" : "#4B5563" }]}>
            Google Drive
          </Text>
        </Pressable>

        {/* Dropbox Button */}
        <Pressable
          onPress={handleDropbox}
          style={[
            styles.serviceButton,
            {
              marginTop: 12,
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: isDark ? "#374151" : "#E5E7EB",
            },
          ]}
        >
          <View style={[styles.iconWrapper, { backgroundColor: isDark ? "#374151" : "#F3F4F6" }]}>
            <FontAwesome5 name="dropbox" size={18} color="#0061FF" />
          </View>
          <Text style={[styles.serviceButtonText, { color: isDark ? "#F3F4F6" : "#4B5563" }]}>
            Dropbox
          </Text>
        </Pressable>

        {/* Supported Formats */}
        <Text style={[styles.formatsText, { color: isDark ? "#6B7280" : "#9CA3AF" }]}>
          Files: DOC, DOCX, PDF, HTML, RTF, TXT
        </Text>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          onPress={handleContinue}
          style={[styles.continueButton, uploading && { opacity: 0.7 }]}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
  },
  dropZone: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#5A7CFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  dropZoneText: {
    fontSize: 14,
    marginTop: 16,
  },
  browseButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: "600",
  },
  serviceButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  serviceButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  formatsText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  continueButton: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5A7CFF",
    shadowColor: "#5A7CFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
