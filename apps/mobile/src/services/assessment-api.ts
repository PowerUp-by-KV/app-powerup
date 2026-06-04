import { api, API_BASE_URL, refreshAccessToken } from "./api";
import { getAuthSession } from "./auth-storage";

export interface StartSessionResponse {
  session_id: string;
  set_number: number;
  total_sections: number;
  first_section: string;
  is_resumed?: boolean;
  current_section?: string | null;
  completed_sections?: string[] | null;
  not_completed_sections?: string[] | null;
}

export interface AssessmentOption {
  label: string;
  value: string;
}

export type AssessmentQuestionOption = AssessmentOption;

export interface AssessmentQuestion {
  id: string;
  question_id?: string;
  question_no?: number;
  question?: string;
  text?: string;
  sentence?: string;
  prompt?: string;
  story?: string;
  topic?: string | null;
  options?: AssessmentOption[];
  audio_url?: string | null;
  recording_time_seconds?: number | null;
  no_of_lines?: string | null;
  complexity?: string | null;
  audio_no?: number;
  script?: string | null;
  questions?: AssessmentQuestion[];
}

export interface ListeningStory {
  audio_no: number;
  audio_url?: string | null;
  script?: string | null;
  questions: AssessmentQuestion[];
}

export interface ReadingPassage {
  passage_no: number;
  paragraph: string;
  questions: AssessmentQuestion[];
}

export interface ReadingSectionResponse {
  section: string;
  paragraph?: string;
  audio_url?: string;
  questions?: AssessmentQuestion[];
  sentences?: AssessmentQuestion[];
  items?: AssessmentQuestion[];
  prompts?: AssessmentQuestion[];
  stories?: ListeningStory[];
  passages?: ReadingPassage[];
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

export interface AssessmentAudioUploadResponse {
  audio_url: string;
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

export interface AssessmentScoringStatusResponse {
  total_answers: number;
  completed_answers: number;
  pending_answers: number;
  failed_answers: number;
  completed_sections?: string[];
  completedSections?: string[];
}

export interface AssessmentResultResponse {
  // Core score fields (always present)
  total_score: number;
  max_score: number;
  percentage: number;
  cefr_range: string;
  section_scores: Record<string, number>;

  // Optional enrichment fields
  cefr_level?: string | null;
  section_percentages?: Record<string, number>;
  aggregated_scores?: Record<string, number>;

  // Timestamp fields returned by /user/{user_id}/result
  started_at?: string | null;
  last_submitted_at?: string | null;
  completed_at?: string | null;
  time_taken_seconds?: number | null;
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

    checkAssessmentStatus: builder.query<StartSessionResponse, void>({
      query: () => ({
        url: "/v1/assessment/session/start",
        method: "POST",
      }),
      providesTags: ["Assessment"],
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

    uploadAssessmentAudio: builder.mutation<AssessmentAudioUploadResponse, FormData>({
      queryFn: async (formData) => {
        try {
          const session = await getAuthSession();
          const headers: Record<string, string> = {
            "X-Tunnel-Skip-AntiPhishing-Page": "true",
          };
          if (session?.access_token) {
            headers["Authorization"] = `Bearer ${session.access_token}`;
          }
          let response = await fetch(`${API_BASE_URL}/v1/assessment/audio`, {
            method: "POST",
            headers,
            body: formData,
          });

          if (response.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) {
              headers["Authorization"] = `Bearer ${newToken}`;
              response = await fetch(`${API_BASE_URL}/v1/assessment/audio`, {
                method: "POST",
                headers,
                body: formData,
              });
            }
          }

          if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: "Upload failed" }));
            return { error: { status: response.status, data: err } };
          }
          const data = (await response.json()) as AssessmentAudioUploadResponse;
          return { data };
        } catch (err) {
          return { error: { status: "FETCH_ERROR" as const, error: String(err) } };
        }
      },
    }),

    completeSession: builder.mutation<
      AssessmentResultResponse | AssessmentScoringStatusResponse,
      { session_id: string }
    >({
      query: ({ session_id }) => ({
        url: `/v1/assessment/session/${session_id}/complete`,
        method: "POST",
      }),
      invalidatesTags: ["Assessment"],
    }),

    getAssessmentStatus: builder.query<AssessmentScoringStatusResponse, { session_id: string }>({
      query: ({ session_id }) => `/v1/assessment/session/${session_id}/status`,
      providesTags: ["Assessment"],
    }),

    getAssessmentResult: builder.query<AssessmentResultResponse, { session_id: string }>({
      query: ({ session_id }) => `/v1/assessment/session/${session_id}/result`,
      providesTags: ["Assessment"],
    }),

    getUserAssessmentResult: builder.query<AssessmentResultResponse, { user_id: string }>({
      query: ({ user_id }) => `/v1/assessment/user/${user_id}/result`,
      providesTags: ["Assessment"],
    }),
  }),
});

export type AssessmentRoute =
  | "/read"
  | "/speak-read"
  | "/listen-audio"
  | "/speak"
  | "/grammar"
  | "/listen"
  | "/results";

export const getNextRouteForSection = (section?: string | null): AssessmentRoute => {
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
  useCheckAssessmentStatusQuery,
  useGetAssessmentSectionQuery,
  useSubmitAssessmentSectionMutation,
  useUploadAssessmentAudioMutation,
  useCompleteSessionMutation,
  useGetAssessmentStatusQuery,
  useLazyGetAssessmentStatusQuery,
  useGetAssessmentResultQuery,
  useLazyGetAssessmentResultQuery,
  useGetUserAssessmentResultQuery,
  useLazyGetUserAssessmentResultQuery,
} = assessmentApi;
