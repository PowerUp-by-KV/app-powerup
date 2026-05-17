import React, { useEffect, useState } from "react";
import { Pressable, Text } from "react-native";

interface OtpResendTimerProps {
  initialSeconds?: number;
  onResend: () => void;
}

export function OtpResendTimer({ initialSeconds = 45, onResend }: OtpResendTimerProps) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  if (remaining > 0) {
    return (
      <Text className="text-slate-500 text-sm text-center">
        Didn&apos;t receive code? Resend in 00:{remaining.toString().padStart(2, "0")}
      </Text>
    );
  }
  return (
    <Pressable
      onPress={() => {
        setRemaining(initialSeconds);
        onResend();
      }}
    >
      <Text className="text-indigo-600 text-sm text-center font-semibold">Resend code</Text>
    </Pressable>
  );
}
