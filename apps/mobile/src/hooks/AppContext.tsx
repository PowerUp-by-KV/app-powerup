import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from "react";
import { useGetGrammarTopicsQuery } from "@/services/grammaractivity-api";

// Define the comprehensive Progress interfaces
interface ChapterProgress {
  progress: number;
  completedLessons: string[];
}

interface TopicProgress {
  progress: number;
  chapters: Record<string, ChapterProgress>;
}

type GrammarProgress = Record<string, TopicProgress>;

interface AppContextType {
  grammarProgress: GrammarProgress;
  updateLessonCompletion: (topicId: string, chapterId: string, lessonId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { data: grammarTopicsApi } = useGetGrammarTopicsQuery();
  const grammarTopics = useMemo(() => grammarTopicsApi || [], [grammarTopicsApi]);

  // Initialize progress data with 25% for all topics and chapters
  const [grammarProgress, setGrammarProgress] = useState<GrammarProgress>({});

  // Effect to initialize progress once grammarTopics are loaded
  useEffect(() => {
    if (grammarTopics.length > 0 && Object.keys(grammarProgress).length === 0) {
      const initialProgress: GrammarProgress = {};
      grammarTopics.forEach((topic) => {
        const topicId = topic.id;
        const topicEntry: TopicProgress = {
          progress: topic.progress ?? 25,
          chapters: {},
        };

        topic.chapters.forEach((chapter) => {
          topicEntry.chapters[chapter.id] = {
            progress: chapter.progress ?? 25,
            completedLessons: [],
          };
        });

        initialProgress[topicId] = topicEntry;
      });
      setGrammarProgress(initialProgress);
    }
  }, [grammarTopics, grammarProgress]);

  const updateLessonCompletion = (topicId: string, chapterId: string, lessonId: string) => {
    setGrammarProgress((prev) => {
      const topic = prev[topicId];
      if (!topic) return prev;

      const chapter = topic.chapters[chapterId];
      if (!chapter) return prev;

      // Don't duplicate completions
      if (chapter.completedLessons.includes(lessonId)) return prev;

      const newCompletedLessons = [...chapter.completedLessons, lessonId];

      // Calculate new chapter progress
      const topicData = grammarTopics.find((t) => t.id === topicId);
      const chapterData = topicData?.chapters.find((c) => c.id === chapterId);
      const totalLessons = chapterData?.subtopics?.length || 1;

      const newChapterProgress = Math.min(
        100,
        25 + 75 * (newCompletedLessons.length / totalLessons),
      );

      const newChapters = {
        ...topic.chapters,
        [chapterId]: {
          ...chapter,
          completedLessons: newCompletedLessons,
          progress: newChapterProgress,
        },
      };

      // Calculate new topic progress (average of chapters)
      const chapterCount = topicData?.chapters?.length || 1;
      const totalChapterProgress = Object.values(newChapters).reduce(
        (acc, ch) => acc + ch.progress,
        0,
      );
      const newTopicProgress = totalChapterProgress / chapterCount;

      return {
        ...prev,
        [topicId]: {
          ...topic,
          progress: newTopicProgress,
          chapters: newChapters,
        },
      };
    });
  };

  return (
    <AppContext.Provider value={{ grammarProgress, updateLessonCompletion }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
