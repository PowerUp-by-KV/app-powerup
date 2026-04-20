/**
 * Experience Screen - Step 2 of 4
 * Manage work experience entries with dynamic list
 */

import { View, ScrollView, Modal, Pressable } from "react-native";
import { Text } from "@/components/Themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addExperience,
  updateExperience,
  removeExperience,
  selectExperience,
  nextStep,
  previousStep,
} from "@/store/slices/resume.slice";
import { Button, TextInput, Section, StepWizard, DynamicFieldList } from "../components";
import { useState } from "react";
import type { Experience } from "@app-powerup/shared/types";

export function ExperienceScreen() {
  const dispatch = useAppDispatch();
  const experience = useAppSelector(selectExperience);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Experience>({
    id: "",
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
  });

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    });
    setShowModal(true);
  };

  const handleEdit = (item: Experience) => {
    setEditingId(item.id);
    setFormData(item);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.company.trim() || !formData.position.trim()) {
      alert("Please fill in company and position");
      return;
    }

    if (editingId) {
      dispatch(updateExperience(formData));
    } else {
      dispatch(addExperience(formData));
    }
    setShowModal(false);
  };

  const handleRemove = (id: string) => {
    dispatch(removeExperience(id));
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900">Work Experience</Text>
        <Text className="mt-1 text-gray-600">Step 2 of 4 - Your professional history</Text>
      </View>

      {/* Content */}
      <View className="px-6 py-6">
        <Section title="Your Work Experience">
          <DynamicFieldList
            items={experience}
            onAdd={handleAddNew}
            onRemove={handleRemove}
            onEdit={handleEdit}
            addButtonLabel="Add Experience"
            emptyMessage="No work experience added yet. Click 'Add' to add your first job."
            renderItem={(item) => (
              <View>
                <Text className="font-bold text-gray-900">{item.position}</Text>
                <Text className="text-sm text-gray-600">{item.company}</Text>
                <Text className="text-xs text-gray-500">
                  {item.startDate}
                  {item.endDate ? ` - ${item.endDate}` : " - Present"}
                </Text>
              </View>
            )}
          />
        </Section>

        {/* StepWizard Navigation */}
        <StepWizard
          currentStep={2}
          totalSteps={4}
          onNextStep={() => dispatch(nextStep())}
          onPreviousStep={() => dispatch(previousStep())}
        />
      </View>

      {/* Experience Modal */}
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
                  {editingId ? "Edit Experience" : "Add Experience"}
                </Text>
                <Pressable onPress={() => setShowModal(false)}>
                  <Text className="text-2xl text-gray-600">✕</Text>
                </Pressable>
              </View>

              {/* Form */}
              <TextInput
                label="Company Name"
                required
                placeholder="Acme Corporation"
                value={formData.company}
                onChangeText={(text) => setFormData({ ...formData, company: text })}
              />

              <TextInput
                label="Position/Job Title"
                required
                placeholder="Senior Software Engineer"
                value={formData.position}
                onChangeText={(text) => setFormData({ ...formData, position: text })}
              />

              <TextInput
                label="Start Date"
                placeholder="Jan 2020"
                value={formData.startDate}
                onChangeText={(text) => setFormData({ ...formData, startDate: text })}
              />

              <View className="mb-4 flex-row items-center gap-3">
                <Pressable
                  onPress={() =>
                    setFormData({
                      ...formData,
                      currentlyWorking: !formData.currentlyWorking,
                    })
                  }
                  className={`h-6 w-6 rounded border-2 items-center justify-center ${
                    formData.currentlyWorking ? "border-blue-600 bg-blue-600" : "border-gray-300"
                  }`}
                >
                  {formData.currentlyWorking && <Text className="text-white">✓</Text>}
                </Pressable>
                <Text className="text-gray-900">Currently working here</Text>
              </View>

              {!formData.currentlyWorking && (
                <TextInput
                  label="End Date"
                  placeholder="Dec 2021"
                  value={formData.endDate}
                  onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                />
              )}

              <TextInput
                label="Description"
                multiline
                rows={4}
                placeholder="Describe your key responsibilities and achievements..."
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
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
