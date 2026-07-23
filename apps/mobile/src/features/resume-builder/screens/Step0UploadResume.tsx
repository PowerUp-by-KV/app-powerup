import React, { useState, useEffect } from "react";
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
import { ResumeSkeletonLoader } from "@/features/resume/components/ResumeSkeletonLoader";

interface GooglePickerBuilder {
  addView: (view: unknown) => GooglePickerBuilder;
  setOAuthToken: (token: string) => GooglePickerBuilder;
  setDeveloperKey: (key: string) => GooglePickerBuilder;
  setCallback: (
    callback: (data: { action: string; docs?: Record<string, string>[] }) => Promise<void>,
  ) => GooglePickerBuilder;
  build: () => { setVisible: (visible: boolean) => void };
}

interface WindowWithGlobals {
  gapi?: {
    load: (api: string, callback: () => void) => void;
  };
  google?: {
    accounts: {
      oauth2: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: { error?: unknown; access_token: string }) => Promise<void>;
        }) => { requestAccessToken: (options: { prompt: string }) => void };
      };
    };
    picker: {
      View: new (viewId: string) => { setMimeTypes: (mime: string) => void };
      ViewId: { DOCS: string };
      PickerBuilder: new () => GooglePickerBuilder;
      Action: { PICKED: string };
      Document: { ID: string; NAME: string; MIME_TYPE: string };
    };
  };
  Dropbox?: {
    choose: (options: {
      success: (files: { name: string; link: string }[]) => Promise<void>;
      cancel: () => void;
      linkType: string;
      multiselect: boolean;
      extensions: string[];
    }) => void;
  };
}

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    // Dynamically inject Google APIs for Picker on web
    const script1 = document.createElement("script");
    script1.src = "https://apis.google.com/js/api.js";
    script1.async = true;
    script1.defer = true;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src = "https://accounts.google.com/gsi/client";
    script2.async = true;
    script2.defer = true;
    document.head.appendChild(script2);

    // Dynamically inject Dropbox Chooser SDK on web
    const dropboxKey = process.env.EXPO_PUBLIC_DROPBOX_APP_KEY || "";
    let script3: HTMLScriptElement | null = null;
    if (dropboxKey) {
      script3 = document.createElement("script");
      script3.src = "https://www.dropbox.com/static/api/2/dropins.js";
      script3.id = "dropboxjs";
      script3.setAttribute("data-app-key", dropboxKey);
      script3.async = true;
      document.head.appendChild(script3);
    }

    return () => {
      try {
        document.head.removeChild(script1);
        document.head.removeChild(script2);
        if (script3) {
          document.head.removeChild(script3);
        }
      } catch {}
    };
  }, []);

  const openGooglePicker = () => {
    const developerKey = process.env.EXPO_PUBLIC_GOOGLE_DEVELOPER_KEY || "";
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "";

    if (!developerKey) {
      if (Platform.OS === "web") {
        alert(
          "API Key Required:\nPlease configure EXPO_PUBLIC_GOOGLE_DEVELOPER_KEY in your .env file to enable the Google Picker.",
        );
      } else {
        Alert.alert(
          "API Key Required",
          "Please configure EXPO_PUBLIC_GOOGLE_DEVELOPER_KEY in your .env file to enable the Google Picker.",
        );
      }
      return;
    }

    const gapi = (window as unknown as WindowWithGlobals).gapi;
    const googleObj = (window as unknown as WindowWithGlobals).google;

    if (!gapi || !googleObj) {
      if (Platform.OS === "web") {
        alert(
          "Google API loading: Google SDK is still loading. Please try again in a few seconds.",
        );
      } else {
        Alert.alert(
          "Google API loading",
          "Google SDK is still loading. Please try again in a few seconds.",
        );
      }
      return;
    }

    gapi.load("client:picker", () => {
      const tokenClient = googleObj.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        callback: async (tokenResponse) => {
          if (tokenResponse.error !== undefined) {
            console.error("Auth error:", tokenResponse);
            return;
          }
          launchPicker(tokenResponse.access_token, developerKey);
        },
      });

      tokenClient.requestAccessToken({ prompt: "consent" });
    });
  };

  const launchPicker = (token: string, key: string) => {
    const googleObj = (window as unknown as WindowWithGlobals).google;
    if (!googleObj) return;
    const view = new googleObj.picker.View(googleObj.picker.ViewId.DOCS);
    view.setMimeTypes(
      "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/html,text/rtf",
    );

    const picker = new googleObj.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(token)
      .setDeveloperKey(key)
      .setCallback(async (data) => {
        if (data.action === googleObj.picker.Action.PICKED) {
          const doc = data.docs?.[0];
          if (!doc) return;
          const fileId = doc[googleObj.picker.Document.ID];
          const fileName = doc[googleObj.picker.Document.NAME];
          const mimeType = doc[googleObj.picker.Document.MIME_TYPE];

          try {
            setUploading(true);
            const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
            const response = await fetch(downloadUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              throw new Error("Failed to download from Drive");
            }

            const blob = await response.blob();
            setSelectedFile({
              name: fileName || "",
              uri: URL.createObjectURL(blob),
              type: mimeType || "application/pdf",
            });
            setUploading(false);
            if (Platform.OS === "web") {
              alert(`Success: Selected ${fileName || ""}`);
            } else {
              Alert.alert("Success", `Selected: ${fileName || ""}`);
            }
          } catch (err) {
            setUploading(false);
            if (Platform.OS === "web") {
              alert("Error: Failed to retrieve the file from Google Drive.");
            } else {
              Alert.alert("Error", "Failed to retrieve the file from Google Drive.");
            }
            console.error(err);
          }
        }
      })
      .build();

    picker.setVisible(true);
  };

  const openDropboxChooser = () => {
    const appKey = process.env.EXPO_PUBLIC_DROPBOX_APP_KEY || "";

    if (!appKey) {
      if (Platform.OS === "web") {
        alert(
          "Dropbox App Key Required:\nPlease configure EXPO_PUBLIC_DROPBOX_APP_KEY in your .env file to enable the Dropbox Chooser.",
        );
      } else {
        Alert.alert(
          "Dropbox App Key Required",
          "Please configure EXPO_PUBLIC_DROPBOX_APP_KEY in your .env file to enable the Dropbox Chooser.",
        );
      }
      return;
    }

    const dropboxObj = (window as unknown as WindowWithGlobals).Dropbox;
    if (!dropboxObj) {
      if (Platform.OS === "web") {
        alert("Dropbox SDK is loading: Please try again in a few seconds.");
      } else {
        Alert.alert("Dropbox SDK is loading", "Please try again in a few seconds.");
      }
      return;
    }

    dropboxObj.choose({
      success: async (files) => {
        if (files && files.length > 0) {
          const file = files[0];
          if (!file) return;
          const name = file.name;
          const directUrl = file.link;

          try {
            setUploading(true);
            const response = await fetch(directUrl);
            if (!response.ok) {
              throw new Error("Failed to download from Dropbox");
            }
            const blob = await response.blob();
            setSelectedFile({
              name: name,
              uri: URL.createObjectURL(blob),
              type: blob.type || "application/pdf",
            });
            setUploading(false);
            if (Platform.OS === "web") {
              alert(`Success: Selected ${name}`);
            } else {
              Alert.alert("Success", `Selected: ${name}`);
            }
          } catch (err) {
            setUploading(false);
            if (Platform.OS === "web") {
              alert("Error: Failed to download the file from Dropbox.");
            } else {
              Alert.alert("Error", "Failed to download the file from Dropbox.");
            }
            console.error(err);
          }
        }
      },
      cancel: () => {
        console.log("Dropbox Chooser cancelled");
      },
      linkType: "direct",
      multiselect: false,
      extensions: [".pdf", ".doc", ".docx", ".txt", ".rtf", ".html"],
    });
  };

  const handleBrowse = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Widen to allow picking Google Drive / Dropbox files on mobile without greying out
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (isPickerCanceled(result)) return;
      const successResult = result as {
        assets?: { uri: string; name: string; mimeType?: string; size?: number }[];
      };
      const file = successResult.assets?.[0];
      if (!file) return;

      // Client-side extension validation
      const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".rtf", ".html"];
      const fileNameLower = (file.name || "").toLowerCase();
      const isValid = allowedExtensions.some((ext) => fileNameLower.endsWith(ext));

      if (!isValid) {
        if (Platform.OS === "web") {
          alert(
            "Invalid File Type:\nPlease select a valid resume document (PDF, DOC, DOCX, TXT, RTF, or HTML).",
          );
        } else {
          Alert.alert(
            "Invalid File Type",
            "Please select a valid resume document (PDF, DOC, DOCX, TXT, RTF, or HTML).",
          );
        }
        return;
      }

      setSelectedFile({
        name: file.name,
        uri: file.uri,
        type: file.mimeType || "application/pdf",
      });
    } catch {
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const handleGoogleDrive = () => {
    if (Platform.OS === "web") {
      openGooglePicker();
    } else {
      handleBrowse();
    }
  };

  const handleDropbox = () => {
    if (Platform.OS === "web") {
      openDropboxChooser();
    } else {
      handleBrowse();
    }
  };

  const handleContinue = async () => {
    if (!selectedFile) {
      Alert.alert("No File Selected", "Please select a resume file first.");
      return;
    }

    try {
      setIsSubmitting(true);
      const uploadData = new FormData();
      if (Platform.OS === "web") {
        const fileResponse = await fetch(selectedFile.uri);
        const blob = await fileResponse.blob();
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

      setIsSubmitting(false);
      onNext();
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert("Upload Failed", "There was an error uploading your resume. Please try again.");
      console.error("Upload error:", error);
    }
  };

  if (isSubmitting) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#fafafa" }]}>
        <ResumeSkeletonLoader text="Uploading Resume..." />
      </View>
    );
  }

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
