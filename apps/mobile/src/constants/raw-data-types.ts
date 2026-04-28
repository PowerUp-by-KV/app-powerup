export interface RawListeningData {
  id: string;
  title: string;
  audio: number | string;
  transcript: string;
  questions: {
    question: string;
    options: string[];
    answer: string;
  }[];
}

export interface RawReadingData {
  id: string;
  title: string;
  paragraph: string;
  vocabulary: {
    word: string;
    meaning: string;
    pos: string;
    pronunciation: string;
    example: string;
  }[];
  questions: {
    id: string;
    question: string;
    options: string[];
    answer: string;
    difficulty: string;
  }[];
}

export interface RawGrammarData {
  id: string;
  scenario_name: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    answer: string;
  }[];
}

export interface RawVocabularyData {
  id: string;
  scenario_name: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    answer: string;
  }[];
}

export interface RawSpeakingData {
  id: string;
  scenario_name: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    answer: string;
  }[];
}

export interface RawWritingData {
  id: string;
  scenario_name: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    answer: string;
  }[];
}
