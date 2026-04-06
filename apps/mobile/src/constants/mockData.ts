// Placeholder for mockData.ts - the original file was not found
export const USER_PROFILE = {
  name: "Alex Johnson",
  points: 1250,
  streak: 5,
  completedLessons: 12,
  rank: 12,
  isPremium: false,
};

export const LEARNING_MODULES = [
  {
    id: "grammar",
    title: "grammar",
    description: "Master English structure and tenses.",
    icon: "book",
    gradient: ["#4A90E2", "#357ABD"],
    topicsCount: 15,
  },
  {
    id: "reading",
    title: "reading",
    description: "Improve comprehension and vocabulary.",
    icon: "book-open",
    gradient: ["#50E3C2", "#3CB371"],
    topicsCount: 10,
  },
  {
    id: "listening",
    title: "listening",
    description: "Understand native speakers effortlessly.",
    icon: "headphones",
    gradient: ["#9013FE", "#7B1FA2"],
    topicsCount: 12,
  },
  {
    id: "verbal",
    title: "verbal",
    description: "Speak English with confidence.",
    icon: "mic",
    gradient: ["#F5A623", "#E67E22"],
    topicsCount: 8,
  },
  {
    id: "behavioural",
    title: "behavioural",
    description: "Improve logic and emotional intelligence.",
    icon: "brain",
    gradient: ["#6366F1", "#8B5CF6"],
    topicsCount: 10,
  },
];

export const TOPICS = {
  grammar: [
    { id: "tenses", title: "Tenses", lessonsCount: 5, progress: 60 },
    { id: "articles", title: "Articles", lessonsCount: 3, progress: 100 },
    { id: "prepositions", title: "Prepositions", lessonsCount: 4, progress: 20 },
    { id: "sentence-structure", title: "Sentence Structure", lessonsCount: 6, progress: 0 },
    { id: "active-passive", title: "Active & Passive Voice", lessonsCount: 4, progress: 0 },
    { id: "conditionals", title: "Conditionals", lessonsCount: 5, progress: 0 },
  ],
};

export const LESSONS = {
  tenses: [
    {
      id: "present-simple",
      title: "Present Simple",
      difficulty: "Beginner",
      time: "5m",
      progress: 100,
    },
    {
      id: "present-continuous",
      title: "Present Continuous",
      difficulty: "Beginner",
      time: "7m",
      progress: 40,
    },
    {
      id: "past-simple",
      title: "Past Simple",
      difficulty: "Intermediate",
      time: "10m",
      progress: 0,
    },
    {
      id: "past-continuous",
      title: "Past Continuous",
      difficulty: "Intermediate",
      time: "12m",
      progress: 0,
    },
    {
      id: "future-simple",
      title: "Future Simple",
      difficulty: "Beginner",
      time: "8m",
      progress: 0,
    },
  ],
  articles: [
    { id: "a-an", title: "A vs An", difficulty: "Beginner", time: "3m", progress: 100 },
    { id: "the", title: "The Definite Article", difficulty: "Beginner", time: "5m", progress: 100 },
    {
      id: "zero-article",
      title: "Zero Article",
      difficulty: "Intermediate",
      time: "6m",
      progress: 100,
    },
  ],
  prepositions: [
    {
      id: "prep-place",
      title: "Prepositions of Place",
      difficulty: "Beginner",
      time: "5m",
      progress: 40,
    },
    {
      id: "prep-time",
      title: "Prepositions of Time",
      difficulty: "Beginner",
      time: "5m",
      progress: 0,
    },
    {
      id: "prep-movement",
      title: "Prepositions of Movement",
      difficulty: "Intermediate",
      time: "8m",
      progress: 0,
    },
  ],
};

export const EXERCISES = [
  {
    lessonId: "present-simple",
    questions: [
      {
        type: "multiple-choice",
        question: "She ___ to the gym every morning.",
        options: ["go", "goes", "going", "gone"],
        correctAnswer: 1,
      },
      {
        type: "fill-in-blanks",
        question: "I ___ (be) a student at the university.",
        options: ["am", "is", "are"],
        correctAnswer: 0,
      },
      {
        type: "sentence-correction",
        question: "He do his homework every day.",
        options: [
          "He does his homework every day.",
          "He done his homework every day.",
          "He doing his homework every day.",
        ],
        correctAnswer: 0,
      },
    ],
  },
  {
    lessonId: "a-an",
    questions: [
      {
        type: "multiple-choice",
        question: "I saw ___ elephant at the zoo.",
        options: ["a", "an", "the"],
        correctAnswer: 1,
      },
      {
        type: "multiple-choice",
        question: "She wants to buy ___ new car.",
        options: ["a", "an", "the"],
        correctAnswer: 0,
      },
    ],
  },
];

export const BADGES = [
  { id: "b1", name: "Beginner Badge", icon: "star", points: 100, earned: true },
  { id: "b2", name: "Vocabulary Master", icon: "award", points: 500, earned: true },
  { id: "b3", name: "Listening Pro", icon: "headphones", points: 1000, earned: false },
];

export const LEADERBOARD = [
  { id: "1", name: "Zoe", points: 2500, streak: 12, photo: null },
  { id: "2", name: "Liam", points: 2300, streak: 8, photo: null },
  { id: "3", name: "Sophia", points: 2100, streak: 15, photo: null },
  { id: "4", name: "Madelyn Dias", points: 1950, streak: 7, photo: null },
  { id: "5", name: "Zain Vaccaro", points: 1800, streak: 4, photo: null },
  { id: "6", name: "Skylar Geidt", points: 1650, streak: 9, photo: null },
  { id: "7", name: "Alex Johnson", points: 1250, streak: 5, photo: null }, // Current User
  { id: "8", name: "James Doe", points: 1100, streak: 3, photo: null },
  { id: "9", name: "Emma Wilson", points: 1050, streak: 6, photo: null },
];
