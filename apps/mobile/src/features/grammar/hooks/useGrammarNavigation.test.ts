import { findNextSubtopic, flattenSubtopics } from "./useGrammarNavigation";

describe("useGrammarNavigation helpers", () => {
  const mockTopics = [
    {
      id: "t1",
      chapters: [
        { id: "c1", subtopics: [{ id: "s1" }, { id: "s2" }] },
        { id: "c2", subtopics: [{ id: "s3" }] },
      ],
    },
    {
      id: "t2",
      chapters: [{ id: "c3", subtopics: [{ id: "s4" }, { id: "s5" }] }],
    },
  ];

  test("flattenSubtopics returns correct order", () => {
    const flat = flattenSubtopics(mockTopics as any);
    expect(flat.map((f) => f.subtopic.id)).toEqual(["s1", "s2", "s3", "s4", "s5"]);
  });

  test("findNextSubtopic finds next correctly", () => {
    expect(findNextSubtopic(mockTopics as any, "s1")?.id).toBe("s2");
    expect(findNextSubtopic(mockTopics as any, "s2")?.id).toBe("s3");
    expect(findNextSubtopic(mockTopics as any, "s5")).toBeNull();
    expect(findNextSubtopic([], "s1")).toBeNull();
  });
});
