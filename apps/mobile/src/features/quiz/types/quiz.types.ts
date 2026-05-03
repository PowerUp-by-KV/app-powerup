export interface QuizQuestion {
  id: string;
  sentence: string; // Should include "__" for the blank
  options: string[];
  answer: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}
