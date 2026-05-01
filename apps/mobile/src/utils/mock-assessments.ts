import type { ReadingAssessment } from "@/features/pre-reading";
import type { SpeakingReadAssessment } from "@/features/pre-speaking-read";
import type { ListenWithAudioAssessment } from "@/features/pre-listen-with-audio";
import type { SpeakingAssessment } from "@/features/pre-speaking";
import type { GrammarAssessment } from "@/features/pre-grammar";
import type { ListeningAssessment } from "@/features/pre-listening";

export const mockReadingAssessment: ReadingAssessment = {
  id: "reading-001",
  title: "English Reading Assessment",
  description: "Test your reading comprehension skills with passages",
  totalQuestions: 2,
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
    {
      section: "Section A",
      subSection: "Reading",
      topic: "Environmental Science",
      paragraph:
        "Climate change poses one of the most significant challenges to humanity today. Rising global temperatures are causing melting ice caps, rising sea levels, and increasing frequency of extreme weather events. Scientists worldwide are calling for immediate action to reduce carbon emissions and transition to renewable energy sources.",
      questionType: "MCQ",
      question: "According to the passage, what is one consequence of climate change?",
      complexity: "Easy",
      options: {
        option1: "Increased ice formation",
        option2: "Lower sea levels",
        option3: "Melting ice caps and rising sea levels",
        option4: "Reduced weather events",
      },
      answer: "Melting ice caps and rising sea levels",
    },
  ],
};

export const mockSpeakingReadAssessment: SpeakingReadAssessment = {
  id: "speaking-read-001",
  title: "English Speaking - Read the Sentences",
  description: "Read sentences aloud and record your voice",
  totalQuestions: 1,
  passingScore: 70,
  questions: [
    {
      section: "Section A",
      subSection: "Speaking - Read the Sentences",
      questionNo: 1,
      sentence: "The children played in the park while their parents watched from a bench nearby.",
      noOfLines: 1,
      complexity: "Easy",
      answerType: "Record Voice",
      recordingTime: 15,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockListenWithAudioAssessment: ListenWithAudioAssessment = {
  id: "listen-with-audio-001",
  title: "English Listening Assessment - Listen & Repeat",
  description: "Listen to audio passages and repeat what you hear",
  totalQuestions: 1,
  passingScore: 70,
  questions: [
    {
      section: "Section A",
      subSection: "Listen to Audio & Speak / Repeat",
      questionNo: 1,
      audioText:
        "The sun rose slowly over the hills, painting the sky in shades of orange and gold.",
      audioDuration: 5,
      noOfLines: 1,
      complexity: "Easy",
      answerType: "Record Voice",
      recordingTime: 15,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockSpeakingAssessment: SpeakingAssessment = {
  id: "speaking-001",
  title: "English Speaking Assessment - Describing Topics",
  description: "Describe your favorite topics and express your opinions",
  totalQuestions: 1,
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
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockGrammarAssessment: GrammarAssessment = {
  id: "grammar-001",
  title: "English Grammar Assessment",
  description: "Test your knowledge of English grammar rules",
  totalQuestions: 1,
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
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockListeningAssessment: ListeningAssessment = {
  id: "listening-001",
  title: "English Listening Assessment",
  description: "Listen to audio passages and repeat what you hear",
  totalQuestions: 1,
  passingScore: 70,
  questions: [
    {
      section: "Section A",
      subSection: "Listen to Audio & Speak / Repeat",
      questionNo: 1,
      audioText:
        "The sun rose slowly over the hills, painting the sky in shades of orange and gold.",
      audioDuration: 5,
      noOfLines: 1,
      complexity: "Easy",
      answerType: "Record Voice",
      recordingTime: 15,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
