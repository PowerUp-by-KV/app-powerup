import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { grammarTopics as mockGrammarTopics } from "@/constants/grammarData";

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
  // Initialize grammar topics from mock data so lookups in updateLessonCompletion work
  // This is stored in state so it can be replaced with API data later.
  const [grammarTopics, setGrammarTopics] = useState<any[]>(mockGrammarTopics);

  useEffect(() => {
    // Optional: fetch real grammar topics from API and replace mock data
    // async function loadGrammarTopics() {
    //   try {
    //     const data = await api.getGrammarTopics();
    //     setGrammarTopics(data);
    //   } catch (e) {
    //     // keep mock data on error
    //   }
    // }
    // loadGrammarTopics();
  }, []);

  // Initialize progress data with 25% for all topics and chapters
  const [grammarProgress, setGrammarProgress] = useState<GrammarProgress>(() => {
    const initialProgress: GrammarProgress = {};
    grammarTopics.forEach((topic) => {
      const topicId = topic.id;
      const topicEntry: TopicProgress = {
        progress: 25,
        chapters: {},
      };

      topic.chapters.forEach((chapter: any) => {
        topicEntry.chapters[chapter.id] = {
          progress: 25,
          completedLessons: [],
        };
      });

      initialProgress[topicId] = topicEntry;
    });
    return initialProgress;
  });

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
      const chapterData = topicData?.chapters.find((c: any) => c.id === chapterId);
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
