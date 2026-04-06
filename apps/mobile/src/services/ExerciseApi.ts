import { api } from "./api";
import { EXERCISES } from "@/constants/mockData";

export interface Question {
  type: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface ExerciseSession {
  lessonId: string;
  questions: Question[];
}

export const exerciseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getExercisesByLesson: builder.query<ExerciseSession, string>({
      query: (lessonId) => `/exercises/${lessonId}`,
      transformResponse: (response: ExerciseSession, meta, arg) =>
        response || EXERCISES.find((e) => e.lessonId === arg) || { lessonId: arg, questions: [] },
    }),
  }),
});

export const { useGetExercisesByLessonQuery } = exerciseApi;
