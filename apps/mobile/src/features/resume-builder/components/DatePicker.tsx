import React, { useState } from "react";
import { View, Pressable, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { TextInput } from "@/features/resume/components/TextInput";

interface DatePickerProps {
  label: string;
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  required,
  error,
  placeholder = "Select Date",
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const getDateValue = () => {
    if (value) {
      const parts = value.split("-");
      const part0 = parts[0];
      const part1 = parts[1];
      const part2 = parts[2];
      if (part0 && part1 && part2) {
        const year = parseInt(part0, 10);
        const month = parseInt(part1, 10) - 1;
        const day = parseInt(part2, 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return new Date(year, month, day);
        }
      }
    }
    return new Date();
  };

  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChange(formatDateString(selectedDate));
    }
  };

  return (
    <View>
      <Pressable onPress={() => setShowPicker(true)}>
        <View pointerEvents="none">
          <TextInput
            label={label}
            required={required}
            placeholder={placeholder}
            value={value}
            editable={false}
            error={error}
          />
        </View>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={getDateValue()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}
