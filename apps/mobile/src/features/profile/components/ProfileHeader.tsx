import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Image } from "react-native";
import { ArrowLeft, X, Check, Edit3, Camera, User, RefreshCw } from "lucide-react-native";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const AVATAR_COLORS = ["#6366F1", "#EC4899", "#F59E0B", "#10B981", "#8B5CF6"];

export const ProfileHeader = ({
  user,
  isEditing,
  editedName,
  setEditedName,
  handleCancel,
  handleSave,
  handleStartEditing,
  toggleAvatar,
  pickImage,
}) => {
  const avatarBg = AVATAR_COLORS[user.avatarIndex || 0];

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} style={styles.backgroundGradient} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{isEditing ? "Edit Profile" : "Profile"}</Text>

        {isEditing ? (
          <TouchableOpacity style={[styles.iconButton, styles.saveButton]} onPress={handleSave}>
            <Check size={22} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.iconButton} onPress={handleStartEditing}>
            <Edit3 size={20} color="#6366F1" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={isEditing ? pickImage : handleStartEditing}
            style={styles.avatarWrapper}
          >
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: user.avatarUri ? "#F1F5F9" : avatarBg },
              ]}
            >
              {user.avatarUri ? (
                <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
              ) : (
                <User size={60} color="#FFF" opacity={0.9} />
              )}

              {isEditing && (
                <View style={styles.cameraOverlay}>
                  <Camera size={24} color="#FFF" />
                </View>
              )}
            </View>

            {isEditing && (
              <View style={styles.editControls}>
                <TouchableOpacity style={styles.miniAction} onPress={pickImage}>
                  <Camera size={14} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.miniAction, { backgroundColor: "#8B5CF6" }]}
                  onPress={toggleAvatar}
                >
                  <RefreshCw size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}

            {isEditing && !user.avatarUri && (
              <View style={styles.changeBadge}>
                <Text style={styles.changeText}>Choose Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          {isEditing ? (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.nameInput}
                value={editedName}
                onChangeText={setEditedName}
                autoFocus
                placeholder="Your Name"
                placeholderTextColor="#94A3B8"
              />
            </View>
          ) : (
            <TouchableOpacity onPress={handleStartEditing} activeOpacity={0.7}>
              <Text style={styles.userName}>{user.name}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.userEmail}>{user.email || "alex.j@example.com"}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "ios" ? 0 : 20,
    paddingBottom: 20,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: -20,
    right: -20,
    height: 300,
    opacity: 0.5,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 18,
    color: "#1E293B",
    ...FONTS.bold,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: "#6366F1",
  },
  content: {
    alignItems: "center",
  },
  avatarSection: {
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarCircle: {
    width: 130,
    height: 130,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: "#FFF",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  editControls: {
    position: "absolute",
    bottom: -15,
    right: -10,
    flexDirection: "column",
    gap: 8,
  },
  miniAction: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    elevation: 5,
  },
  changeBadge: {
    position: "absolute",
    bottom: -10,
    alignSelf: "center",
    backgroundColor: "#F59E0B",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  changeText: {
    color: "#FFF",
    fontSize: 10,
    ...FONTS.bold,
  },
  infoSection: {
    alignItems: "center",
  },
  userName: {
    fontSize: 26,
    color: "#1E293B",
    ...FONTS.bold,
  },
  userEmail: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    ...FONTS.medium,
  },
  inputWrapper: {
    borderBottomWidth: 2,
    borderBottomColor: "#6366F1",
    width: 250,
    alignItems: "center",
    paddingBottom: 4,
  },
  nameInput: {
    fontSize: 24,
    color: "#1E293B",
    ...FONTS.bold,
    textAlign: "center",
  },
});
