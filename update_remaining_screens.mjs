import fs from 'fs';
import path from 'path';

const quizDir = path.join(process.cwd(), 'apps/mobile/src/features/quiz');
const files = fs.readdirSync(quizDir).filter(f => f.endsWith('.tsx') && f !== 'QuizScreen.tsx' && f !== 'index.ts');

const done = [
  'ConditionalsScreen.tsx',
  'PresentSimpleQuizScreen.tsx',
  'PastPerfectQuizScreen.tsx',
  'ModalVerbsScreen.tsx',
  'PhrasalVerbScreen.tsx'
];

files.forEach(file => {
  if (done.includes(file)) return;

  const componentName = file.replace('.tsx', '');
  const content = \`import { View } from "react-native";
import { QuizEngine } from "./components/QuizEngine";
import { PLACEHOLDER_QUESTIONS } from "./constants/quiz-data";

export function \${componentName}() {
  return (
    <View className="flex-1 bg-white">
      <QuizEngine questions={PLACEHOLDER_QUESTIONS} />
    </View>
  );
}
\`;
  fs.writeFileSync(path.join(quizDir, file), content);
  console.log('Updated ' + file);
});
