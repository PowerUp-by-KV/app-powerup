import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  SafeAreaView,
} from "react-native";
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
  label,
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedOption = options.find((opt) => opt.key === selectedValue);

  return (
    <View className="mb-4">
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex-row justify-between items-center"
      >
        <Text className={`text-sm ${selectedOption ? "text-slate-900" : "text-slate-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color="#64748B" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-900">{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2">
                <Feather name="x" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center bg-slate-100 rounded-xl px-4 py-2 mb-6">
              <Feather name="search" size={18} color="#64748B" className="mr-2" />
              <TextInput
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 h-10 text-slate-900"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item.key);
                    setModalVisible(false);
                    setSearchQuery("");
                  }}
                  className={`py-4 border-b border-slate-50 flex-row justify-between items-center ${
                    selectedValue === item.key ? "bg-indigo-50/50 -mx-6 px-6" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selectedValue === item.key ? "text-indigo-600 font-bold" : "text-slate-700"
                    }`}
                  >
                    {item.label}
                  </Text>
                  {selectedValue === item.key && <Feather name="check" size={18} color="#4F46E5" />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="items-center mt-10">
                  <Text className="text-slate-400 italic">No results found</Text>
                </View>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};
