/**
 * Contact & Summary Screen - Step 1 of 4
 * Collect personal contact information and professional summary
 */

import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { Text } from "@/components/Themed";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateContact,
  updateSummary,
  selectContact,
  selectSummary,
  nextStep,
} from "@/store/slices/resume.slice";
import { TextInput } from "../components";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

export function ContactSummaryScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const contact = useAppSelector(selectContact);
  const summary = useAppSelector(selectSummary);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!contact?.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!contact?.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!contact?.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      dispatch(nextStep());
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        {/* Header with Progress */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.stepNumber}>Step 1 of 4</Text>
            <Text style={styles.headerTitle}>Contact & Summary</Text>
            <Text style={styles.headerSubtitle}>Let's start with your personal details</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "25%" }]} />
          </View>
        </View>

        {/* Form Sections */}
        <View style={styles.formContainer}>
          {/* Personal Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={24} color="#2563EB" style={{ marginRight: 10 }} />
              <Text style={styles.sectionTitle}>Personal Details</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Required information for your resume</Text>

            {/* Full Name */}
            <TextInput
              label="Full Name"
              required
              placeholder="John Doe"
              value={contact?.fullName || ""}
              onChangeText={(text) => {
                dispatch(updateContact({ fullName: text }));
                if (errors.fullName) setErrors({ ...errors, fullName: "" });
              }}
              error={errors.fullName}
            />

            {/* Email */}
            <TextInput
              label="Email"
              required
              keyboardType="email-address"
              placeholder="john@example.com"
              value={contact?.email || ""}
              onChangeText={(text) => {
                dispatch(updateContact({ email: text }));
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              error={errors.email}
            />

            {/* Phone */}
            <TextInput
              label="Phone"
              required
              keyboardType="phone-pad"
              placeholder="+1 (555) 000-0000"
              value={contact?.phone || ""}
              onChangeText={(text) => {
                dispatch(updateContact({ phone: text }));
                if (errors.phone) setErrors({ ...errors, phone: "" });
              }}
              error={errors.phone}
            />
          </View>

          {/* Optional Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="link" size={24} color="#2563EB" style={{ marginRight: 10 }} />
              <Text style={styles.sectionTitle}>Optional Details</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Make your profile stand out</Text>

            {/* LinkedIn */}
            <TextInput
              label="LinkedIn URL"
              keyboardType="url"
              placeholder="https://linkedin.com/in/johndoe"
              value={contact?.linkedin || ""}
              onChangeText={(text) => dispatch(updateContact({ linkedin: text }))}
            />

            {/* Location */}
            <TextInput
              label="Location"
              placeholder="New York, USA"
              value={contact?.location || ""}
              onChangeText={(text) => dispatch(updateContact({ location: text }))}
            />
          </View>

          {/* Professional Summary Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="description"
                size={24}
                color="#2563EB"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.sectionTitle}>Professional Summary</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              A brief overview of your skills and experience
            </Text>

            <TextInput
              label="Summary"
              multiline
              numberOfLines={4}
              placeholder="Write a brief summary of your professional background..."
              value={summary?.text || ""}
              onChangeText={(text) => dispatch(updateSummary(text))}
            />
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleBack}
            >
              <MaterialIcons name="arrow-back" size={20} color="#2563EB" />
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  contentContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 0,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
    marginLeft: 34,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  secondaryButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
  },
});
