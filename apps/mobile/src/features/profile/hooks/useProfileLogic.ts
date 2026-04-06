import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "@/features/profile/hooks/UserContext";

export const useProfileLogic = () => {
  const { user, updateProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedAvatarUri, setEditedAvatarUri] = useState(user.avatarUri);
  const [editedAvatarIndex, setEditedAvatarIndex] = useState(user.avatarIndex || 0);

  // Sync edits when entering edit mode or when user changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditedName(user.name);
      setEditedAvatarUri(user.avatarUri);
      setEditedAvatarIndex(user.avatarIndex || 0);
    }
  }, [user, isEditing]);

  const pickImage = async () => {
    // Request permission (mostly for mobile, web works directly)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Denied", "Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setEditedAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (editedName.trim() === "") {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    // Update Global Context
    updateProfile({
      name: editedName,
      avatarUri: editedAvatarUri,
      avatarIndex: editedAvatarIndex,
    });

    setIsEditing(false);
    Alert.alert("Success", "Profile updated globally!");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const toggleAvatar = () => {
    // If they already picked a photo, maybe reset it or cycle?
    // Let's keep cycling if they don't have a URI, or offer both.
    setEditedAvatarIndex((prev) => (prev + 1) % 5);
    setEditedAvatarUri(undefined); // Clear URI if they cycle standard avatars
  };

  const logout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => router.replace("/") },
    ]);
  };

  return {
    user: isEditing
      ? { ...user, name: editedName, avatarUri: editedAvatarUri, avatarIndex: editedAvatarIndex }
      : user,
    isEditing,
    setIsEditing,
    editedName,
    setEditedName,
    handleSave,
    handleCancel,
    handleStartEditing,
    avatarIndex: editedAvatarIndex,
    toggleAvatar,
    pickImage,
    logout,
  };
};
