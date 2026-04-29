export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// GRAMMAR
export interface GrammarSubtopic {
  id: string;
  title: string;
  definition: string;
  rule: string;
  examples: string[];
  exercises: GrammarExercise[];
  progress?: number;
  difficulty?: string;
  time?: string;
}

export interface GrammarExercise {
  id: string;
  type: string;
  question: string;
  options: string[];
  answer?: string;
  correctAnswer: number;
  explanation: string;
}

export interface GrammarChapter {
  id: string;
  title: string;
  subtopics: GrammarSubtopic[];
  progress?: number;
}

export interface GrammarTopic {
  id: string;
  title: string;
  description?: string;
  chapters: GrammarChapter[];
  progress?: number;
}

export interface GrammarDefinition {
  topicId: string;
  definition: string;
  examples: string[];
}

export interface GrammarQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface GrammarSubmitRequest {
  topicId: string;
  answers: Record<string, string>;
}

// READING
export interface ReadingVocabulary {
  word: string;
  pos: string;
  pronunciation: string;
  meaning: string;
  example: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  paragraph: string; // Changed from content to match ReadingPracticeScreen usage
  questions: ReadingQuestion[];
  vocabulary: ReadingVocabulary[];
}

export interface ReadingQuestion {
  id: string;
  passageId: string;
  question: string;
  options: string[];
  answer: string;
}

export interface ReadingSubmitRequest {
  passageId: string;
  answers: Record<string, string>;
}

// LISTENING
export interface ListeningAudio {
  id: string;
  audioUrl: string;
  title: string;
  audio: unknown; // Resource reference
}

export interface ListeningAudioWithQuestions extends ListeningAudio {
  questions: ListeningQuestion[];
}

export interface ListeningQuestion {
  id: string;
  audioId: string;
  question: string;
  options: string[];
  answer: string;
}

export interface ListeningSubmitRequest {
  audioId: string;
  answers: Record<string, string>;
}

export interface SubmitResponse {
  score: number;
  feedback: string;
}

// PROGRESS
export interface ModuleProgress {
  name: string;
  percentage: number;
  status: "Mastery" | "In Progress" | "Done";
}

export interface ProgressSummary {
  userId: string;
  streak: number;
  overallPercentage: number;
  cefrLevel: string;
  modules: ModuleProgress[];
}

export interface HeatmapItem {
  name: string;
  percentage: number;
}

export interface HeatmapData {
  userId: string;
  strongAreas: HeatmapItem[];
  needsImprovement: HeatmapItem[];
}

export interface TrendPoint {
  date: string;
  score: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUri?: string;
  avatarIndex?: number;
  streak: number;
  xp: number;
  friendsCount: number;
  points: number;
  rank: number;
  completedLessons: number;
  cefrLevel: string;
}

export interface TrendData {
  userId: string;
  module: string;
  points: TrendPoint[];
  improvementText: string;
  nextGoal: string;
  nextGoalPercentage: number;
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  category: "Module Mastery" | "Streaks" | "Special";
  isLocked: boolean;
  description?: string;
}

export interface ReadingAnswer {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
}

// ACTIVITIES
export interface ActivityBase {
  id: string;
  type: "listening" | "reading" | "vocabulary" | "speaking" | "grammar" | "writing";
  scenario_name: string;
  status: "locked" | "unlocked" | "completed";
  time_limit?: number; // Time limit in seconds
}

export interface ActivityQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  instruction?: string;
  sentence?: string;
}

export interface ListeningActivityData extends ActivityBase {
  audio_url: string | number | null;
  audio_script: string | null;
  questions: ActivityQuestion[];
}

export interface ReadingActivityData extends ActivityBase {
  paragraph: string;
  questions: ActivityQuestion[];
  vocabulary?: ReadingVocabulary[];
}

export interface VocabularyActivityData extends ActivityBase {
  questions: ActivityQuestion[];
}

export interface SpeakingActivityData extends ActivityBase {
  questions: ActivityQuestion[];
}

export interface GrammarActivityData extends ActivityBase {
  questions: ActivityQuestion[];
}

export interface WritingActivityData extends ActivityBase {
  questions: ActivityQuestion[];
}
