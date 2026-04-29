import { api } from "./api";

export interface StartSessionResponse {
  session_id: string;
  set_number: number;
  total_sections: number;
  first_section: string;
}

export interface AssessmentOption {
  label: string;
  value: string;
}

export interface AssessmentQuestion {
  id: string;
  question_id?: string;
  question_no?: number;
  question?: string;
  text?: string;
  sentence?: string;
  prompt?: string;
  story?: string;
  options?: AssessmentOption[];
}

export interface AssessmentSectionResponse {
  section: string;
  paragraph?: string;
  audio_url?: string;
  questions?: AssessmentQuestion[];
  sentences?: any[];
  items?: any[];
  prompts?: any[];
  stories?: any[];
}

export interface AssessmentAnswer {
  question_id: string;
  answer?: string;
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

    completeSession: builder.mutation<{ cefr_range: string }, { session_id: string }>({
      query: ({ session_id }) => ({
        url: `/v1/assessment/session/${session_id}/complete`,
        method: "POST",
      }),
      invalidatesTags: ["Assessment"],
    }),

    getAssessmentResult: builder.query<
      {
        overall_score: number;
        cefr_range: string;
        categories: {
          id: string;
          title: string;
          score: number;
          total: number;
          icon: string;
        }[];
      },
      { session_id: string }
    >({
      query: ({ session_id }) => `/v1/assessment/session/${session_id}/result`,
      providesTags: ["Assessment"],
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
      return "/pre-grammer";
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
  useGetAssessmentResultQuery,
} = assessmentApi;
