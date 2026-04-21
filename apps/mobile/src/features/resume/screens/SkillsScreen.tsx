/**
 * Skills Screen - Step 4 of 4
 * Add skills using TagInput and review/submit resume
 */

import { View, ScrollView, Alert } from "react-native";
import { Text } from "@/components/Themed";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addSkill,
  removeSkill,
  selectSkills,
  previousStep,
  setLastSaved,
  setIsSaving,
  selectFormData,
} from "@/store/slices/resume.slice";
import { Button, Section, StepWizard, TagInput, ResumePreview } from "../components";
import { useUpdateResumeMutation } from "@/services/api";
import { useState } from "react";
import type { Skill } from "@app-powerup/shared";

export function SkillsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const skills = useAppSelector(selectSkills);
  const formData = useAppSelector(selectFormData);
  const [updateResume, { isLoading }] = useUpdateResumeMutation();
  const [showPreview, setShowPreview] = useState(false);

  const handleAddSkill = (skill: Skill) => {
    dispatch(addSkill(skill));
  };

  const handleRemoveSkill = (id: string) => {
    dispatch(removeSkill(id));
  };

  const handleSubmit = async () => {
    if (skills.length === 0) {
      Alert.alert("Validation Error", "Please add at least one skill");
      return;
    }

    try {
      dispatch(setIsSaving(true));

      // TODO: Get actual user ID from auth context
      const userId = "current-user-id";

      await updateResume({
        userId,
        data: formData,
      }).unwrap();

      dispatch(setLastSaved(new Date().toLocaleString()));

      Alert.alert("Success", "Resume saved successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.replace("two");
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save resume. Please try again.");
      console.error(error);
    } finally {
      dispatch(setIsSaving(false));
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900">Skills</Text>
        <Text className="mt-1 text-gray-600">Step 4 of 4 - Your technical expertise</Text>
      </View>

      {/* Content */}
      <View className="px-6 py-6">
        {!showPreview ? (
          <>
            <Section title="Add Your Skills" subtitle="What are you good at?">
              <TagInput
                label="Skills"
                value={skills}
                onAdd={handleAddSkill}
                onRemove={handleRemoveSkill}
                placeholder="e.g., React, Python, Project Management..."
              />
            </Section>

            {/* Skills Summary */}
            {skills.length > 0 && (
              <Section
                title="Summary"
                subtitle={`You've added ${skills.length} skill${skills.length !== 1 ? "s" : ""}`}
                className="border-l-4 border-green-500 bg-green-50"
              >
                <Text className="text-sm text-gray-700">
                  Your resume is now complete! Review it before submitting.
                </Text>
              </Section>
            )}

            {/* Navigation */}
            <StepWizard
              currentStep={4}
              totalSteps={4}
              onNextStep={handleSubmit}
              onPreviousStep={() => dispatch(previousStep())}
              isLoading={isLoading}
            />

            {/* Preview Button */}
            <Button
              variant="secondary"
              size="md"
              onPress={() => setShowPreview(true)}
              className="mt-4"
            >
              Preview Resume
            </Button>
          </>
        ) : (
          <>
            {/* Preview Mode */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">Resume Preview</Text>
              <Button variant="secondary" size="sm" onPress={() => setShowPreview(false)}>
                Edit
              </Button>
            </View>

            <ResumePreview data={formData} />

            {/* Submit Button */}
            <View className="gap-3 px-6 py-4">
              <Button size="lg" onPress={handleSubmit} isLoading={isLoading}>
                Save & Submit Resume
              </Button>
              <Button variant="secondary" size="lg" onPress={() => setShowPreview(false)}>
                Back to Edit
              </Button>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
