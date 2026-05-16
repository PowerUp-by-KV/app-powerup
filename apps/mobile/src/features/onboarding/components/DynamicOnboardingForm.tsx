import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { OnboardingQuestion } from "@/services/onboarding-api";
import * as DocumentPicker from "expo-document-picker";
import { Feather } from "@expo/vector-icons";
import { DatePicker } from "./DatePicker";
import { Dropdown } from "./Dropdown";

const COMMON_LANGUAGES = [
  "Hindi",
  "English",
  "Bengali",
  "Marathi",
  "Telugu",
  "Tamil",
  "Gujarati",
  "Urdu",
  "Kannada",
  "Odia",
  "Malayalam",
  "Punjabi",
  "Assamese",
  "Maithili",
  "Santali",
  "Kashmiri",
  "Nepali",
  "Konkani",
  "Sindhi",
  "Dogri",
  "Manipuri",
  "Bodo",
  "Sanskrit",
  "Others",
].map((lang) => ({ key: lang, label: lang }));

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

  const normalizeOptions = (
    options: string[] | Record<string, string> | null,
  ): [string, string][] => {
    if (!options) return [];
    if (Array.isArray(options)) {
      return options.map((opt) => [opt, opt]);
    }
    return Object.entries(options);
  };

  const renderInput = (question: OnboardingQuestion) => {
    const { question_key, input_type, options, question_text } = question;
    const value = formData[question_key];
    const normalizedOptions = normalizeOptions(options);

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
            className={`bg-slate-50 rounded-xl p-3.5 mb-4 border border-slate-200 text-slate-900 text-sm ${
              input_type === "textarea" ? "h-28 text-top" : ""
            }`}
            style={[input_type === "textarea" && { textAlignVertical: "top" }]}
            placeholderTextColor="#94A3B8"
          />
        );

      case "dropdown":
        const isLanguageQuestion = question_key.includes("language");
        const dropdownOptions =
          isLanguageQuestion && normalizedOptions.length === 0
            ? COMMON_LANGUAGES
            : normalizedOptions.map(([key, label]) => ({ key, label }));

        return (
          <Dropdown
            label={question_text}
            options={dropdownOptions}
            selectedValue={value}
            onSelect={(val) => onInputChange(question_key, val)}
            placeholder={`Select ${question_text.toLowerCase()}`}
          />
        );

      case "select":
      case "radio":
      case "multiple_choice":
        return (
          <View className="mt-1">
            {normalizedOptions.map(([optKey, optLabel]) => {
              const isSelected = value === optKey;
              return (
                <TouchableOpacity
                  key={optKey}
                  onPress={() => handleToggle(question_key, optKey, false)}
                  className="flex-row items-center py-2.5 mb-1"
                >
                  <View
                    className={`w-4 h-4 rounded-full border mr-3 items-center justify-center ${
                      isSelected
                        ? "border-slate-800 bg-slate-800"
                        : "border-slate-400 bg-transparent"
                    }`}
                  >
                    {isSelected && <View className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </View>
                  <Text
                    className={`text-sm ${
                      isSelected ? "font-bold text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {optLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case "multi-select":
      case "checkbox":
        return (
          <View className="mt-1">
            {normalizedOptions.map(([optKey, optLabel]) => {
              const isSelected = ((value as string[]) || []).includes(optKey);
              return (
                <TouchableOpacity
                  key={optKey}
                  onPress={() => handleToggle(question_key, optKey, true)}
                  className="flex-row items-center py-2.5 mb-1"
                >
                  <View
                    className={`w-4 h-4 rounded border mr-3 items-center justify-center ${
                      isSelected
                        ? "border-slate-800 bg-slate-800"
                        : "border-slate-400 bg-transparent"
                    }`}
                  >
                    {isSelected && <View className="w-2 h-2 bg-white rounded-xs" />}
                  </View>
                  <Text
                    className={`text-sm ${
                      isSelected ? "font-bold text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {optLabel}
                  </Text>
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
          <View className="w-full my-1">
            <TouchableOpacity
              onPress={async () => {
                try {
                  const res: any = await DocumentPicker.getDocumentAsync({
                    type: "application/pdf",
                  });
                  if (res.assets && res.assets.length > 0) {
                    const asset = res.assets[0];
                    const sizeMB = (asset.size || 0) / (1024 * 1024);

                    if (sizeMB > 2) {
                      Alert.alert("File too large", "Please upload a resume smaller than 2MB");
                      return;
                    }

                    onInputChange(question_key, asset.uri);
                    onInputChange(`${question_key}Name`, asset.name);
                  }
                } catch (err) {
                  // silently ignore file picker errors
                }
              }}
              className="bg-white border border-dashed border-slate-300 rounded-2xl py-8 px-4 items-center justify-center w-full"
            >
              {/* Circular Upload Icon */}
              <View className="w-14 h-14 rounded-full bg-slate-100 items-center justify-center mb-4">
                <Feather name="upload" size={22} color="#64748B" />
              </View>

              {/* Upload Text */}
              <Text className="text-slate-600 text-xs mb-4 text-center">
                {formData[`${question_key}Name`] ? (
                  <Text className="font-bold text-indigo-600">
                    {formData[`${question_key}Name`]}
                  </Text>
                ) : (
                  "Upload your resume here"
                )}
              </Text>

              {/* Browse Files Button */}
              <View className="bg-blue-600 rounded-xl px-6 py-2.5 flex-row items-center justify-center mb-5 shadow-sm">
                <Feather name="file" size={12} color="white" className="mr-2" />
                <Text className="text-white font-bold text-xs">
                  {formData[`${question_key}Name`] ? "Change File" : "Browse Files"}
                </Text>
              </View>

              {/* Supported Format Details */}
              <Text className="text-slate-400 text-[11px] text-center mb-1">
                Supported formats: PDF only
              </Text>
              <Text className="text-slate-400 text-[11px] text-center">Maximum file size: 2MB</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <TextInput
            placeholder={question_text}
            value={value || ""}
            onChangeText={(text) => onInputChange(question_key, text)}
            className="bg-slate-50 rounded-xl p-3.5 mb-4 border border-slate-200 text-slate-900 text-sm"
            placeholderTextColor="#94A3B8"
          />
        );
    }
  };

  return (
    <View>
      {questions.map((q) => (
        <View key={q.id}>
          {!hideLabel && q.question_text !== "" && (
            <Text className="text-slate-900 font-bold mb-3 text-sm">
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
