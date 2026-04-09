import { View } from "react-native";
import { QuizEngine } from "./components/QuizEngine";
import { CONDITIONALS_QUESTIONS } from "./constants/quiz-data";

export function ConditionalsScreen() {
  return (
    <View className="flex-1 bg-white">
      <QuizEngine questions={CONDITIONALS_QUESTIONS} />
    </View>
  );
}
