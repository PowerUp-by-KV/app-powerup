import { SpeakingScreen, type SpeakingAssessment } from "./index";

const exampleAssessment: SpeakingAssessment = {
  id: "speaking-001",
  title: "English Speaking Assessment - Describing Topics",
  description: "Describe your favorite topics and express your opinions",
  totalQuestions: 4,
  passingScore: 70,
  questions: [
    {
      section: "Section B",
      subSection: "Speaking",
      topic: "Pets",
      questionType: "Describing Topic Question",
      question: "Describe your favourite animal and explain why you like it.",
      complexity: "Easy",
      answerType: "Record Voice",
      recordingTime: 40,
    },
    {
      section: "Section B",
      subSection: "Speaking",
      topic: "Weather",
      questionType: "Describing Topic Question",
      question:
        "How does the weather in your city affect the way people live and go about their daily activities?",
      complexity: "Medium",
      answerType: "Record Voice",
      recordingTime: 40,
    },
    {
      section: "Section B",
      subSection: "Speaking",
      topic: "Festivals",
      questionType: "Describing Topic Question",
      question:
        "Why are festivals important to a community, and how do they bring people together?",
      complexity: "Medium",
      answerType: "Record Voice",
      recordingTime: 40,
    },
    {
      section: "Section B",
      subSection: "Speaking",
      topic: "Role Models",
      questionType: "Describing Topic Question",
      question:
        "What qualities should a role model have, and how can the influence of a role model shape the choices a young person makes in life?",
      complexity: "Advanced",
      answerType: "Record Voice",
      recordingTime: 40,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function PreSpeakingExampleUsage() {
  return <SpeakingScreen assessment={exampleAssessment} />;
}
