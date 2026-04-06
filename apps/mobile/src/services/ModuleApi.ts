import { api } from "./api";
import { LEARNING_MODULES, TOPICS, LESSONS } from "@/constants/mockData";

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string[];
  topicsCount: number;
}

export interface Topic {
  id: string;
  title: string;
  lessonsCount: number;
  progress: number;
}

export interface Lesson {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  time: string;
  progress: number;
}

export const moduleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getModules: builder.query<LearningModule[], void>({
      query: () => "/modules",
      transformResponse: (response: LearningModule[]) => response || LEARNING_MODULES,
    }),
    getTopicsByModule: builder.query<Topic[], string>({
      query: (moduleId) => `/modules/${moduleId}/topics`,
      transformResponse: (response: Topic[], meta, arg) => response || (TOPICS as any)[arg] || [],
    }),
    getLessonsByTopic: builder.query<Lesson[], string>({
      query: (topicId) => `/topics/${topicId}/lessons`,
      transformResponse: (response: Lesson[], meta, arg) => response || (LESSONS as any)[arg] || [],
    }),
  }),
});

export const { useGetModulesQuery, useGetTopicsByModuleQuery, useGetLessonsByTopicQuery } =
  moduleApi;
