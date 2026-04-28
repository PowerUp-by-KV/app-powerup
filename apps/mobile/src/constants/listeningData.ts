/* eslint-disable @typescript-eslint/no-require-imports */

import { RawListeningData } from "./raw-data-types";
export const listeningData: RawListeningData[] = [
  {
    id: "l1",
    title: "Greeting a Friend",
    audio: require("../../assets/audio/Greeting a friend.mp3"),
    transcript:
      "Hey Sarah! It's so good to see you. How have you been? I haven't seen you since our high school reunion last summer. You look great! Are you still working at the design agency downtown?",
    questions: [
      {
        question: "Who is the speaker talking to?",
        options: ["A teacher", "A friend named Sarah", "A doctor", "A stranger"],
        answer: "A friend named Sarah",
      },
      {
        question: "When did they last see each other?",
        options: ["Last week", "Last Christmas", "Last summer", "Two years ago"],
        answer: "Last summer",
      },
      {
        question: "Where might Sarah be working?",
        options: ["A hospital", "A school", "A design agency", "A bank"],
        answer: "A design agency",
      },
    ],
  },
  {
    id: "l2",
    title: "Ordering Coffee",
    audio: require("../../assets/audio/Ordering Coffee.mp3"),
    transcript:
      "I'd like a large latte with oat milk and no sugar, please. Oh, and can I also get one of those blueberry muffins? Make it to go, I'm in a bit of a rush for my train.",
    questions: [
      {
        question: "What drink did the person order?",
        options: ["Black tea", "Large latte", "Small water", "Orange juice"],
        answer: "Large latte",
      },
      {
        question: "What kind of milk did they request?",
        options: ["Whole milk", "Soy milk", "Oat milk", "Almond milk"],
        answer: "Oat milk",
      },
      {
        question: "What food item did they add to the order?",
        options: ["Croissant", "Blueberry muffin", "Chocolate cake", "Bagel"],
        answer: "Blueberry muffin",
      },
      {
        question: "Where is the person going?",
        options: ["To a library", "To a park", "To a train", "To a meeting"],
        answer: "To a train",
      },
    ],
  },
  {
    id: "l4",
    title: "Meeting at the Office",
    audio: require("../../assets/audio/Meeting at the Office.mp3"),
    transcript:
      "Hi Mark. Do you have the report ready for our 2 PM meeting? We need to present the sales data to the manager. I've already prepared the charts, so we just need your final analysis on the Q3 figures.",
    questions: [
      {
        question: "What time is the meeting?",
        options: ["10 AM", "12 PM", "2 PM", "4 PM"],
        answer: "2 PM",
      },
      {
        question: "What data are they presenting?",
        options: ["Marketing plans", "Sales data", "HR records", "IT budget"],
        answer: "Sales data",
      },
      {
        question: "What has the speaker already prepared?",
        options: ["The report", "The meeting room", "The charts", "The coffee"],
        answer: "The charts",
      },
    ],
  },
  {
    id: "l7",
    title: "Flight Announcement",
    audio: require("../../assets/audio/Flight Announcement.mp3"),
    transcript:
      "Attention all passengers for flight BK204 to London. Due to heavy rain and low visibility, your departure has been delayed by 45 minutes. Please proceed to gate B12 for further updates. We apologize for the inconvenience and will provide meal vouchers if the delay exceeds two hours.",
    questions: [
      {
        question: "What is the destination of the flight?",
        options: ["Paris", "London", "New York", "Tokyo"],
        answer: "London",
      },
      {
        question: "What is the reason for the delay?",
        options: ["Technical issues", "Heavy rain", "Staff shortage", "Air traffic"],
        answer: "Heavy rain",
      },
      {
        question: "How long is the initial delay?",
        options: ["15 minutes", "30 minutes", "45 minutes", "60 minutes"],
        answer: "45 minutes",
      },
      {
        question: "Which gate should passengers go to?",
        options: ["A5", "B12", "C3", "D10"],
        answer: "B12",
      },
    ],
  },
  {
    id: "l8",
    title: "School Project Discussion",
    audio: require("../../assets/audio/School Project Discussion.mp3"),
    transcript:
      "We need to finish our science project by Friday. I'll handle the research on solar energy, and you can focus on creating the presentation slides. We should also meet at the library tomorrow at 4 PM to combine our work.",
    questions: [
      {
        question: "What subject is the project for?",
        options: ["History", "Math", "Science", "Art"],
        answer: "Science",
      },
      {
        question: "What is the specific topic of the research?",
        options: ["Water pollution", "Solar energy", "Space travel", "Human biology"],
        answer: "Solar energy",
      },
      {
        question: "When is the deadline for the project?",
        options: ["Monday", "Wednesday", "Friday", "Sunday"],
        answer: "Friday",
      },
    ],
  },
  {
    id: "l11",
    title: "Weather Forecast",
    audio: require("../../assets/audio/Weather Forecast.mp3"),
    transcript:
      "Good morning! Expect sunshine throughout the day with temperatures reaching a high of 25 degrees. It's a perfect day for outdoor activities. However, scattered showers are likely in the late evening, so don't forget your umbrella if you're heading out after 8 PM.",
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
        question: "When might it start raining?",
        options: ["In the morning", "At noon", "In the late evening", "At midnight"],
        answer: "In the late evening",
      },
    ],
  },
];
