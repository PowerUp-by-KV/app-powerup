/**
 * Education Screen - Step 3 of 4
 * Manage education entries with dynamic list
 */

import { View, ScrollView, Modal, Pressable } from "react-native";
import { Text } from "@/components/Themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addEducation,
  updateEducation,
  removeEducation,
  selectEducation,
  nextStep,
  previousStep,
} from "@/store/slices/resume.slice";
import { Button, TextInput, Section, StepWizard, DynamicFieldList } from "../components";
import { useState } from "react";
import type { Education } from "@app-powerup/shared";

export function EducationScreen() {
  const dispatch = useAppDispatch();
  const education = useAppSelector(selectEducation);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Education>({
    id: "",
    school: "",
    degree: "",
    field: "",
    graduationDate: "",
    details: "",
  });

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      id: Date.now().toString(),
      school: "",
      degree: "",
      field: "",
      graduationDate: "",
      details: "",
    });
    setShowModal(true);
  };

  const handleEdit = (item: Education) => {
    setEditingId(item.id);
    setFormData(item);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.school.trim() || !formData.degree.trim()) {
      alert("Please fill in school and degree");
      return;
    }

    if (editingId) {
      dispatch(updateEducation(formData));
    } else {
      dispatch(addEducation(formData));
    }
    setShowModal(false);
  };

  const handleRemove = (id: string) => {
    dispatch(removeEducation(id));
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900">Education</Text>
        <Text className="mt-1 text-gray-600">Step 3 of 4 - Your academic background</Text>
      </View>

      {/* Content */}
      <View className="px-6 py-6">
        <Section title="Your Education">
          <DynamicFieldList
            items={education}
            onAdd={handleAddNew}
            onRemove={handleRemove}
            onEdit={handleEdit}
            addButtonLabel="Add Education"
            emptyMessage="No education added yet. Click 'Add' to add your education."
            renderItem={(item) => (
              <View>
                <Text className="font-bold text-gray-900">{item.degree}</Text>
                <Text className="text-sm text-gray-600">{item.school}</Text>
                <Text className="text-xs text-gray-500">{item.field}</Text>
              </View>
            )}
          />
        </Section>

        {/* StepWizard Navigation */}
        <StepWizard
          currentStep={3}
          totalSteps={4}
          onNextStep={() => dispatch(nextStep())}
          onPreviousStep={() => dispatch(previousStep())}
        />
      </View>

      {/* Education Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="absolute bottom-0 w-full rounded-t-3xl bg-white">
            <ScrollView className="px-6 py-6">
              {/* Header */}
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit Education" : "Add Education"}
                </Text>
                <Pressable onPress={() => setShowModal(false)}>
                  <Text className="text-2xl text-gray-600">✕</Text>
                </Pressable>
              </View>

              {/* Form */}
              <TextInput
                label="School/University"
                required
                placeholder="University of California"
                value={formData.school}
                onChangeText={(text) => setFormData({ ...formData, school: text })}
              />

              <TextInput
                label="Degree"
                required
                placeholder="Bachelor of Science"
                value={formData.degree}
                onChangeText={(text) => setFormData({ ...formData, degree: text })}
              />

              <TextInput
                label="Field of Study"
                placeholder="Computer Science"
                value={formData.field}
                onChangeText={(text) => setFormData({ ...formData, field: text })}
              />

              <TextInput
                label="Graduation Date"
                placeholder="May 2020"
                value={formData.graduationDate}
                onChangeText={(text) => setFormData({ ...formData, graduationDate: text })}
              />

              <TextInput
                label="Additional Details"
                multiline
                numberOfLines={3}
                placeholder="GPA, honors, relevant coursework, etc."
                value={formData.details}
                onChangeText={(text) => setFormData({ ...formData, details: text })}
              />

              {/* Actions */}
              <View className="mt-4 flex-row gap-3 pb-6">
                <View className="flex-1">
                  <Button variant="secondary" onPress={() => setShowModal(false)}>
                    Cancel
                  </Button>
                </View>
                <View className="flex-1">
                  <Button onPress={handleSave}>Save</Button>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
