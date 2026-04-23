import { View } from "react-native";
import { QuizEngine } from "./components/QuizEngine";
import { PLACEHOLDER_QUESTIONS } from "./constants/quiz-data";

export function PunctuationScreen() {
  return (
    <View className="flex-1 bg-white">
      <QuizEngine questions={PLACEHOLDER_QUESTIONS} />
    </View>
  );
}
