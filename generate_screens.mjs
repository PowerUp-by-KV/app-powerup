import fs from 'fs';
import path from 'path';

const basePath = path.join(process.cwd(), 'apps/mobile/src/features/quiz');
const appQuizPath = path.join(process.cwd(), 'apps/mobile/app/quiz');

if (!fs.existsSync(appQuizPath)) {
  fs.mkdirSync(appQuizPath, { recursive: true });
}

const screens = [
  { name: 'FuturePerfectQuiz', file: 'FuturePerfectQuizScreen' },
  { name: 'FutureSimpleQuiz', file: 'FutureSimpleQuizScreen' },
  { name: 'FutureTense', file: 'FutureTenseScreen' },
  { name: 'ModalVerbs', file: 'ModalVerbsScreen' },
  { name: 'PartsOfSpeech', file: 'PartsOfSpeechScreen' },
  { name: 'PastContinuousQuiz', file: 'PastContinuousQuizScreen' },
  { name: 'PastPerfectQuiz', file: 'PastPerfectQuizScreen' },
  { name: 'PastSimpleQuiz', file: 'PastSimpleQuizScreen' },
  { name: 'PastTense', file: 'PastTenseScreen' },
  { name: 'PhrasalVerb', file: 'PhrasalVerbScreen' },
  { name: 'PresentContinuousQuiz', file: 'PresentContinuousQuizScreen' },
  { name: 'PresentPerfectQuiz', file: 'PresentPerfectQuizScreen' },
  { name: 'PresentSimpleQuiz', file: 'PresentSimpleQuizScreen' },
  { name: 'PresentTense', file: 'PresentTenseScreen' },
  { name: 'Punctuation', file: 'PunctuationScreen' },
  { name: 'VoiceReported', file: 'VoiceReportedScreen' },
];

screens.forEach(s => {
  const content = [
    'import { View, Text } from "react-native";',
    '',
    'export function ' + s.file + '() {',
    '  return (',
    '    <View className="flex-1 items-center justify-center bg-white p-4">',
    '      <Text className="text-xl font-bold text-gray-900">' + s.name.replace(/([A-Z])/g, ' $1').trim() + '</Text>',
    '    </View>',
    '  );',
    '}',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(basePath, s.file + '.tsx'), content);
});

const allScreens = [
  ...screens,
  { name: 'Conditionals', file: 'ConditionalsScreen', route: 'conditionals' },
  { name: 'FutureContinuousQuiz', file: 'FutureContinuousQuizScreen', route: 'future-continuous-quiz' }
];

allScreens.forEach(s => {
  const routeName = s.route || s.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  
  const routeContent = [
    'import { ' + s.file + ' } from "@/features/quiz/' + s.file + '";',
    '',
    'export default function ' + s.file + 'Route() {',
    '  return <' + s.file + ' />;',
    '}',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(appQuizPath, routeName + '.tsx'), routeContent);
});

const exportsList = allScreens.map(s => 'export * from "./' + s.file + '";').join('\n');
fs.writeFileSync(path.join(basePath, 'index.ts'), exportsList);

// Implement QuizScreen.tsx
const quizScreenContent = `import { View, Text } from "react-native";

export function QuizScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Quiz Home</Text>
      <Text className="text-gray-600">Select a quiz feature from the menu to get started.</Text>
    </View>
  );
}
`;
fs.writeFileSync(path.join(basePath, 'QuizScreen.tsx'), quizScreenContent);

console.log('Scripts generated successfully with proper newlines!');
