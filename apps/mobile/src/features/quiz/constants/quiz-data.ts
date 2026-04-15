import { QuizQuestion } from "../types/quiz.types";

export const CONDITIONALS_QUESTIONS: QuizQuestion[] = [
  {
    id: "1",
    sentence: "If I __ rich, I would travel the world.",
    options: ["am", "was", "were", "be"],
    answer: "were",
  },
  {
    id: "2",
    sentence: "If it rains, we __ the match.",
    options: ["cancel", "will cancel", "canceled", "would cancel"],
    answer: "will cancel",
  },
  {
    id: "3",
    sentence: "I would have passed if I __ harder.",
    options: ["study", "studied", "had studied", "have studied"],
    answer: "had studied",
  },
];

export const PRESENT_SIMPLE_QUESTIONS: QuizQuestion[] = [
  {
    id: "1",
    sentence: "She __ to school every day.",
    options: ["go", "goes", "going", "gone"],
    answer: "goes",
  },
  {
    id: "2",
    sentence: "They __ not like coffee.",
    options: ["do", "does", "did", "done"],
    answer: "do",
  },
  {
    id: "3",
    sentence: "The sun __ in the east.",
    options: ["rise", "rises", "rising", "rose"],
    answer: "rises",
  },
];

export const PAST_PERFECT_QUESTIONS: QuizQuestion[] = [
  {
    id: "1",
    sentence: "The train __ already left when I reached the station.",
    options: ["has", "have", "had", "was"],
    answer: "had",
  },
  {
    id: "2",
    sentence: "I __ never seen such a beautiful sight before.",
    options: ["has", "have", "had", "was"],
    answer: "had",
  },
];

export const MODAL_VERBS_QUESTIONS: QuizQuestion[] = [
  {
    id: "1",
    sentence: "You __ follow the rules.",
    options: ["must", "can", "might", "may"],
    answer: "must",
  },
  {
    id: "2",
    sentence: "I __ swim when I was five.",
    options: ["can", "could", "should", "must"],
    answer: "could",
  },
];

export const PHRASAL_VERBS_QUESTIONS: QuizQuestion[] = [
  {
    id: "1",
    sentence: "Please __ the light before you leave.",
    options: ["turn off", "turn on", "turn up", "turn down"],
    answer: "turn off",
  },
  {
    id: "2",
    sentence: "The plane will __ in ten minutes.",
    options: ["take off", "take on", "take in", "take out"],
    answer: "take off",
  },
];

export const PLACEHOLDER_QUESTIONS: QuizQuestion[] = [
  {
    id: "1",
    sentence: "This is a placeholder question for __ category.",
    options: ["this", "that", "it", "them"],
    answer: "this",
  },
  {
    id: "2",
    sentence: "Good luck with your __!",
    options: ["practice", "studying", "learning", "exam"],
    answer: "practice",
  },
];
