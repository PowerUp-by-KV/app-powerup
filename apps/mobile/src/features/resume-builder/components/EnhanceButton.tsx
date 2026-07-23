import React from "react";
import { Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { Text } from "@/components/Themed";
import { Feather } from "@expo/vector-icons";
import { useEnhanceBuiltResumeDetailMutation } from "@/services/resume-builder-api";
import { ApiErrorHandler } from "@/services/error-handler";
import { showAlert } from "@/utils/alert";

interface EnhanceButtonProps {
  sectionName: string;
  textToEnhance: string;
  onEnhanced: (enhancedText: string) => void;
  disabled?: boolean;
}

export function EnhanceButton({
  sectionName,
  textToEnhance,
  onEnhanced,
  disabled = false,
}: EnhanceButtonProps) {
  const [enhanceDetail, { isLoading }] = useEnhanceBuiltResumeDetailMutation();

  const handleEnhance = async () => {
    if (!textToEnhance?.trim()) {
      return;
    }

    try {
      const response = await enhanceDetail({
        section: sectionName,
        text: textToEnhance,
      }).unwrap();

      if (response?.enhanced_text) {
        onEnhanced(response.enhanced_text);
      } else {
        throw new Error("Enhancement did not return text");
      }
    } catch (error) {
      console.error("AI enhancement failure:", error);
      const parsedError = ApiErrorHandler.parseError(error, "update");
      showAlert(
        "Enhancement Error",
        parsedError.userMessage || "Failed to enhance text. Please try again later.",
      );
    }
  };

  const isBtnDisabled = disabled || isLoading || !textToEnhance?.trim();

  return (
    <Pressable
      onPress={handleEnhance}
      disabled={isBtnDisabled}
      style={[styles.button, isBtnDisabled && styles.disabledButton]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          <Feather name="zap" size={12} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>AI Enhance</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    backgroundColor: "#6366f1",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  disabledButton: {
    backgroundColor: "#a5b4fc",
    opacity: 0.8,
  },
  icon: {
    marginRight: 4,
  },
  buttonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "white",
  },
});
