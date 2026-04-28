import { RawReadingData } from "./raw-data-types";

export const readingData: RawReadingData[] = [
  {
    id: "r1",
    title: "A Busy Morning",
    paragraph:
      "Sarah wakes up at 6:30 AM every day. She starts her morning with a glass of water and ten minutes of stretching. After that, she makes a healthy breakfast, usually oatmeal with fresh fruit. By 7:30 AM, she is ready to walk to the bus stop. Sarah works as a graphic designer in the city center. She enjoys her commute because she can listen to her favorite podcasts. Her office is a large, modern building with many windows.",
    vocabulary: [
      {
        word: "stretching",
        meaning: "The act of extending or pulling your limbs or body to full length.",
        pos: "noun",
        pronunciation: "/ˈstretʃ.ɪŋ/",
        example: "Stretching in the morning helps me feel more flexible.",
      },
      {
        word: "commute",
        meaning: "A regular journey of some distance between one's home and place of work.",
        pos: "noun",
        pronunciation: "/kəˈmjuːt/",
        example: "My daily commute takes about forty-five minutes by train.",
      },
      {
        word: "modern",
        meaning: "Relating to the present or recent times as opposed to the remote past.",
        pos: "adjective",
        pronunciation: "/ˈmɒd.ən/",
        example: "The new library is a beautiful modern building.",
      },
    ],
    questions: [
      {
        id: "r1q1",
        question: "What time does Sarah wake up?",
        options: ["6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM"],
        answer: "6:30 AM",
        difficulty: "easy",
      },
    ],
  },
  {
    id: "r2",
    title: "The Future of Artificial Intelligence",
    paragraph:
      "Artificial Intelligence (AI) is transforming the way we live and work. From self-driving cars to virtual assistants, AI technology is becoming more integrated into our daily routines. Experts believe that AI will continue to evolve, potentially solving complex problems in medicine and environmental science. However, some people express concerns about job displacement and data privacy. It is essential for society to establish ethical guidelines for AI development to ensure it benefits everyone. As AI becomes more sophisticated, humans will need to adapt by learning new skills and working alongside these intelligent systems.",
    vocabulary: [
      {
        word: "integrated",
        meaning: "Combined or coordinated to form a whole.",
        pos: "adjective",
        pronunciation: "/ˈɪn.tɪ.ɡreɪ.tɪd/",
        example: "The new software is fully integrated with our existing database.",
      },
      {
        word: "evolve",
        meaning: "Develop gradually, especially from a simple to a more complex form.",
        pos: "verb",
        pronunciation: "/ɪˈvɒlv/",
        example: "Technology continues to evolve at a rapid pace.",
      },
      {
        word: "sophisticated",
        meaning: "Highly developed and complex.",
        pos: "adjective",
        pronunciation: "/səˈfɪs.tɪ.keɪ.tɪd/",
        example: "The hospital uses sophisticated equipment for surgeries.",
      },
    ],
    questions: [
      {
        id: "r2q1",
        question: "What are some examples of AI mentioned in the text?",
        options: [
          "Smartphones",
          "Self-driving cars and virtual assistants",
          "Electric bicycles",
          "Space rockets",
        ],
        answer: "Self-driving cars and virtual assistants",
        difficulty: "easy",
      },
    ],
  },
];
