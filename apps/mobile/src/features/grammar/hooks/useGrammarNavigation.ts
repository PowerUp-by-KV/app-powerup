// Pure helpers for navigating grammar topics
export function flattenSubtopics(grammarTopics: any[]) {
  const flat: Array<{ topicId: string; chapterId: string; subtopic: any }> = [];
  (grammarTopics || []).forEach((t: any) => {
    (t.chapters || []).forEach((c: any) => {
      (c.subtopics || []).forEach((st: any) => {
        if (st && st.id) flat.push({ topicId: t.id, chapterId: c.id, subtopic: st });
      });
    });
  });
  return flat;
}

export function findNextSubtopic(grammarTopics: any[], lessonId: string) {
  if (!grammarTopics || !lessonId) return null;
  const flat = flattenSubtopics(grammarTopics);
  const idx = flat.findIndex((f) => f.subtopic.id === lessonId);
  if (idx === -1) return null;
  const next = flat[idx + 1];
  return next ? next.subtopic : null;
}

export default function useGrammarNavigation(grammarTopics: any[] = []) {
  return {
    flattenSubtopics: () => flattenSubtopics(grammarTopics),
    findNextSubtopic: (lessonId: string) => findNextSubtopic(grammarTopics, lessonId),
  };
}
