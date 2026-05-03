/**
 * PDF Picker Component
 * Displays professional PDF upload interface with validation
 */

import { View, Pressable, Alert, ActivityIndicator } from "react-native";
import { Text } from "@/components/Themed";
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import {
  validatePDFFile,
  formatFileSize,
  getMaxFileSizeDisplay,
  type FileInfo,
} from "@/services/pdf-validation";

export interface PDFPickerProps {
  onFileSelected: (fileInfo: FileInfo) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

type PickedDocument = {
  name: string;
  size?: number;
  mimeType?: string;
  uri: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isPickerCanceled = (result: unknown) => {
  if (!isRecord(result)) return true;
  if (typeof result.canceled === "boolean") return result.canceled;
  return result.type === "cancel";
};

const toPickedDocument = (value: unknown): PickedDocument | undefined => {
  if (!isRecord(value) || typeof value.name !== "string" || typeof value.uri !== "string") {
    return undefined;
  }

  return {
    name: value.name,
    size: typeof value.size === "number" ? value.size : undefined,
    mimeType: typeof value.mimeType === "string" ? value.mimeType : undefined,
    uri: value.uri,
  };
};

const getPickedDocument = (result: unknown): PickedDocument | undefined => {
  if (!isRecord(result)) return undefined;

  if (Array.isArray(result.assets)) {
    return toPickedDocument(result.assets[0]);
  }

  return result.type === "success" ? toPickedDocument(result) : undefined;
};

export function PDFPicker({ onFileSelected, isLoading = false, disabled = false }: PDFPickerProps) {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePickPDF = async () => {
    try {
      setValidationError(null);
      setIsProcessing(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (isPickerCanceled(result)) {
        setIsProcessing(false);
        return;
      }

      const file = getPickedDocument(result);
      if (!file) {
        throw new Error("No file selected");
      }

      // Extract file info
      const fileInfo: FileInfo = {
        name: file.name,
        size: file.size || 0,
        type: file.mimeType || "application/pdf",
        uri: file.uri,
      };

      // Validate PDF file
      const validation = validatePDFFile(fileInfo);
      if (!validation.isValid) {
        setValidationError(validation.error || "Invalid PDF file");
        setIsProcessing(false);
        return;
      }

      // Set selected file
      setSelectedFile(fileInfo);

      // Call callback to upload
      await onFileSelected(fileInfo);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to select PDF";
      setValidationError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setValidationError(null);
  };

  const isActive = isLoading || isProcessing;

  return (
    <View className="space-y-4">
      {/* PDF Picker Card */}
      <Pressable
        onPress={handlePickPDF}
        disabled={isActive || disabled}
        className={`rounded-2xl border-2 ${
          validationError ? "border-red-300 bg-red-50" : "border-dashed border-blue-300 bg-blue-50"
        } px-6 py-8 transition-all ${isActive ? "opacity-60" : ""}`}
      >
        <View className="items-center">
          {isActive ? (
            <>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="mt-3 text-center text-sm font-medium text-gray-700">
                Processing your resume...
              </Text>
            </>
          ) : (
            <>
              <Text className="mb-3 text-5xl">📄</Text>
              <Text className="mb-2 text-center text-lg font-semibold text-gray-900">
                {selectedFile ? "Resume Selected" : "Upload Your Resume"}
              </Text>
              <Text className="mb-3 text-center text-sm text-gray-600">
                {selectedFile ? selectedFile.name : "Click to select a PDF file from your device"}
              </Text>

              {/* Validation Checkpoints */}
              <View className="mt-4 w-full space-y-2 rounded-lg bg-white p-4">
                <View className="flex-row items-center gap-2">
                  <Text
                    className={`text-lg ${validationError ? "text-red-500" : "text-green-500"}`}
                  >
                    ✓
                  </Text>
                  <Text className="text-xs text-gray-700">PDF format only (.pdf)</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text
                    className={`text-lg ${validationError ? "text-red-500" : "text-green-500"}`}
                  >
                    ✓
                  </Text>
                  <Text className="text-xs text-gray-700">
                    Maximum file size: {getMaxFileSizeDisplay()}
                  </Text>
                </View>
                {selectedFile && (
                  <View className="mt-3 space-y-1 border-t border-gray-200 pt-3">
                    <Text className="text-xs font-medium text-gray-800">Selected File Info:</Text>
                    <Text className="text-xs text-gray-600">📝 {selectedFile.name}</Text>
                    <Text className="text-xs text-gray-600">
                      💾 {formatFileSize(selectedFile.size)}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </Pressable>

      {/* Error Display */}
      {validationError && (
        <View className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
          <Text className="mb-1 text-sm font-semibold text-red-900">Validation Error</Text>
          <Text className="text-xs text-red-800">{validationError}</Text>
          {selectedFile && (
            <Pressable onPress={handleClearSelection} className="mt-3 self-start">
              <Text className="text-xs font-medium text-red-600 underline">Try another file</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Selected File Display */}
      {selectedFile && !validationError && (
        <View className="rounded-lg bg-green-50 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="mb-1 text-sm font-semibold text-green-900">Ready to Upload</Text>
              <Text className="text-xs text-green-700">{selectedFile.name}</Text>
              <Text className="text-xs text-green-600">{formatFileSize(selectedFile.size)}</Text>
            </View>
            <Text className="text-2xl">✅</Text>
          </View>
        </View>
      )}

      {/* Requirements Info */}
      <View className="rounded-lg bg-blue-50 p-4">
        <Text className="mb-2 text-xs font-semibold text-blue-900">Requirements</Text>
        <View className="space-y-1">
          <View className="flex-row gap-2">
            <Text className="text-xs text-blue-700">•</Text>
            <Text className="flex-1 text-xs text-blue-700">Only PDF files accepted</Text>
          </View>
          <View className="flex-row gap-2">
            <Text className="text-xs text-blue-700">•</Text>
            <Text className="flex-1 text-xs text-blue-700">
              File size must not exceed {getMaxFileSizeDisplay()}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Text className="text-xs text-blue-700">•</Text>
            <Text className="flex-1 text-xs text-blue-700">
              We automatically parse and extract your information
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
