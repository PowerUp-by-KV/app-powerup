// Placeholder for verbalData.ts - the original file was not found
export const speakingCategories = [
  {
    id: "cat1",
    title: "Daily Conversation",
    icon: "message-circle",
    description: "Practice common everyday scenarios and casual talk.",
    gradient: ["#6366F1", "#8B5CF6"],
  },
  {
    id: "cat2",
    title: "Situation Description",
    icon: "image",
    description: "Learn to describe places, people, and events clearly.",
    gradient: ["#EC4899", "#F43F5E"],
  },
  {
    id: "cat3",
    title: "Opinion Sharing",
    icon: "mic",
    description: "Express your thoughts on various modern topics.",
    gradient: ["#F59E0B", "#EF4444"],
  },
  {
    id: "cat4",
    title: "Storytelling",
    icon: "book-open",
    description: "Practice narrating past events and experiences.",
    gradient: ["#10B981", "#059669"],
  },
  {
    id: "cat5",
    title: "Interview Practice",
    icon: "briefcase",
    description: "Prepare for professional job interviews and questions.",
    gradient: ["#3B82F6", "#2563EB"],
  },
];

export const speakingPrompts = [
  {
    id: "p1",
    categoryId: "cat1",
    prompt: "Describe your favorite hobby and explain why you enjoy it.",
    difficulty: "Easy",
    timeLimit: 45,
  },
  {
    id: "p2",
    categoryId: "cat1",
    prompt: "Talk about your typical weekend routine. What do you usually do?",
    difficulty: "Easy",
    timeLimit: 30,
  },
  {
    id: "p3",
    categoryId: "cat2",
    prompt: "Describe a memorable trip you took with friends or family. Where did you go?",
    difficulty: "Medium",
    timeLimit: 60,
  },
  {
    id: "p4",
    categoryId: "cat3",
    prompt: "Share your opinion about technology in education. Is it helpful or distracting?",
    difficulty: "Hard",
    timeLimit: 90,
  },
  {
    id: "p5",
    categoryId: "cat5",
    prompt: "Talk about a challenge you faced at work and how you solved it.",
    difficulty: "Hard",
    timeLimit: 90,
  },
];
