import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, View, useColorScheme } from "react-native";

import { registerAlertHost, type AlertButton, type AlertState } from "@/utils/alert";

/**
 * Renders alerts raised by `showAlert()` on the web build, where React Native's own
 * Alert is a no-op. Mount once, at the root. On native this renders nothing — the
 * platform dialog is used instead.
 */
export function AlertHost() {
  const [alert, setAlert] = useState<AlertState | null>(null);
  const isDark = useColorScheme() === "dark";

  useEffect(() => registerAlertHost(setAlert), []);

  if (!alert) return null;

  const dismiss = (button?: AlertButton) => {
    setAlert(null);
    button?.onPress?.();
  };

  // A cancel button, or the sole button, is what a backdrop tap resolves to.
  const cancelButton =
    alert.buttons.find((b) => b.style === "cancel") ??
    (alert.buttons.length === 1 ? alert.buttons[0] : undefined);

  const buttonColor = (button: AlertButton) => {
    if (button.style === "destructive") return "text-red-600";
    if (button.style === "cancel") return isDark ? "text-slate-400" : "text-slate-500";
    return "text-blue-600";
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => dismiss(cancelButton)}>
      <Pressable
        onPress={() => cancelButton && dismiss(cancelButton)}
        className="flex-1 items-center justify-center bg-black/40 p-6"
      >
        {/* Stop taps inside the card from closing it. */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className={`w-full max-w-sm rounded-2xl p-5 ${isDark ? "bg-[#1E1F2A]" : "bg-white"}`}
        >
          <Text
            className={`text-lg font-extrabold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {alert.title}
          </Text>

          {!!alert.message && (
            <Text
              className={`text-sm leading-5 mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              {alert.message}
            </Text>
          )}

          <View className="flex-row justify-end flex-wrap gap-2 mt-5">
            {alert.buttons.map((button) => (
              <Pressable
                key={button.text}
                onPress={() => dismiss(button)}
                className="px-4 py-2.5 rounded-xl active:opacity-60"
              >
                <Text className={`font-bold text-sm ${buttonColor(button)}`}>{button.text}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
