import { Question } from "../services/ExerciseApi";

export const DAILY_QUESTS = [
  {
    id: "quest-1",
    title: "Grammar Sprint",
    description: "Correct 10 sentences in 2 minutes",
    timeLimit: 120, // 2 minutes
    questions: [
      {
        type: "Multiple Choice",
        question: "Select the correctly punctuated sentence:",
        options: [
          "Wait! I'm coming with you.",
          "Wait I'm coming with you.",
          "Wait, I'm coming with you!",
          "Wait; I'm coming with you.",
        ],
        correctAnswer: 2,
        explanation:
          "A comma is used after introductory words like 'Wait', and an exclamation mark fits the urgency.",
      },
      {
        type: "Sentence Correction",
        question: "Identify the error: 'None of the students has finished their work.'",
        options: [
          "Change 'None' to 'No one'",
          "Change 'has' to 'have'",
          "Change 'their' to 'his or her'",
          "No error",
        ],
        correctAnswer: 1,
        explanation:
          "Although 'none' can be singular, in modern usage with plural nouns (students), 'have' is more common and often preferred.",
      },
      {
        type: "Fill in the Blanks",
        question: "If I ___ known about the meeting, I would have attended.",
        options: ["have", "had", "would have", "did"],
        correctAnswer: 1,
        explanation:
          "This is a third conditional sentence (If + past perfect, would + have + past participle).",
      },
      {
        type: "Word Order",
        question: "Arrange the words: 'never / he / been / has / before / here'",
        options: [
          "He has been never here before.",
          "He never has been here before.",
          "He has never been here before.",
          "Never he has been here before.",
        ],
        correctAnswer: 2,
        explanation:
          "The frequency adverb 'never' usually goes between the auxiliary 'has' and the past participle 'been'.",
      },
      {
        type: "Multiple Choice",
        question: "Which of these is a portmanteau word?",
        options: ["Bicycle", "Podcast", "Television", "Smartphone"],
        correctAnswer: 1,
        explanation: "'Podcast' is a portmanteau of 'iPod' and 'broadcast'.",
      },
      {
        type: "Sentence Correction",
        question: "Fix the redundancy: 'The reason why I am late is because of the traffic.'",
        options: [
          "The reason I am late is traffic.",
          "I am late because traffic.",
          "The reason I am late is because of traffic.",
          "I am late because of the traffic.",
        ],
        correctAnswer: 3,
        explanation:
          "'The reason why... is because' is redundant. 'I am late because of the traffic' is concise and correct.",
      },
      {
        type: "Fill in the Blanks",
        question: "By this time next year, I ___ my degree.",
        options: ["will finish", "will be finishing", "will have finished", "finish"],
        correctAnswer: 2,
        explanation:
          "The future perfect ('will have finished') is used for actions that will be completed by a certain point in the future.",
      },
      {
        type: "Multiple Choice",
        question: "Identify the oxymoron:",
        options: ["Cold fire", "Run fast", "Blue sky", "Speak loudly"],
        correctAnswer: 0,
        explanation:
          "An oxymoron is a figure of speech in which contradictory terms appear in conjunction.",
      },
      {
        type: "Sentence Correction",
        question:
          "Correct the dangling modifier: 'Walking down the street, the trees were beautiful.'",
        options: [
          "While walking down the street, the trees were beautiful.",
          "Walking down the street, I thought the trees were beautiful.",
          "The trees were beautiful walking down the street.",
          "As the trees walked down the street, they were beautiful.",
        ],
        correctAnswer: 1,
        explanation:
          "The modifier 'Walking down the street' must refer to a person, not the trees.",
      },
      {
        type: "Fill in the Blanks",
        question: "The team ___ practicing for the state championship since August.",
        options: ["is", "has been", "have been", "was"],
        correctAnswer: 1,
        explanation:
          "Present perfect continuous ('has been practicing') is used for an action that started in the past and continues to the present.",
      },
    ],
  },
];
