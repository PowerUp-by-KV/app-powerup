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
import {
  selectBuilderDraft,
  selectBuilderIsDirty,
  resetBuilderState,
} from "@/store/slices/resume-builder.slice";
import {
  useLazyExportBuiltResumePdfQuery,
  useUpdateBuiltResumeMutation,
} from "@/services/resume-builder-api";
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface ResumeExportViewProps {
  onBack: () => void;
}

export function ResumeExportView({ onBack }: ResumeExportViewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const draftResume = useAppSelector(selectBuilderDraft);
  const isDirty = useAppSelector(selectBuilderIsDirty);

  const [triggerExport] = useLazyExportBuiltResumePdfQuery();
  const [updateBuiltResume] = useUpdateBuiltResumeMutation();

  const [isProcessing, setIsProcessing] = useState(false);
  const [cachedPdfUrl, setCachedPdfUrl] = useState<string | null>(null);

  // Helper to ensure we have a saved & generated PDF URL
  const getPdfUrl = async (): Promise<string | null> => {
    try {
      // If we already generated it and no changes were made, use the cached URL instantly!
      if (cachedPdfUrl && !isDirty) {
        return cachedPdfUrl;
      }

      setIsProcessing(true);
      if (isDirty) {
        await updateBuiltResume(draftResume).unwrap();
      }
      const result = await triggerExport({ auto_enhance: false }).unwrap();
      if (result?.url) {
        setCachedPdfUrl(result.url);
        return result.url;
      }
      throw new Error("Export response did not contain PDF URL");
    } catch (error) {
      console.warn("PDF Export failure:", error);
      Alert.alert("Export Failed", "Failed to generate your resume. Please try again.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = async () => {
    const url = await getPdfUrl();
    if (url) {
      await Linking.openURL(url);
    }
  };

  const handleEmailToMyself = async () => {
    const url = await getPdfUrl();
    if (url) {
      await Linking.openURL(
        `mailto:?subject=My Professional Resume&body=Here is my resume: ${url}`,
      );
    }
  };

  const handleShareLinkedIn = async () => {
    const url = await getPdfUrl();
    if (url) {
      await Linking.openURL(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      );
    }
  };

  const handleShareNative = async () => {
    const url = await getPdfUrl();
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
    router.replace("/home" as never);
  };

  return (
    <ScrollView
      style={styles.scrollContainer}
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
          <Text style={styles.title}>Resume Ready!</Text>
          <Text style={styles.subtitle}>Your professional resume is ready</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.actionButton]}
            onPress={handleDownloadPdf}
            disabled={isProcessing}
          >
            <Feather name="download" size={20} color="#374151" style={styles.actionIcon} />
            <Text style={styles.actionText}>Download as PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.actionButton]}
            onPress={handleEmailToMyself}
            disabled={isProcessing}
          >
            <Feather name="mail" size={20} color="#374151" style={styles.actionIcon} />
            <Text style={styles.actionText}>Email to Myself</Text>
          </TouchableOpacity>
        </View>

        {/* Share Box */}
        <View style={styles.shareBox}>
          <Text style={styles.shareBoxTitle}>Share Your Resume</Text>
          <View style={styles.shareIconsContainer}>
            <Pressable
              style={styles.shareIconCircle}
              onPress={handleShareLinkedIn}
              disabled={isProcessing}
            >
              <FontAwesome name="linkedin" size={24} color="#4d7c0f" />
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
    paddingBottom: 48,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    marginBottom: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  actionButtonsContainer: {
    width: "100%",
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 24,
    paddingVertical: 18,
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
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 32,
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
    marginBottom: 20,
  },
  shareIconsContainer: {
    flexDirection: "row",
    gap: 24,
  },
  shareIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#3b82f6", // Vibrant blue
    borderRadius: 30, // Pill shape
    paddingVertical: 18,
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
