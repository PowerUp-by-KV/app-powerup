import { api } from "./api";
import { DAILY_QUESTS } from "@/constants/questData";

export interface Quest {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: any[];
}

export const questApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getQuests: builder.query<Quest[], void>({
      query: () => "/api/quests",
      transformResponse: (response: Quest[]) => response || DAILY_QUESTS,
    }),
    getQuestById: builder.query<Quest, string>({
      query: (questId) => `/api/quests/${questId}`,
      transformResponse: (response: Quest, meta, arg) =>
        response || DAILY_QUESTS.find((q) => q.id === arg) || DAILY_QUESTS[0],
    }),
  }),
});

export const { useGetQuestsQuery, useGetQuestByIdQuery } = questApi;
