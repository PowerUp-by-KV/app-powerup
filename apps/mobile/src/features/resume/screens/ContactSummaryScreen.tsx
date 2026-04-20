/**
 * Contact & Summary Screen - Step 1 of 4
 * Collect personal contact information and professional summary
 */

import { View, ScrollView } from "react-native";
import { Text } from "@/components/Themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateContact,
  updateSummary,
  selectContact,
  selectSummary,
  nextStep,
  previousStep,
  setError,
} from "@/store/slices/resume.slice";
import { Button, TextInput, Section, StepWizard } from "../components";
import { useState } from "react";

export function ContactSummaryScreen() {
  const dispatch = useAppDispatch();
  const contact = useAppSelector(selectContact);
  const summary = useAppSelector(selectSummary);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!contact.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!contact.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!contact.phone.trim()) {
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

  const handlePrevious = () => {
    dispatch(previousStep());
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900">Contact Information</Text>
        <Text className="mt-1 text-gray-600">Step 1 of 4 - Let's start with your details</Text>
      </View>

      {/* Form Content */}
      <View className="px-6 py-6">
        <Section title="Personal Details" subtitle="Required information for your resume">
          {/* Full Name */}
          <TextInput
            label="Full Name"
            required
            placeholder="John Doe"
            value={contact.fullName}
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
            value={contact.email}
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
            value={contact.phone}
            onChangeText={(text) => {
              dispatch(updateContact({ phone: text }));
              if (errors.phone) setErrors({ ...errors, phone: "" });
            }}
            error={errors.phone}
          />
        </Section>

        {/* Optional Details */}
        <Section title="Optional Details" subtitle="Make your profile stand out">
          {/* LinkedIn */}
          <TextInput
            label="LinkedIn URL"
            keyboardType="url"
            placeholder="https://linkedin.com/in/johndoe"
            value={contact.linkedin}
            onChangeText={(text) => dispatch(updateContact({ linkedin: text }))}
          />

          {/* Location */}
          <TextInput
            label="Location"
            placeholder="New York, USA"
            value={contact.location}
            onChangeText={(text) => dispatch(updateContact({ location: text }))}
          />
        </Section>

        {/* Professional Summary */}
        <Section
          title="Professional Summary"
          subtitle="A brief overview of your skills and experience"
        >
          <TextInput
            label="Summary"
            multiline
            rows={4}
            placeholder="Write a brief summary of your professional background and key achievements..."
            value={summary.text}
            onChangeText={(text) => dispatch(updateSummary(text))}
          />
        </Section>

        {/* StepWizard Navigation */}
        <StepWizard
          currentStep={1}
          totalSteps={4}
          onNextStep={handleNext}
          onPreviousStep={handlePrevious}
        />
      </View>
    </ScrollView>
  );
}
