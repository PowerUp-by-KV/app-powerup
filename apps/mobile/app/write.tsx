import { GrammerScreen, type GrammarAssessment } from "@/features/pre-grammar";

const exampleAssessment: GrammarAssessment = {
  id: "grammar-001",
  title: "English Grammar Assessment",
  description: "Test your grammar knowledge",
  totalQuestions: 4,
  passingScore: 70,
  questions: [
    {
      section: "Section C",
      subSection: "Grammar",
      topic: "Verbs",
      questionType: "MCQ",
      question: "The dog _____ in the park.",
      complexity: "Easy",
      answerType: "MCQ",
      options: {
        option1: "run",
        option2: "runs",
        option3: "running",
        option4: "ran",
      },
      correctAnswer: "runs",
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function WriteRoute() {
  return <GrammerScreen assessment={exampleAssessment} />;
}
