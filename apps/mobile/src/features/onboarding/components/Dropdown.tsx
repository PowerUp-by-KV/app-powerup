import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";

interface Option {
  key: string;
  label: string;
}

interface DropdownProps {
  label: string;
  options: Option[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedOption = options.find((opt) => opt.key === selectedValue);

  return (
    <View className="mb-4 relative z-50">
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
        className={`rounded-xl p-3.5 border flex-row justify-between items-center transition-all ${
          isOpen
            ? "border-blue-500 bg-white dark:bg-slate-800"
            : "border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/80"
        }`}
      >
        <Text
          className={`text-sm ${selectedOption ? "text-slate-900 dark:text-white font-semibold" : "text-slate-400 dark:text-slate-500"}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={isOpen ? "#3b82f6" : "#64748B"}
        />
      </TouchableOpacity>

      {/* Expanded Inline Container */}
      {isOpen && (
        <View className="mt-1.5 bg-white dark:bg-[#1E1F2A] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg shadow-slate-100/50 dark:shadow-none overflow-hidden">
          {/* Compact Inline Search Bar — shown only when list is long */}
          {options.length > 5 && (
            <View className="flex-row items-center bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 px-3 py-1.5">
              <Feather name="search" size={14} color="#64748B" className="mr-1.5" />
              <TextInput
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 h-7 text-xs text-slate-900 dark:text-white"
                placeholderTextColor="#94A3B8"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")} className="p-1">
                  <Feather name="x" size={12} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Options List with constrained height */}
          <ScrollView
            style={{ maxHeight: 180 }}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {filteredOptions.length === 0 ? (
              <View className="py-4 items-center justify-center">
                <Text className="text-xs text-slate-400 italic">No results found</Text>
              </View>
            ) : (
              filteredOptions.map((item) => {
                const isSelected = selectedValue === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => {
                      onSelect(item.key);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    activeOpacity={0.7}
                    className={`py-3 px-4 border-b border-slate-50 dark:border-slate-700/50 flex-row justify-between items-center last:border-b-0 ${
                      isSelected
                        ? "bg-blue-50/50 dark:bg-blue-900/30"
                        : "active:bg-slate-50 dark:active:bg-slate-800/50"
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        isSelected
                          ? "text-blue-600 dark:text-blue-400 font-bold"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {item.label}
                    </Text>
                    {isSelected && <Feather name="check" size={16} color="#3b82f6" />}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};
