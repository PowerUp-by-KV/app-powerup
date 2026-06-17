import React, { useEffect, useMemo } from "react";
import { TextInput, View } from "react-native";

interface OtpInputProps {
  length?: 4 | 6;
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  autoFocus = true,
}: OtpInputProps) {
  const inputs = useMemo(
    () => Array.from({ length }, () => React.createRef<TextInput>()),
    [length],
  );
  const firstRef = inputs[0];

  useEffect(() => {
    if (autoFocus && firstRef?.current) {
      const t = setTimeout(() => firstRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [autoFocus, firstRef]);

  useEffect(() => {
    if (value.length === length) onComplete?.(value);
  }, [value, length, onComplete]);

  const setCharAt = (idx: number, text: string) => {
    const digits = text.replace(/[^0-9]/g, "");

    if (digits.length > 1) {
      // Handle paste
      const arr = (value || "").split("");
      for (let i = 0; i < digits.length && idx + i < length; i++) {
        arr[idx + i] = digits[i] || "";
      }
      const next = arr.join("").slice(0, length);
      onChange(next);

      // Focus the last filled input or the next available one
      const nextFocusIdx = Math.min(idx + digits.length, length - 1);
      inputs[nextFocusIdx]?.current?.focus();
      return;
    }

    // Normal single-character entry
    const digit = digits.slice(0, 1);
    const arr = (value || "").split("");
    arr[idx] = digit;
    const next = arr.join("").slice(0, length);
    onChange(next);
    if (digit && idx < length - 1) inputs[idx + 1]?.current?.focus();
  };

  const handleKey = (idx: number, key: string) => {
    if (key === "Backspace" && !value[idx] && idx > 0) {
      inputs[idx - 1]?.current?.focus();
    }
  };

  return (
    <View className="flex-row" style={{ gap: 10, justifyContent: "center" }}>
      {Array.from({ length }, (_, i) => (
        <TextInput
          key={i}
          ref={inputs[i]}
          value={value[i] ?? ""}
          onChangeText={(t) => setCharAt(i, t)}
          onKeyPress={({ nativeEvent }) => handleKey(i, nativeEvent.key)}
          keyboardType="number-pad"
          maxLength={length}
          textContentType="oneTimeCode"
          className="text-center text-2xl font-bold text-slate-900"
          style={{
            width: 48,
            height: 56,
            borderWidth: 1.5,
            borderColor: value[i] ? "#0f172a" : "#cbd5e1",
            borderRadius: 12,
            backgroundColor: "#fff",
          }}
        />
      ))}
    </View>
  );
}
