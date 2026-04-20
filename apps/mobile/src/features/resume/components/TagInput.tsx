/**
 * TagInput Component - Chip-based input for skills
 * Add and remove skills as tags/chips
 */

import { View, TextInput, Pressable, FlatList } from "react-native";
import { Text } from "@/components/Themed";
import { useState } from "react";

interface Chip {
  id: string;
  name: string;
}

interface TagInputProps {
  value: Chip[];
  onAdd: (chip: Chip) => void;
  onRemove: (id: string) => void;
  placeholder?: string;
  label?: string;
}

export function TagInput({
  value,
  onAdd,
  onRemove,
  placeholder = "Type a skill and press Enter",
  label,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = () => {
    if (inputValue.trim()) {
      onAdd({
        id: Date.now().toString(),
        name: inputValue.trim(),
      });
      setInputValue("");
    }
  };

  return (
    <View className="mb-4">
      {label && <Text className="mb-2 text-sm font-semibold text-gray-900">{label}</Text>}

      {/* Input Field */}
      <View className="mb-3 flex-row items-center gap-2">
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleAddTag}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
          returnKeyType="done"
        />
        <Pressable
          onPress={handleAddTag}
          className="rounded-lg bg-blue-600 px-4 py-3"
          disabled={!inputValue.trim()}
        >
          <Text className="font-semibold text-white">Add</Text>
        </Pressable>
      </View>

      {/* Tags Display */}
      {value.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {value.map((chip) => (
            <View
              key={chip.id}
              className="flex-row items-center gap-2 rounded-full bg-blue-100 px-3 py-2"
            >
              <Text className="text-sm font-medium text-blue-900">{chip.name}</Text>
              <Pressable onPress={() => onRemove(chip.id)}>
                <Text className="text-base text-blue-600">✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Empty State */}
      {value.length === 0 && (
        <Text className="text-sm text-gray-500">
          No skills added yet. Add your skills using the input above.
        </Text>
      )}
    </View>
  );
}
