import { View } from "react-native";
import { QuizEngine } from "./components/QuizEngine";
import { PAST_PERFECT_QUESTIONS } from "./constants/quiz-data";

export function PastPerfectQuizScreen() {
  return (
    <View className="flex-1 bg-white">
      <QuizEngine questions={PAST_PERFECT_QUESTIONS} />
    </View>
  );
}
