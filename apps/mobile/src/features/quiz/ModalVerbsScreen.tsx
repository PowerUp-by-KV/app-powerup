import { View } from "react-native";
import { QuizEngine } from "./components/QuizEngine";
import { MODAL_VERBS_QUESTIONS } from "./constants/quiz-data";

export function ModalVerbsScreen() {
  return (
    <View className="flex-1 bg-white">
      <QuizEngine questions={MODAL_VERBS_QUESTIONS} />
    </View>
  );
}
