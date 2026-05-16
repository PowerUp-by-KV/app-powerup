import { api } from "./api";

export interface StartSessionResponse {
  session_id: string;
  set_number: number;
  total_sections: number;
  first_section: string;
}

export interface AssessmentQuestionOption {
  label: string;
  value: string;
}

export interface AssessmentQuestion {
  id: string;
  question_no?: number;
  question?: string;
  options?: AssessmentQuestionOption[];
}

export interface ReadingSectionResponse {
  section: string;
  paragraph: string;
  questions: AssessmentQuestion[];
}

export interface SpeakingSentence {
  id: string;
  question_no: number;
  text: string;
  no_of_lines?: string;
  complexity?: string;
  recording_time_seconds?: number;
}

export interface ASpeakingSectionResponse {
  section: string;
  sentences: SpeakingSentence[];
}

export interface ListenItem {
  id: string;
  question_no: number;
  audio_url?: string;
  recording_time_seconds?: number;
  text?: string;
  no_of_lines?: string;
  complexity?: string;
}

export interface AListenSectionResponse {
  section: string;
  items: ListenItem[];
}

export interface BSpeakingPrompt {
  id: string;
  question_no: number;
  topic?: string;
  question: string;
  time_seconds?: number;
  complexity?: string;
}

export interface BSpeakingSectionResponse {
  section: string;
  prompts: BSpeakingPrompt[];
}

export interface CGrammarSectionResponse {
  section: string;
  questions: AssessmentQuestion[];
}

export interface StoryQuestion {
  id: string;
  question_no: number;
  question: string;
  options: AssessmentQuestionOption[];
}

export interface ListeningStory {
  audio_no: number;
  audio_url?: string;
  script?: string;
  questions: StoryQuestion[];
}

export interface DListenAnswerSectionResponse {
  section: string;
  stories: ListeningStory[];
}

export type AssessmentSectionResponse =
  | ReadingSectionResponse
  | ASpeakingSectionResponse
  | AListenSectionResponse
  | BSpeakingSectionResponse
  | CGrammarSectionResponse
  | DListenAnswerSectionResponse;

export interface AssessmentAnswer {
  question_id: string;
  answer?: string | string[];
  audio_url?: string;
}

export interface SubmitSectionRequest {
  session_id: string;
  section: string;
  data: { answers: AssessmentAnswer[] };
}

export interface SubmitSectionResponse {
  section_completed: boolean;
  next_section?:
    | "A_READING"
    | "A_SPEAKING"
    | "A_LISTEN"
    | "B_SPEAKING"
    | "C_GRAMMAR"
    | "D_LISTEN_ANSWER"
    | null;
}

export interface AssessmentSessionCompleteResponse {
  total_score: number;
  max_score: number;
  percentage: number;
  cefr_range: string;
  cefr_level?: string | null;
  section_scores: Record<string, number>;
  section_percentages: Record<string, number>;
  aggregated_scores: Record<string, number>;
}

export const assessmentApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    startSession: builder.mutation<StartSessionResponse, void>({
      query: () => ({
        url: "/v1/assessment/session/start",
        method: "POST",
      }),
      invalidatesTags: ["Assessment"],
    }),

    getAssessmentSection: builder.query<
      AssessmentSectionResponse,
      { session_id: string; section: string }
    >({
      query: ({ session_id, section }) => `/v1/assessment/session/${session_id}/section/${section}`,
      providesTags: ["Assessment"],
    }),

    submitAssessmentSection: builder.mutation<SubmitSectionResponse, SubmitSectionRequest>({
      query: ({ session_id, section, data }) => ({
        url: `/v1/assessment/session/${session_id}/section/${section}/submit`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assessment"],
    }),

    completeSession: builder.mutation<AssessmentSessionCompleteResponse, { session_id: string }>({
      query: ({ session_id }) => ({
        url: `/v1/assessment/session/${session_id}/complete`,
        method: "POST",
      }),
      invalidatesTags: ["Assessment"],
    }),
  }),
});

export const getNextRouteForSection = (section?: string | null): any => {
  switch (section) {
    case "A_READING":
      return "/read";
    case "A_SPEAKING":
      return "/speak-read";
    case "A_LISTEN":
      return "/listen-audio";
    case "B_SPEAKING":
      return "/speak";
    case "C_GRAMMAR":
      return "/grammar";
    case "D_LISTEN_ANSWER":
      return "/listen";
    default:
      return "/results";
  }
};

export const {
  useStartSessionMutation,
  useGetAssessmentSectionQuery,
  useSubmitAssessmentSectionMutation,
  useCompleteSessionMutation,
} = assessmentApi;
