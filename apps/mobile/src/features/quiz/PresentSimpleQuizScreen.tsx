import { View } from "react-native";
import { QuizEngine } from "./components/QuizEngine";
import { PRESENT_SIMPLE_QUESTIONS } from "./constants/quiz-data";

export function PresentSimpleQuizScreen() {
  return (
    <View className="flex-1 bg-white">
      <QuizEngine questions={PRESENT_SIMPLE_QUESTIONS} />
    </View>
  );
}
