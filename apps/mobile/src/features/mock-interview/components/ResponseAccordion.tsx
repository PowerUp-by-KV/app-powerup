import { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import type { InterviewResultAnswer } from "@/services/mock-interview-api";

export interface ResponseAccordionProps {
  index: number;
  answer: InterviewResultAnswer;
}

function ScoreBadge({ score }: { score: number | null }) {
  return (
    <View className="bg-blue-100 rounded-full px-3 py-0.5 mr-3">
      <Text className="text-xs font-semibold text-blue-600">
        {score !== null ? score.toFixed(2) : "—"}/10
      </Text>
    </View>
  );
}

export function ResponseAccordion({ index, answer }: ResponseAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const criteriaScores = answer.score_breakdown?.criteria_scores ?? [];

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
          Question {answer.question_order}
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

          {criteriaScores.length > 0 && (
            <View className="mt-3 flex-row gap-x-3">
              {criteriaScores.slice(0, 3).map((c) => (
                <View key={c.name} className="flex-1">
                  <Text className="text-xs text-gray-400 mb-1" numberOfLines={1}>
                    {c.name}
                  </Text>
                  <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${Math.min((c.score / 10) * 100, 100)}%` }}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}
