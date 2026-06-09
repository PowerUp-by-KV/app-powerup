/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Props {
  date: Date;
  show: boolean;
  onDateChange: (event: any, selectedDate?: Date) => void;
  onPress: () => void;
  displayDate: string;
}

export const DatePicker: React.FC<Props> = ({ date, show, onDateChange, onPress, displayDate }) => {
  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex-row justify-between items-center"
      >
        <Text className={`text-lg ${displayDate ? "text-slate-900" : "text-slate-400"}`}>
          {displayDate || "YYYY-MM-DD"}
        </Text>
        <View className="bg-blue-50 p-2 rounded-lg">
          <Text className="text-blue-600 font-bold text-xs">SELECT</Text>
        </View>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </>
  );
};
