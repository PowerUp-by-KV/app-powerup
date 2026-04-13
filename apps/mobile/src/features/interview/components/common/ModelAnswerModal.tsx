/**
 * src/features/interview/components/common/ModelAnswerModal.tsx
 * Bottom-sheet modal with STAR model answer + key elements checklist.
 */

import React, { useEffect, useRef } from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity, Animated, Pressable } from "react-native";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ModelAnswerModalProps {
  visible: boolean;
  onClose: () => void;
}

// ── Static content ────────────────────────────────────────────────────────────

const STAR = [
  {
    label: "S",
    tag: "Situation",
    body: "Our team faced a 40% drop in deployment frequency due to a manual QA bottleneck requiring 3 days of regression testing per release.",
  },
  {
    label: "T",
    tag: "Task",
    body: "As lead engineer I was responsible for reducing release cycle time without sacrificing quality, targeting at least two deploys per week.",
  },
  {
    label: "A",
    tag: "Action",
    body: "I built a CI/CD pipeline with GitHub Actions covering 85% of critical paths and introduced feature flags to decouple deploy from release.",
  },
  {
    label: "R",
    tag: "Result",
    body: "Deployment frequency rose from fortnightly to 3× per week. Manual QA dropped 70% and we had zero critical regressions the following quarter.",
  },
];

const KEY_ELEMENTS = [
  "Specific situation with measurable context",
  "Clear ownership and personal responsibility",
  "Concrete action steps taken",
  "Quantified result (70% reduction, 3× frequency)",
];

// ── Component ─────────────────────────────────────────────────────────────────

export function ModelAnswerModal({ visible, onClose }: ModelAnswerModalProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, bounciness: 4, speed: 14, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 600, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, fade, slide]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.55)", opacity: fade }}
      >
        <Pressable className="absolute inset-0" onPress={onClose} />

        <Animated.View
          className="bg-white rounded-t-3xl overflow-hidden"
          style={{ transform: [{ translateY: slide }], maxHeight: "90%" }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
            <Text className="text-lg font-extrabold text-slate-900">Model Answer</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <Text className="text-slate-500 font-bold leading-none">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView
            className="px-5"
            // @ts-ignore: NativeWind v4 feature
            contentContainerClassName="pt-4 pb-4"
            showsVerticalScrollIndicator={false}
          >
            {STAR.map(({ label, tag, body }) => (
              <View key={tag} className="mb-5">
                <View className="flex-row items-center mb-2">
                  <View className="w-7 h-7 rounded-full bg-blue-600 items-center justify-center mr-2">
                    <Text className="text-white text-xs font-extrabold">{label}</Text>
                  </View>
                  <Text className="text-sm font-bold text-blue-600 uppercase tracking-wide">
                    {tag}
                  </Text>
                </View>
                <Text className="text-sm text-slate-600 leading-6">{body}</Text>
              </View>
            ))}

            <View className="h-px bg-slate-100 my-2" />

            <Text className="text-sm font-bold text-slate-800 mb-3 mt-2">Key Elements</Text>
            {KEY_ELEMENTS.map((el, i) => (
              <View key={i} className="flex-row items-start mb-2">
                <Text className="text-emerald-500 mr-2 text-sm leading-5">✓</Text>
                <Text className="flex-1 text-sm text-slate-600 leading-5">{el}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View className="px-5 pt-3 pb-8 border-t border-slate-100">
            <TouchableOpacity
              className="bg-blue-600 rounded-2xl py-4 items-center"
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text className="text-white font-bold text-base">Got It</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
