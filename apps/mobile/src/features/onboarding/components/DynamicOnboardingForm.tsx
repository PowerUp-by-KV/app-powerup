/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { OnboardingQuestion } from "@/services/onboarding-api";
import * as DocumentPicker from "expo-document-picker";
import { Feather } from "@expo/vector-icons";
import { DatePicker } from "./DatePicker";
import { Dropdown } from "./Dropdown";
import { showAlert } from "@/utils/alert";

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
            className={`bg-white dark:bg-slate-800/80 rounded-2xl p-4 mb-3 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white text-sm shadow-sm transition-all focus:border-blue-500 ${
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
          <View className="mt-2 w-full">
            {normalizedOptions.map(([optKey, optLabel]) => {
              const isSelected = value === optKey;
              return (
                <TouchableOpacity
                  key={optKey}
                  onPress={() => handleToggle(question_key, optKey, false)}
                  className={`flex-row items-center p-4 mb-3 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-[#3b82f6] bg-[#3b82f6]/10 shadow-sm"
                      : "border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1E1F2A]/90"
                  }`}
                  activeOpacity={0.8}
                >
                  <View
                    className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                      isSelected
                        ? "border-[#3b82f6] bg-[#3b82f6]"
                        : "border-slate-300 dark:border-slate-600 bg-transparent"
                    }`}
                  >
                    {isSelected && <View className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </View>
                  <Text
                    className={`text-[14px] leading-5 flex-1 ${
                      isSelected
                        ? "font-bold text-[#3b82f6]"
                        : "font-semibold text-slate-700 dark:text-slate-300"
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
          <View className="mt-2 w-full">
            {normalizedOptions.map(([optKey, optLabel]) => {
              const isSelected = ((value as string[]) || []).includes(optKey);
              return (
                <TouchableOpacity
                  key={optKey}
                  onPress={() => handleToggle(question_key, optKey, true)}
                  className={`flex-row items-center p-4 mb-3 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-[#3b82f6] bg-[#3b82f6]/10 shadow-sm"
                      : "border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1E1F2A]/90"
                  }`}
                  activeOpacity={0.8}
                >
                  <View
                    className={`w-5 h-5 rounded-md border-2 mr-3 items-center justify-center ${
                      isSelected
                        ? "border-[#3b82f6] bg-[#3b82f6]"
                        : "border-slate-300 dark:border-slate-600 bg-transparent"
                    }`}
                  >
                    {isSelected && <Feather name="check" size={10} color="white" />}
                  </View>
                  <Text
                    className={`text-[14px] leading-5 flex-1 ${
                      isSelected
                        ? "font-bold text-[#3b82f6]"
                        : "font-semibold text-slate-700 dark:text-slate-300"
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
          <View className="w-full my-2">
            <TouchableOpacity
              onPress={async () => {
                try {
                  // Match the backend: /onboarding/resume/extract accepts PDF only (415
                  // otherwise) and at most 2 MB (413). The picker used to allow Word files
                  // and 10 MB, so those uploads could only ever fail.
                  const res: any = await DocumentPicker.getDocumentAsync({
                    type: ["application/pdf"],
                    copyToCacheDirectory: true,
                  });
                  if (res.assets && res.assets.length > 0) {
                    const asset = res.assets[0];
                    const sizeMB = (asset.size || 0) / (1024 * 1024);

                    if (sizeMB > 2) {
                      showAlert("File too large", "Please upload a PDF resume smaller than 2 MB.");
                      return;
                    }

                    onInputChange(question_key, asset.uri);
                    onInputChange(`${question_key}Name`, asset.name);
                    onInputChange(`${question_key}Type`, asset.mimeType ?? "application/pdf");
                  }
                } catch {
                  // silently ignore file picker errors
                }
              }}
              className="w-full"
              activeOpacity={0.8}
            >
              <View
                pointerEvents="none"
                className="items-center justify-center w-full bg-white dark:bg-[#1E1F2A]/90 rounded-3xl py-14 px-8 border-2 border-dashed border-slate-200 dark:border-slate-700 shadow-sm"
              >
                {/* Circular Upload Icon */}
                <View className="w-20 h-20 rounded-full bg-slate-50 dark:bg-white items-center justify-center mb-6">
                  <Feather name="upload" size={28} color="#3b82f6" />
                </View>

                {/* Upload Title */}
                <Text className="text-slate-700 dark:text-slate-200 font-extrabold text-base mb-6 text-center px-4">
                  {formData[`${question_key}Name`] ? (
                    <Text className="font-black text-blue-600 dark:text-blue-400">
                      {formData[`${question_key}Name`]}
                    </Text>
                  ) : (
                    "Upload your resume here"
                  )}
                </Text>

                {/* Browse Files Button */}
                <View className="bg-[#3b82f6] rounded-2xl px-10 py-4 flex-row items-center justify-center mb-8 shadow-sm">
                  <Feather name="file" size={16} color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white font-extrabold text-sm">
                    {formData[`${question_key}Name`] ? "Change File" : "Browse Files"}
                  </Text>
                </View>

                {/* Supported Format Details */}
                <Text className="text-slate-400 font-semibold text-[12px] text-center mb-1.5">
                  Supported format: PDF
                </Text>
                <Text className="text-slate-400 font-semibold text-[12px] text-center">
                  Maximum file size 10MB
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <TextInput
            placeholder={question_text}
            value={value || ""}
            onChangeText={(text) => onInputChange(question_key, text)}
            className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3.5 mb-4 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white text-sm"
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
            <Text className="text-slate-900 dark:text-white font-bold mb-3 text-sm">
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
