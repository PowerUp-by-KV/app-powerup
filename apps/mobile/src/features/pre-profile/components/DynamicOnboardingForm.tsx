import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { OnboardingQuestion } from "@/services/onboarding-api";
import * as DocumentPicker from "expo-document-picker";
import { DatePicker } from "./DatePicker";

interface Props {
  questions: OnboardingQuestion[];
  formData: Record<string, any>;
  onInputChange: (key: string, value: any) => void;
  hideLabel?: boolean;
}

export const DynamicOnboardingForm: React.FC<Props> = ({
  questions,
  formData,
  onInputChange,
  hideLabel,
}) => {
  const handleToggle = (key: string, value: string, isMulti: boolean) => {
    if (isMulti) {
      const currentValues = (formData[key] as string[]) || [];
      if (currentValues.includes(value)) {
        onInputChange(
          key,
          currentValues.filter((v) => v !== value),
        );
      } else {
        onInputChange(key, [...currentValues, value]);
      }
    } else {
      onInputChange(key, value);
    }
  };

  const renderInput = (question: OnboardingQuestion) => {
    const { question_key, input_type, options, question_text } = question;
    const value = formData[question_key];

    switch (input_type) {
      case "text":
      case "number":
      case "textarea":
        return (
          <TextInput
            placeholder={question_text}
            value={value || ""}
            onChangeText={(text) => onInputChange(question_key, text)}
            keyboardType={input_type === "number" ? "numeric" : "default"}
            multiline={input_type === "textarea"}
            numberOfLines={input_type === "textarea" ? 4 : 1}
            className={`bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100 ${
              input_type === "textarea" ? "h-32 text-top" : ""
            }`}
            style={[styles.input, input_type === "textarea" && { textAlignVertical: "top" }]}
          />
        );

      case "select":
      case "radio":
        return (
          <View className="mb-4">
            {Object.entries(options || {}).map(([optKey, optLabel]) => {
              const isSelected = value === optKey;
              return (
                <TouchableOpacity
                  key={optKey}
                  onPress={() => handleToggle(question_key, optKey, false)}
                  className={`px-4 py-3 rounded-2xl border mb-3 flex-row items-center justify-between ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-100"
                      : "bg-white border-slate-100"
                  }`}
                >
                  <Text
                    className={`${
                      isSelected ? "text-white" : "text-slate-700"
                    } font-semibold text-lg`}
                  >
                    {optLabel as string}
                  </Text>
                  {isSelected && (
                    <View className="w-5 h-5 rounded-full bg-white items-center justify-center">
                      <View className="w-2 h-2 rounded-full bg-indigo-600" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case "multi-select":
      case "checkbox":
        return (
          <View className="mb-4">
            {Object.entries(options || {}).map(([optKey, optLabel]) => {
              const isSelected = ((value as string[]) || []).includes(optKey);
              return (
                <TouchableOpacity
                  key={optKey}
                  onPress={() => handleToggle(question_key, optKey, true)}
                  className={`px-4 py-3 rounded-2xl border mb-3 flex-row items-center justify-between ${
                    isSelected ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-100"
                  }`}
                >
                  <Text
                    className={`${
                      isSelected ? "text-white" : "text-slate-700"
                    } font-semibold text-lg`}
                  >
                    {optLabel as string}
                  </Text>
                  <View
                    className={`w-5 h-5 rounded-md border ${
                      isSelected ? "bg-white border-white" : "bg-white border-slate-300"
                    } items-center justify-center`}
                  >
                    {isSelected && <View className="w-3 h-3 bg-indigo-600 rounded-sm" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case "date":
        return (
          <DatePicker
            date={value ? new Date(value) : new Date()}
            show={formData.showDatePicker === question_key}
            onDateChange={(event, date) => {
              onInputChange("showDatePicker", false);
              if (date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                onInputChange(question_key, `${year}-${month}-${day}`);
              }
            }}
            onPress={() => onInputChange("showDatePicker", question_key)}
            displayDate={value || ""}
          />
        );

      case "file":
        return (
          <TouchableOpacity
            onPress={async () => {
              try {
                const res: any = await DocumentPicker.getDocumentAsync({ type: "*/*" });
                if (res.assets && res.assets.length > 0) {
                  onInputChange(question_key, res.assets[0].uri);
                  onInputChange(`${question_key}Name`, res.assets[0].name);
                }
              } catch (err) {
                console.error(err);
              }
            }}
            className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 items-center justify-center"
          >
            <Text className="text-indigo-600 font-bold text-lg">
              {formData[`${question_key}Name`] || "Click to upload file"}
            </Text>
            <Text className="text-slate-400 mt-2">PDF, DOCX up to 5MB</Text>
          </TouchableOpacity>
        );

      default:
        return (
          <TextInput
            placeholder={question_text}
            value={value || ""}
            onChangeText={(text) => onInputChange(question_key, text)}
            className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100"
            style={styles.input}
          />
        );
    }
  };

  return (
    <View>
      {questions.map((q) => (
        <View key={q.id} className="mb-2">
          {!hideLabel && q.question_text !== "" && (
            <Text className="text-slate-700 font-semibold mb-2 px-1 text-lg">
              {q.question_text}
              {q.is_required && <Text className="text-red-500"> *</Text>}
            </Text>
          )}
          {renderInput(q)}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    color: "#1e293b",
  },
});
