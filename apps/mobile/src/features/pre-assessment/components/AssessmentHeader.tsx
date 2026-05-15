import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

export type SectionCode =
  | "A_READING"
  | "A_SPEAKING"
  | "A_LISTEN"
  | "B_SPEAKING"
  | "C_GRAMMAR"
  | "D_LISTEN_ANSWER";

const SECTION_LABELS: Record<SectionCode, string> = {
  A_READING: "Reading Skills",
  A_SPEAKING: "Speaking Skills",
  A_LISTEN: "Listening Comprehension",
  B_SPEAKING: "Expressive Speaking",
  C_GRAMMAR: "Grammar & Language Usage",
  D_LISTEN_ANSWER: "Listen & Answer",
};

const SECTION_ORDER: SectionCode[] = [
  "A_READING",
  "A_SPEAKING",
  "A_LISTEN",
  "B_SPEAKING",
  "C_GRAMMAR",
  "D_LISTEN_ANSWER",
];

interface AssessmentHeaderProps {
  section: SectionCode;
  currentQuestionIndex: number;
  totalQuestions: number;
  startedAtMs: number;
  onFinish: () => void;
  onSectionChange?: (next: SectionCode) => void;
}

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function AssessmentHeader({
  section,
  currentQuestionIndex,
  totalQuestions,
  startedAtMs,
  onFinish,
  onSectionChange,
}: AssessmentHeaderProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = useMemo(
    () => formatElapsed(Math.max(0, nowMs - startedAtMs)),
    [nowMs, startedAtMs],
  );
  const progressPct =
    totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;
  const sectionLetter = section.startsWith("A_")
    ? "A"
    : section.startsWith("B_")
      ? "B"
      : section.startsWith("C_")
        ? "C"
        : "D";

  return (
    <View className="px-4 pt-4 pb-3 bg-white border-b border-slate-100">
      <View className="flex-row items-center justify-between mb-3">
        <View className="bg-slate-100 rounded-full px-3 py-1.5">
          <Text className="text-slate-700 text-xs font-semibold">Test Time: {elapsed}</Text>
        </View>
        <Pressable
          onPress={onFinish}
          className="bg-slate-900 rounded-full px-3 py-1.5 active:opacity-85"
        >
          <Text className="text-white text-xs font-bold">Finish Test</Text>
        </Pressable>
      </View>

      <View className="flex-row items-center justify-between mb-2">
        <View className="bg-slate-100 rounded-full px-3 py-1.5">
          <Text className="text-slate-700 text-xs font-semibold">Section {sectionLetter}</Text>
        </View>
        <Pressable
          onPress={() => setDropdownOpen(true)}
          className="bg-slate-100 rounded-full px-3 py-1.5 flex-row items-center active:opacity-85"
        >
          <Text className="text-slate-700 text-xs font-semibold mr-1">
            {SECTION_LABELS[section]}
          </Text>
          <Feather name="chevron-down" size={14} color="#475569" />
        </Pressable>
      </View>

      <View className="flex-row items-center" style={{ gap: 10 }}>
        <View className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <View className="h-full bg-slate-900" style={{ width: `${progressPct}%` }} />
        </View>
        <Text className="text-slate-500 text-xs font-semibold">
          {currentQuestionIndex + 1}/{totalQuestions}
        </Text>
      </View>

      <Modal
        transparent
        visible={dropdownOpen}
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <Pressable onPress={() => setDropdownOpen(false)} className="flex-1 bg-black/30">
          <View
            className="absolute top-32 right-4 bg-white rounded-2xl p-2"
            style={{ minWidth: 220 }}
          >
            {SECTION_ORDER.map((code) => {
              const isCurrent = code === section;
              return (
                <Pressable
                  key={code}
                  onPress={() => {
                    setDropdownOpen(false);
                    if (!isCurrent) onSectionChange?.(code);
                  }}
                  className={`px-3 py-2.5 rounded-xl ${isCurrent ? "bg-slate-100" : ""}`}
                >
                  <Text
                    className={`text-sm ${isCurrent ? "text-slate-900 font-bold" : "text-slate-700"}`}
                  >
                    {SECTION_LABELS[code]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export { SECTION_LABELS, SECTION_ORDER };
