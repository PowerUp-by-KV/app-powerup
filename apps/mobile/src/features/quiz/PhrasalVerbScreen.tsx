import { View } from "react-native";
import { QuizEngine } from "./components/QuizEngine";
import { PHRASAL_VERBS_QUESTIONS } from "./constants/quiz-data";

export function PhrasalVerbScreen() {
  return (
    <View className="flex-1 bg-white">
      <QuizEngine questions={PHRASAL_VERBS_QUESTIONS} />
    </View>
  );
}
