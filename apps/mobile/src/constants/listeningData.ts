// Placeholder for listeningData.ts - the original file was not found
export const listeningData = [
  {
    id: "l1",
    title: "Greeting a Friend",
    audio: require("../../assets/audio/Greeting a friend.mp3"),
    transcript: "Hey Sarah! It's so good to see you. How have you been?",
    questions: [
      {
        question: "Who is the speaker talking to?",
        options: ["A teacher", "A friend named Sarah", "A doctor", "A stranger"],
        answer: "A friend named Sarah",
      },
      {
        question: "How does the speaker feel?",
        options: ["Angry", "Sad", "Happy to see Sarah", "Bored"],
        answer: "Happy to see Sarah",
      },
      {
        question: "What is the purpose of this talk?",
        options: ["To ask for money", "To say goodbye", "To greet someone", "To complain"],
        answer: "To greet someone",
      },
    ],
  },
  {
    id: "l2",
    title: "Ordering Coffee",
    audio: require("../../assets/audio/Ordering Coffee.mp3"),
    transcript: "I'd like a large latte with oat milk and no sugar, please.",
    questions: [
      {
        question: "What drink did the person order?",
        options: ["Black tea", "Large latte", "Small water", "Orange juice"],
        answer: "Large latte",
      },
      {
        question: "What kind of milk did they ask for?",
        options: ["Soy milk", "Oat milk", "Regular milk", "Almond milk"],
        answer: "Oat milk",
      },
      {
        question: "Does the person want sugar?",
        options: ["Yes, a lot", "No sugar", "One spoon", "Two spoons"],
        answer: "No sugar",
      },
    ],
  },
  {
    id: "l4",
    title: "Meeting at the Office",
    audio: require("../../assets/audio/Meeting at the Office.mp3"),
    transcript:
      "Hi Mark. Do you have the report ready for our 2 PM meeting? We need to present the sales data to the manager.",
    questions: [
      {
        question: "What time is the meeting?",
        options: ["10 AM", "12 PM", "2 PM", "4 PM"],
        answer: "2 PM",
      },
      {
        question: "What document is mentioned?",
        options: ["A contract", "A report", "An invoice", "A letter"],
        answer: "A report",
      },
      {
        question: "What is the main goal of the meeting?",
        options: [
          "To have lunch",
          "To present sales data",
          "To hire a new person",
          "To clean the office",
        ],
        answer: "To present sales data",
      },
    ],
  },
  {
    id: "l7",
    title: "Flight Announcement",
    audio: require("../../assets/audio/Flight Announcement.mp3"),
    transcript:
      "Attention all passengers for flight BK204 to London. Due to heavy rain, your departure has been delayed by 45 minutes. Please proceed to gate B12 for further updates.",
    questions: [
      {
        question: "What is the destination of the flight?",
        options: ["Paris", "London", "New York", "Tokyo"],
        answer: "London",
      },
      {
        question: "Why is the flight delayed?",
        options: ["Technical issues", "Heavy rain", "Missing crew", "Security check"],
        answer: "Heavy rain",
      },
      {
        question: "What should passengers do next?",
        options: ["Go home", "Proceed to gate B12", "Buy a new ticket", "Wait at the cafeteria"],
        answer: "Proceed to gate B12",
      },
    ],
  },
  {
    id: "l8",
    title: "School Project Discussion",
    audio: require("../../assets/audio/School Project Discussion.mp3"),
    transcript:
      "We need to finish our science project by Friday. I'll handle the research, and you can focus on creating the presentation slides.",
    questions: [
      {
        question: "What subject is the project for?",
        options: ["History", "Math", "Science", "Art"],
        answer: "Science",
      },
      {
        question: "When is the deadline for the project?",
        options: ["Monday", "Wednesday", "Friday", "Sunday"],
        answer: "Friday",
      },
      {
        question: "What will the other person work on?",
        options: ["Research", "Presentation slides", "Experiments", "Writing the report"],
        answer: "Presentation slides",
      },
    ],
  },

  {
    id: "l11",
    title: "Weather Forecast",
    audio: require("../../assets/audio/Weather Forecast.mp3"),

    transcript:
      "Good morning! Expect sunshine throughout the day with temperatures reaching 25 degrees. However, scattered showers are likely in the late evening.",
    questions: [
      {
        question: "What will the weather be like for most of the day?",
        options: ["Rainy", "Cloudy", "Sunny", "Snowy"],
        answer: "Sunny",
      },
      {
        question: "What is the expected high temperature?",
        options: ["15 degrees", "20 degrees", "25 degrees", "30 degrees"],
        answer: "25 degrees",
      },
      {
        question: "When are showers expected?",
        options: ["Early morning", "Midday", "Late evening", "Night"],
        answer: "Late evening",
      },
    ],
  },
];
