import {
  ListeningActivityData,
  ReadingActivityData,
  VocabularyActivityData,
  SpeakingActivityData,
  GrammarActivityData,
  WritingActivityData,
} from "@/services/types";
import { listeningData } from "./listeningData";
import { grammarData } from "./grammarData";
import { readingData } from "./readingData";
import { speakingData } from "./speakingData";
import { vocabularyData } from "./vocabularyData";
import { writingData } from "./writingData";

export type AnyActivityData =
  | ListeningActivityData
  | ReadingActivityData
  | VocabularyActivityData
  | SpeakingActivityData
  | GrammarActivityData
  | WritingActivityData;

export interface Module {
  module_id: string;
  module_no: number;
  name: string;
  description: string;
  status: "locked" | "in_progress" | "completed";
  total_days: number;
  days_completed: number;
  progress_percentage: number;
}

export const MOCK_MODULES: Module[] = [
  {
    module_id: "m1",
    module_no: 1,
    name: "Pre Assesment",
    description: "Master the fundamentals",
    status: "completed",
    total_days: 12,
    days_completed: 12,
    progress_percentage: 100,
  },
  {
    module_id: "m2",
    module_no: 2,
    name: "CEFR Score",
    description: "Challenge yourself",
    status: "in_progress",
    total_days: 12,
    days_completed: 5,
    progress_percentage: 70,
  },
  {
    module_id: "m3",
    module_no: 3,
    name: "Post Assesment",
    description: "Craft effective messages",
    status: "locked",
    total_days: 12,
    days_completed: 0,
    progress_percentage: 0,
  },
];

// Helper to map listening data
const mapListening = (dayIndex: number): ListeningActivityData => {
  const data = listeningData[dayIndex % listeningData.length];
  return {
    id: `m1_${dayIndex + 1}_listening`,
    type: "listening",
    scenario_name: data?.title || "Listening Exercise",
    status: dayIndex === 0 ? "unlocked" : "locked",
    time_limit: 900,
    audio_url: data?.audio ?? null,
    audio_script: data?.transcript || "",
    questions: (data?.questions || []).map((q, i) => ({
      id: `m1_${dayIndex + 1}_listening_q${i}`,
      question: q.question,
      options: q.options,
      answer: q.answer,
    })),
  };
};

