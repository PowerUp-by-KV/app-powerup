import { GrammerScreen, type GrammarAssessment } from "./index";

const exampleAssessment: GrammarAssessment = {
  id: "grammar-001",
  title: "English Grammar Assessment",
  description: "Test your knowledge of English grammar rules",
  totalQuestions: 8,
  passingScore: 70,
  questions: [
    {
      section: "Section C",
      subSection: "Grammar",
      topic: "Verbs",
      questionType: "MCQ",
      question: "The dog _____ in the park every morning.",
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
    {
      section: "Section C",
      subSection: "Grammar",
      topic: "Tense",
      questionType: "Fill in the Blanks",
      blanks: 1,
      question: "By the time you arrive, I _____ the dinner.",
      complexity: "Medium",
      answerType: "Fill in the Blanks",
      correctAnswer: "will have prepared",
    },
    {
      section: "Section C",
      subSection: "Grammar",
      topic: "Articles",
      questionType: "MCQ",
      question: "She is _____ engineer and he is _____ architect.",
      complexity: "Easy",
      answerType: "MCQ",
      options: {
        option1: "a, an",
        option2: "an, a",
        option3: "the, the",
        option4: "a, a",
      },
      correctAnswer: "an, a",
    },
    {
      section: "Section C",
      subSection: "Grammar",
      topic: "Prepositions",
      questionType: "Fill in the Blanks",
      blanks: 1,
      question: "The book is _____ the table.",
      complexity: "Easy",
      answerType: "Fill in the Blanks",
      correctAnswer: "on",
    },
    {
      section: "Section C",
      subSection: "Grammar",
      topic: "Active into Passive voice",
      questionType: "MCQ",
      question: 'Convert to passive: "They completed the project yesterday."',
      complexity: "Medium",
      answerType: "MCQ",
      options: {
        option1: "The project was completed by them yesterday.",
        option2: "The project is completed by them yesterday.",
        option3: "The project will be completed by them yesterday.",
        option4: "The project has been completed by them yesterday.",
      },
      correctAnswer: "The project was completed by them yesterday.",
    },
    {
      section: "Section C",
      subSection: "Grammar",
      topic: "Verbs",
      questionType: "MCQ",
      question:
        "Identify the error: One of the students have submitted their project before the deadline.",
      complexity: "Advanced",
      answerType: "MCQ",
      options: {
        option1: "have should be has",
        option2: "submitted should be submit",
        option3: "before should be during",
        option4: "No error",
      },
      correctAnswer: "have should be has",
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function PreGrammarExampleUsage() {
  return <GrammerScreen assessment={exampleAssessment} />;
}
