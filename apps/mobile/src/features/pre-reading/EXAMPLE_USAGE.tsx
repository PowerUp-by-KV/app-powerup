import { ReadingScreen, type ReadingAssessment } from "./index";

const exampleAssessment: ReadingAssessment = {
  id: "reading-001",
  title: "English Reading Assessment",
  description: "Test your reading comprehension skills with passages",
  totalQuestions: 4,
  timeLimit: 20,
  passingScore: 70,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  questions: [
    {
      section: "Section A",
      subSection: "Reading",
      topic: "General Knowledge",
      paragraph:
        "The internet has revolutionized education by providing access to vast amounts of information, enabling online learning, and fostering global collaboration among students and educators.",
      questionType: "MCQ",
      question: "What is the main benefit of the internet for education mentioned in the passage?",
      complexity: "Easy",
      options: {
        option1: "Makes books obsolete",
        option2: "Provides access to information and enables online learning",
        option3: "Reduces teaching costs",
        option4: "Eliminates schools",
      },
      answer: "Provides access to information and enables online learning",
    },
  ],
};

export function ExampleReadingScreen() {
  return <ReadingScreen assessment={exampleAssessment} />;
}
