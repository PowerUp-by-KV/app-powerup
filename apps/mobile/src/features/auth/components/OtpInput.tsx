import React, { useEffect, useRef, useState } from "react";
import { TextInput, View, Pressable, Text } from "react-native";

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
  const hiddenInputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (autoFocus && hiddenInputRef.current) {
      const t = setTimeout(() => hiddenInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (value.length === length) {
      onComplete?.(value);
    }
  }, [value, length, onComplete]);

  const handleChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    const next = digits.slice(0, length);
    onChange(next);
  };

  const handlePress = () => {
    hiddenInputRef.current?.focus();
  };

  return (
    <View>
      <TextInput
        ref={hiddenInputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          opacity: 0,
        }}
        caretHidden
      />
      <Pressable
        onPress={handlePress}
        className="flex-row"
        style={{ gap: 10, justifyContent: "center" }}
      >
        {Array.from({ length }, (_, i) => {
          const digit = value[i] || "";
          const isCurrent = value.length === i || (value.length === length && i === length - 1);
          const isActive = isFocused && isCurrent;

          return (
            <View
              key={i}
              style={{
                width: 48,
                height: 56,
                borderWidth: 1.5,
                borderColor: isActive ? "#4f46e5" : digit ? "#0f172a" : "#cbd5e1",
                borderRadius: 12,
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text className="text-2xl font-bold text-slate-900">{digit}</Text>
              {isActive && !digit && (
                <View
                  style={{
                    position: "absolute",
                    width: 2,
                    height: 24,
                    backgroundColor: "#4f46e5",
                    opacity: 0.5,
                  }}
                />
              )}
            </View>
          );
        })}
      </Pressable>
    </View>
  );
}
