import { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import type { InterviewResultAnswer } from "@/services/mock-interview-api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ResponseAccordionProps {
  index: number; // 0-based — displayed as Q{index + 1}
  answer: InterviewResultAnswer;
}

// ---------------------------------------------------------------------------
// Sub-component: ScoreBadge
// ---------------------------------------------------------------------------

function ScoreBadge({ score }: { score: number }) {
  return (
    <View className="bg-blue-100 rounded-full px-3 py-0.5 mr-3">
      <Text className="text-xs font-semibold text-blue-600">{score.toFixed(2)}/10</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// Local open/close state is justified — purely presentational accordion UI,
// never shared across screens and resets on unmount.
// ---------------------------------------------------------------------------

export function ResponseAccordion({ index, answer }: ResponseAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <Pressable
      onPress={toggle}
      className="bg-white rounded-2xl px-4 py-4 mb-3"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Row header */}
      <View className="flex-row items-center">
        <Text className="text-xs font-bold text-gray-400 w-7">Q{index + 1}</Text>
        <ScoreBadge score={answer.score} />
        <Text
          className="flex-1 text-sm text-gray-800 font-medium"
          numberOfLines={isOpen ? undefined : 2}
        >
          {answer.question_text}
        </Text>
        <Text className="text-gray-300 text-base ml-2">{isOpen ? "∧" : "∨"}</Text>
      </View>

      {/* Expanded content */}
      {isOpen && (
        <View className="mt-4 pt-4 border-t border-gray-100">
          {answer.transcript ? (
            <View className="mb-3">
              <Text className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                Your Answer
              </Text>
              <Text className="text-sm text-gray-700 leading-5">{answer.transcript}</Text>
            </View>
          ) : null}

          <View>
            <Text className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
              Feedback
            </Text>
            <Text className="text-sm text-gray-700 leading-5">{answer.feedback}</Text>
          </View>

          {/* Criteria mini-bars */}
          <View className="mt-3 flex-row gap-x-3">
            {[
              { label: "Clarity", val: answer.criteria_breakdown?.clarity },
              { label: "Relevance", val: answer.criteria_breakdown?.relevance },
              {
                label: "Confidence",
                val: answer.criteria_breakdown?.confidence,
              },
            ].map(({ label, val }) =>
              val !== undefined ? (
                <View key={label} className="flex-1">
                  <Text className="text-xs text-gray-400 mb-1">{label}</Text>
                  <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-blue-400 rounded-full"
                      style={{
                        width: `${Math.min((val / 10) * 100, 100)}%`,
                      }}
                    />
                  </View>
                </View>
              ) : null,
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}