// Map of subModuleId_dayNo -> Daily Activities
// Each day focuses on its specific curriculum index (dayIndex - 1)
export const MOCK_ACTIVITIES = {
  "placeholder-1_1": [
    mapListening(0),
    {
      ...grammarData[0 % grammarData.length],
      id: "m1_1_grammar",
      status: "locked",
      type: "grammar",
      time_limit: 900,
    },
    {
      ...vocabularyData[0 % vocabularyData.length],
      id: "m1_1_vocabulary",
      status: "locked",
      type: "vocabulary",
      time_limit: 900,
    },
    {
      ...speakingData[0 % speakingData.length],
      id: "m1_1_speaking",
      status: "locked",
      type: "speaking",
      time_limit: 900,
    },
  ],
  "placeholder-1_2": [
    mapListening(1),
    {
      ...grammarData[1 % grammarData.length],
      id: "m1_2_grammar",
      status: "locked",
      type: "grammar",
      time_limit: 900,
    },
    {
      ...readingData[1 % readingData.length],
      id: "m1_2_reading",
      status: "locked",
      type: "reading",
      time_limit: 900,
    },
    {
      ...speakingData[1 % speakingData.length],
      id: "m1_2_speaking",
      status: "locked",
      type: "speaking",
      time_limit: 900,
    },
  ],
  "placeholder-1_3": [
    {
      ...writingData[2 % writingData.length],
      id: "m1_3_writing",
      status: "unlocked",
      type: "writing",
      time_limit: 900,
    },
    {
      ...vocabularyData[2 % vocabularyData.length],
      id: "m1_3_vocabulary",
      status: "locked",
      type: "vocabulary",
      time_limit: 900,
    },
    mapListening(2),
    {
      ...speakingData[2 % speakingData.length],
      id: "m1_3_speaking",
      status: "locked",
      type: "speaking",
      time_limit: 900,
    },
  ],
  "placeholder-1_4": [
    mapListening(3),
    {
      ...writingData[3 % writingData.length],
      id: "m1_4_writing",
      status: "locked",
      type: "writing",
      time_limit: 900,
    },
    {
      ...grammarData[3 % grammarData.length],
      id: "m1_4_grammar",
      status: "locked",
      type: "grammar",
      time_limit: 900,
    },
    {
      ...readingData[3 % readingData.length],
      id: "m1_4_reading",
      status: "locked",
      type: "reading",
      time_limit: 900,
    },
  ],
  "placeholder-1_5": [
    mapListening(4),
    {
      ...vocabularyData[4 % vocabularyData.length],
      id: "m1_5_vocabulary",
      status: "locked",
      type: "vocabulary",
      time_limit: 900,
    },
    {
      ...speakingData[4 % speakingData.length],
      id: "m1_5_speaking",
      status: "locked",
      type: "speaking",
      time_limit: 900,
    },
    {
      ...grammarData[4 % grammarData.length],
      id: "m1_5_grammar",
      status: "locked",
      type: "grammar",
      time_limit: 900,
    },
  ],
  "placeholder-1_6": [
    mapListening(5),
    {
      ...grammarData[5 % grammarData.length],
      id: "m1_6_grammar",
      status: "locked",
      type: "grammar",
      time_limit: 900,
    },
    {
      ...readingData[5 % readingData.length],
      id: "m1_6_reading",
      status: "locked",
      type: "reading",
      time_limit: 900,
    },
    {
      ...speakingData[5 % speakingData.length],
      id: "m1_6_speaking",
      status: "locked",
      type: "speaking",
      time_limit: 900,
    },
  ],
  "placeholder-1_7": [
    mapListening(6),
    {
      ...writingData[6 % writingData.length],
      id: "m1_7_writing",
      status: "locked",
      type: "writing",
      time_limit: 900,
    },
    {
      ...grammarData[6 % grammarData.length],
      id: "m1_7_grammar",
      status: "locked",
      type: "grammar",
      time_limit: 900,
    },
    {
      ...vocabularyData[6 % vocabularyData.length],
      id: "m1_7_vocabulary",
      status: "locked",
      type: "vocabulary",
      time_limit: 900,
    },
  ],
  "placeholder-1_8": [
    mapListening(7),
    {
      ...vocabularyData[7 % vocabularyData.length],
      id: "m1_8_vocabulary",
      status: "locked",
      type: "vocabulary",
      time_limit: 900,
    },
    {
      ...grammarData[7 % grammarData.length],
      id: "m1_8_grammar",
      status: "locked",
      type: "grammar",
      time_limit: 900,
    },
    {
      ...speakingData[7 % speakingData.length],
      id: "m1_8_speaking",
      status: "locked",
      type: "speaking",
      time_limit: 900,
    },
  ],
  "placeholder-1_9": [
    mapListening(8),
    {
      ...grammarData[8 % grammarData.length],
      id: "m1_9_grammar",
      status: "locked",
      type: "grammar",
      time_limit: 900,
    },
    {
      ...readingData[8 % readingData.length],
      id: "m1_9_reading",
      status: "locked",
      type: "reading",
      time_limit: 900,
    },
    {
      ...speakingData[8 % speakingData.length],
      id: "m1_9_speaking",
      status: "locked",
      type: "speaking",
      time_limit: 900,
    },
  ],
  "placeholder-1_10": [
    mapListening(9),
    {
      ...vocabularyData[9 % vocabularyData.length],
      id: "m1_10_vocabulary",
      status: "locked",
      type: "vocabulary",
      time_limit: 900,
    },
    {
      ...writingData[9 % writingData.length],
      id: "m1_10_writing",
      status: "locked",
      type: "writing",
      time_limit: 900,
    },
    {
      ...speakingData[9 % speakingData.length],
      id: "m1_10_speaking",
      status: "locked",
      type: "speaking",
      time_limit: 900,
    },
  ],
  "placeholder-1_11": [
    mapListening(10),
    {
      ...grammarData[10 % grammarData.length],
      id: "m1_11_grammar",
      status: "locked",
      type: "grammar",
      time_limit: 900,
    },
    {
      ...vocabularyData[10 % vocabularyData.length],
      id: "m1_11_vocabulary",
      status: "locked",
      type: "vocabulary",
      time_limit: 900,
    },
    {
      ...writingData[10 % writingData.length],
      id: "m1_11_writing",
      status: "locked",
      type: "writing",
      time_limit: 900,
    },
  ],
  "placeholder-1_12": [
    mapListening(11),
    {
      ...grammarData[11 % grammarData.length],
      id: "m1_12_grammar",
      status: "locked",
      type: "grammar",
      time_limit: 900,
    },
    {
      ...readingData[11 % readingData.length],
      id: "m1_12_reading",
      status: "locked",
      type: "reading",
      time_limit: 900,
    },
    {
      ...speakingData[11 % speakingData.length],
      id: "m1_12_speaking",
      status: "locked",
      type: "speaking",
      time_limit: 900,
    },
  ],
} as Record<string, AnyActivityData[]>;
