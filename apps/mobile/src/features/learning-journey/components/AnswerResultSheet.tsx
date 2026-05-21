import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface AnswerResultSheetProps {
  visible: boolean;
  isCorrect: boolean;
  correctSentence?: string;
  onContinue: () => void;
  onDismiss: () => void;
}

export function AnswerResultSheet({
  visible,
  isCorrect,
  correctSentence,
  onContinue,
  onDismiss,
}: AnswerResultSheetProps) {
  const bg = isCorrect ? "#0f172a" : "#7f1d1d";
  const accent = isCorrect ? "#22c55e" : "#ef4444";
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onDismiss}>
      <View className="flex-1 justify-end">
        <View
          style={{ backgroundColor: bg, paddingTop: 14, paddingHorizontal: 24, paddingBottom: 16 }}
        >
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: accent }}
              >
                <Feather name={isCorrect ? "check" : "x"} size={18} color="#fff" />
              </View>
              <Text className="text-white text-lg font-extrabold">
                {isCorrect ? "Correct!" : "Wrong!"}
              </Text>
            </View>
            <Pressable onPress={onDismiss}>
              <Feather name="x" size={20} color="#94a3b8" />
            </Pressable>
          </View>
          {!isCorrect && correctSentence && (
            <View className="mb-3">
              <Text className="text-slate-300 text-xs font-semibold">Correct answer:</Text>
              <Text className="text-white text-sm font-bold mt-0.5">{correctSentence}</Text>
            </View>
          )}
          <Pressable
            onPress={onContinue}
            className="bg-white rounded-xl py-2.5 items-center active:opacity-80"
          >
            <Text className="text-slate-900 font-extrabold text-sm">
              {isCorrect ? "Continue" : "OK"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
