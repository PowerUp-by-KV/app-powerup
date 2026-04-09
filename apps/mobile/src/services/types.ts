export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// STREAK
export interface StreakData {
  userId: string;
  currentStreak: number;
  lastUpdated: string;
}

// GRAMMAR
export interface GrammarTopic {
  id: string;
  title: string;
  description: string;
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
export interface ReadingPassage {
  id: string;
  title: string;
  content: string;
}

export interface ReadingQuestion {
  id: string;
  passageId: string;
  question: string;
  options: string[];
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
}

export interface ListeningQuestion {
  id: string;
  audioId: string;
  question: string;
  options: string[];
}

export interface ListeningSubmitRequest {
  audioId: string;
  answers: Record<string, string>;
}

// BEHAVIOR
export interface BehaviorQuestion {
  id: string;
  text: string;
  type: string;
}

export interface BehaviorTrackRequest {
  userId: string;
  activityType: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface BehaviorReport {
  userId: string;
  score: number;
  traits: string[];
  recommendations: string[];
}

// VERBAL
export interface VerbalQuestion {
  id: string;
  prompt: string;
}

export interface VerbalDefinition {
  questionId: string;
  term: string;
  meaning: string;
}

export interface VerbalSubmitRequest {
  questionId: string;
  audioUri: string;
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
