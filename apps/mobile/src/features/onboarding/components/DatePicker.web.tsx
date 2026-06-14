/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface Props {
  date: Date;
  show: boolean;
  onDateChange: (event: any, selectedDate?: Date) => void;
  onPress: () => void;
  displayDate: string;
}

export const DatePicker: React.FC<Props> = ({ displayDate, onDateChange }) => {
  return (
    <input
      type="date"
      value={displayDate}
      onChange={(e) => {
        const val = e.target.value;
        if (val) {
          onDateChange({}, new Date(val));
        }
      }}
      style={{
        backgroundColor: "#f8fafc",
        borderRadius: "1rem",
        padding: "1rem",
        border: "1px solid #f1f5f9",
        fontSize: "1.125rem",
        color: "#0f172a",
        width: "100%",
        marginTop: "0.5rem",
        fontFamily: "inherit",
        outline: "none",
      }}
    />
  );
};
