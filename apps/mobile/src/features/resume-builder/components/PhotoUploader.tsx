import React, { useState } from "react";
import {
  View,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { Text } from "@/components/Themed";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useUploadBuiltResumePhotoMutation } from "@/services/resume-builder-api";

interface PhotoUploaderProps {
  photoUrl?: string | null;
  onPhotoUploaded: (url: string, localUri: string | null) => void;
}

export function PhotoUploader({ photoUrl, onPhotoUploaded }: PhotoUploaderProps) {
  const [uploadPhoto, { isLoading }] = useUploadBuiltResumePhotoMutation();
  const [localPreview, setLocalPreview] = useState<string | null>(photoUrl || null);

  const handleSelectPhoto = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/png", "image/jpg"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      if (!asset) return;

      const fileSize = asset.size || 0;

      // Validate maximum file size (5MB)
      if (fileSize > 5 * 1024 * 1024) {
        Alert.alert("File Too Large", "Photo must not exceed 5MB in size.");
        return;
      }

      // Validate allowed image types
      const mime = asset.mimeType || "";
      const isImage =
        mime.includes("image/jpeg") ||
        mime.includes("image/png") ||
        mime.includes("image/jpg") ||
        asset.name.match(/\.(jpe?g|png)$/i);
      if (!isImage) {
        Alert.alert("Invalid File", "Only JPEG/PNG profile photos are supported.");
        return;
      }

      // Set local temporary preview
      setLocalPreview(asset.uri);

      // Construct upload multi-part body
      const formData = new FormData();
      if (Platform.OS === "web") {
        // Web Platform: fetch the file uri and transform to blob for append
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        formData.append("file", new File([blob], asset.name, { type: mime || "image/jpeg" }));
      } else {
        // Native Platforms (iOS / Android)
        formData.append("file", {
          uri: asset.uri,
          type: mime || "image/jpeg",
          name: asset.name || "photo.jpg",
        } as unknown as Blob);
      }

      const uploadResult = await uploadPhoto(formData).unwrap();
      if (uploadResult?.url) {
        onPhotoUploaded(uploadResult.url, asset.uri);
        // keep localPreview as asset.uri so it stays visible without hitting 403
      } else {
        throw new Error("Upload response did not contain image url");
      }
    } catch (error) {
      console.error("Profile photo upload failed:", error);
      Alert.alert("Upload Failed", "Failed to upload profile photo. Please try again.");
      setLocalPreview(photoUrl || null);
    }
  };

  const handleRemovePhoto = () => {
    setLocalPreview(null);
    onPhotoUploaded("", null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerBox}>
        {localPreview ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: localPreview }} style={styles.profileImage} />
            {isLoading && (
              <View style={styles.loaderBackdrop}>
                <ActivityIndicator size="small" color="white" />
              </View>
            )}
            <Pressable onPress={handleRemovePhoto} style={styles.removeBadge}>
              <Feather name="trash-2" size={14} color="white" />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={handleSelectPhoto} disabled={isLoading} style={styles.pickButton}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <>
                <Feather name="camera" size={24} color="#6b7280" />
                <Text style={styles.pickText}>Add Photo</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Profile Picture</Text>
        <Text style={styles.infoDesc}>JPEG or PNG. Max file size 5MB.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginVertical: 12,
  },
  pickerBox: {
    marginBottom: 16,
  },
  imageContainer: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "visible",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#2563eb",
  },
  loaderBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#ef4444",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  pickButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
  },
  pickText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 8,
  },
  infoBox: {
    alignItems: "center",
    width: "100%",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
});
