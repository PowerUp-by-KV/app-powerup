import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Share,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/Themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectBuilderDraft, resetBuilderState } from "@/store/slices/resume-builder.slice";
import {
  useLazyExportBuiltResumeQuery,
  useUpdateBuiltResumeMutation,
} from "@/services/resume-builder-api";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useThemeToggle } from "@/hooks/useThemeToggle";

interface ResumeExportViewProps {
  onBack: () => void;
  useAutoEnhance: boolean;
}

export function ResumeExportView({ onBack, useAutoEnhance }: ResumeExportViewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const draftResume = useAppSelector(selectBuilderDraft);

  const [triggerExport] = useLazyExportBuiltResumeQuery();
  const [updateBuiltResume] = useUpdateBuiltResumeMutation();

  const [isProcessing, setIsProcessing] = useState(false);
  const { isDark } = useThemeToggle();

  // Helper to ensure we have a saved & generated export URL
  const getExportUrl = async (fileType: "pdf" | "docx" = "pdf"): Promise<string | null> => {
    try {
      setIsProcessing(true);
      // ALWAYS force-save the current state (including layout choice) before exporting.
      console.log(
        "[EXPORT] draftResume.layout at export time:",
        draftResume.layout,
        "templateName:",
        draftResume.templateName,
      );
      await updateBuiltResume(draftResume).unwrap();
      const result = await triggerExport({
        auto_enhance: useAutoEnhance,
        file_type: fileType,
      }).unwrap();
      if (result?.url) {
        return result.url;
      }
      throw new Error(`Export response did not contain ${fileType.toUpperCase()} URL`);
    } catch (error) {
      console.warn(`${fileType.toUpperCase()} Export failure:`, error);
      const err = error as Record<string, unknown>;
      const errorData = err?.data as Record<string, unknown> | undefined;
      const errorDetail = errorData?.detail || errorData?.message || JSON.stringify(err);
      Alert.alert("Export Failed", `Failed to generate your resume. Details: ${errorDetail}`);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = async () => {
    const url = await getExportUrl("pdf");
    if (url) {
      await Linking.openURL(url);
    }
  };

  const handleDownloadDocx = async () => {
    const url = await getExportUrl("docx");
    if (url) {
      // Use Microsoft Office viewer to display the DOCX in the browser instead of just downloading it
      const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
      await Linking.openURL(viewerUrl);
    }
  };

  const handleEmailToMyself = async () => {
    const url = await getExportUrl("pdf");
    if (url) {
      await Linking.openURL(
        `mailto:?subject=My Professional Resume&body=Here is my resume: ${url}`,
      );
    }
  };

  const handleShareLinkedIn = async () => {
    const url = await getExportUrl("pdf");
    if (url) {
      await Linking.openURL(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      );
    }
  };

  const handleShareNative = async () => {
    const url = await getExportUrl("pdf");
    if (url) {
      try {
        await Share.share({
          message: `Check out my professional resume: ${url}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleDone = () => {
    dispatch(resetBuilderState());
    router.replace("/(tabs)" as never);
  };

  return (
    <ScrollView
      style={[styles.scrollContainer, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Top Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Feather name="check" size={32} color="white" />
          </View>
        </View>

        {/* Header Text */}
        <View style={styles.headerTextContainer}>
          <Text style={[styles.title, { color: isDark ? "#f8fafc" : "#111827" }]}>
            Resume Ready!
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? "#94a3b8" : "#6b7280" }]}>
            Your professional resume is ready
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? "#1e293b" : "white",
                borderColor: isDark ? "#334155" : "#e5e7eb",
              },
            ]}
            onPress={handleDownloadPdf}
            disabled={isProcessing}
          >
            <Feather
              name="download"
              size={20}
              color={isDark ? "#cbd5e1" : "#374151"}
              style={styles.actionIcon}
            />
            <Text style={[styles.actionText, { color: isDark ? "#f8fafc" : "#374151" }]}>
              Download as PDF
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? "#1e293b" : "white",
                borderColor: isDark ? "#334155" : "#e5e7eb",
              },
            ]}
            onPress={handleDownloadDocx}
            disabled={isProcessing}
          >
            <Feather
              name="file-text"
              size={20}
              color={isDark ? "#cbd5e1" : "#374151"}
              style={styles.actionIcon}
            />
            <Text style={[styles.actionText, { color: isDark ? "#f8fafc" : "#374151" }]}>
              Download as DOCX
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? "#1e293b" : "white",
                borderColor: isDark ? "#334155" : "#e5e7eb",
              },
            ]}
            onPress={handleEmailToMyself}
            disabled={isProcessing}
          >
            <Feather
              name="mail"
              size={20}
              color={isDark ? "#cbd5e1" : "#374151"}
              style={styles.actionIcon}
            />
            <Text style={[styles.actionText, { color: isDark ? "#f8fafc" : "#374151" }]}>
              Email to Myself
            </Text>
          </TouchableOpacity>
        </View>

        {/* Share Box */}
        <View style={[styles.shareBox, { backgroundColor: isDark ? "#1e293b" : "white" }]}>
          <Text style={[styles.shareBoxTitle, { color: isDark ? "#94a3b8" : "#6b7280" }]}>
            Share Your Resume
          </Text>
          <View style={styles.shareIconsContainer}>
            <Pressable
              style={styles.shareIconCircle}
              onPress={handleShareLinkedIn}
              disabled={isProcessing}
            >
              <Feather name="linkedin" size={24} color="#4d7c0f" />
            </Pressable>
            <Pressable
              style={styles.shareIconCircle}
              onPress={handleEmailToMyself}
              disabled={isProcessing}
            >
              <MaterialIcons name="mail-outline" size={24} color="#4d7c0f" />
            </Pressable>
            <Pressable
              style={styles.shareIconCircle}
              onPress={handleShareNative}
              disabled={isProcessing}
            >
              <MaterialIcons name="public" size={24} color="#4d7c0f" />
            </Pressable>
          </View>
        </View>

        {/* Primary Action */}
        <View style={styles.primaryActionContainer}>
          <TouchableOpacity activeOpacity={0.8} style={[styles.primaryButton]} onPress={handleDone}>
            <Text style={styles.primaryButtonText}>Create another Resume</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          {isProcessing && (
            <ActivityIndicator size="small" color="#3b82f6" style={{ marginBottom: 12 }} />
          )}
          <Text style={styles.footerText}>
            Yahooo!!You're set{"  "}
            <Text style={styles.footerLink} onPress={onBack}>
              Back
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  contentContainer: {
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3b82f6", // Vibrant Blue
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTextContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  actionButtonsContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  actionButtonPressed: {
    backgroundColor: "#f9fafb",
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  shareBox: {
    width: "100%",
    backgroundColor: "white",
    borderWidth: 0,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  shareBoxTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 16,
  },
  shareIconsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  shareIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#a3e635", // Neon Lime Green
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#a3e635",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryActionContainer: {
    width: "100%",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#3b82f6", // Vibrant blue
    borderRadius: 30, // Pill shape
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonPressed: {
    backgroundColor: "#2563eb",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  footerLink: {
    color: "#3b82f6",
    fontWeight: "600",
  },
});
