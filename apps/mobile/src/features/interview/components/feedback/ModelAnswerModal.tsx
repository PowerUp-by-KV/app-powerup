/**
 * src/features/interview/components/feedback/ModelAnswerModal.tsx
 *
 * Purely presentational bottom-sheet modal.
 * All answer extraction logic lives in utils/resolve-model-answer.ts.
 * Styled exclusively with NativeWind className.
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { resolveModelAnswer } from "../../utils/resolve-model-answer";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ModelAnswerModalProps {
  visible: boolean;
  /** Full question-feedback API response. Answer extraction happens internally. */
  feedback: Record<string, unknown> | null;
  onClose: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const KEY_ELEMENTS = [
  "Specific situation described",
  "Clear action taken",
  "Quantified result included",
  "Professional resolution",
] as const;

const SCREEN_H = Dimensions.get("window").height;
const SHEET_MAX = SCREEN_H * 0.88;
const BOTTOM_PAD = Platform.OS === "ios" ? 34 : 20;

// ── Component ─────────────────────────────────────────────────────────────────

export const ModelAnswerModal: React.FC<ModelAnswerModalProps> = ({
  visible,
  feedback,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SCREEN_H,
      speed: visible ? 10 : 20,
      bounciness: visible ? 4 : 0,
      useNativeDriver: false,
    }).start();
  }, [visible, slideAnim]);

  // ── Single call to utility — no extraction logic here ────────────────────
  const answerText = resolveModelAnswer(feedback);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      {/* Backdrop */}
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
        <TouchableOpacity className="flex-1" onPress={onClose} activeOpacity={1} />

        {/* Sheet */}
        <Animated.View
          className="bg-white rounded-t-3xl"
          style={{
            transform: [{ translateY: slideAnim }],
            maxHeight: SHEET_MAX,
            paddingBottom: BOTTOM_PAD,
          }}
        >
          {/* Drag handle */}
          <View className="w-10 h-1 rounded-full bg-slate-200 self-center mt-2.5 mb-1" />

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <View className="flex-row items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <View className="w-8" />
            <Text className="flex-1 text-center text-base font-bold text-slate-900">
              Model Answer
            </Text>
            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              onPress={onClose}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <MaterialCommunityIcons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* ── Scrollable body ──────────────────────────────────────────────── */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Section 1 — Answer */}
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">
              A strong response would be:
            </Text>
            <View className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <Text className="text-sm text-slate-800 leading-6">{answerText}</Text>
            </View>

            {/* Section 2 — Key elements */}
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-5 mb-2.5">
              Key Elements
            </Text>
            <View className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {KEY_ELEMENTS.map((item, i) => (
                <React.Fragment key={item}>
                  <View className="flex-row items-center px-3.5 py-3">
                    <View className="w-5 h-5 rounded-full bg-emerald-100 items-center justify-center mr-2.5">
                      <MaterialCommunityIcons name="check" size={12} color="#16A34A" />
                    </View>
                    <Text className="flex-1 text-sm font-medium text-slate-700">{item}</Text>
                  </View>
                  {i < KEY_ELEMENTS.length - 1 && <View className="border-b border-slate-100" />}
                </React.Fragment>
              ))}
            </View>

            <View className="h-4" />
          </ScrollView>

          {/* ── Footer ──────────────────────────────────────────────────────── */}
          <View className="px-5 pt-3 border-t border-slate-100">
            <TouchableOpacity
              className="h-13 rounded-2xl bg-blue-600 items-center justify-center"
              onPress={onClose}
              activeOpacity={0.85}
              style={{
                shadowColor: "#2563EB",
                shadowOpacity: 0.28,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
            >
              <Text className="text-base font-bold text-white tracking-wide">Got It</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
