import { RawGrammarData } from "./raw-data-types";

export const grammarData: RawGrammarData[] = [
  {
    id: "g1",
    scenario_name: "Pronouns & Presence",
    questions: [
      {
        id: "g1_q1",
        question: "Alex and ___ are joining the team lunch today.",
        options: ["Me", "I", "Us", "Them"],
        answer: "I",
      },
      {
        id: "g1_q2",
        question: "Between you and ___, I think the project will be a success.",
        options: ["I", "Me", "We", "They"],
        answer: "Me",
      },
      {
        id: "g1_q3",
        question: "Does ___ know who left their keys in the breakroom?",
        options: ["Anyone", "Someone", "Nobody", "Everyone"],
        answer: "Anyone",
      },
    ],
  },
  {
    id: "g2",
    scenario_name: "Past Tenses",
    questions: [
      {
        id: "g2_q1",
        question: "In my last role, I ___ a team of five people.",
        options: ["Lead", "Led", "Leading", "Leaded"],
        answer: "Led",
      },
      {
        id: "g2_q2",
        question: "Yesterday, the manager ___ the new office policy.",
        options: ["Explain", "Explains", "Explained", "Explaining"],
        answer: "Explained",
      },
      {
        id: "g2_q3",
        question: "We ___ all the necessary documents before the deadline.",
        options: ["Submit", "Submitted", "Submitting", "Has submit"],
        answer: "Submitted",
      },
    ],
  },
  {
    id: "g3",
    scenario_name: "Present Perfect",
    questions: [
      {
        id: "g3_q1",
        question: "I ___ worked in the tech industry for five years.",
        options: ["Have", "Has", "Was", "Am"],
        answer: "Have",
      },
      {
        id: "g3_q2",
        question: "She ___ already finished the preliminary research.",
        options: ["Have", "Has", "Had", "Is"],
        answer: "Has",
      },
      {
        id: "g3_q3",
        question: "They ___ lived in London since 2015.",
        options: ["Have", "Has", "Was", "Are"],
        answer: "Have",
      },
    ],
  },
  {
    id: "g4",
    scenario_name: "Formal Punctuation",
    questions: [
      {
        id: "g4_q1",
        question: "Dear ___ Smith,",
        options: ["Mr", "Mr.", "mr", "Mr,"],
        answer: "Mr.",
      },
      {
        id: "g4_q2",
        question: "The ___ report was presented yesterday.",
        options: ["Managers", "Manager's", "Managers'", "Manager"],
        answer: "Manager's",
      },
      {
        id: "g4_q3",
        question: "Wait! Don't click that link ___",
        options: [".", "?", "!", ","],
        answer: "!",
      },
    ],
  },
  {
    id: "g5",
    scenario_name: "Modal Verbs",
    questions: [
      {
        id: "g5_q1",
        question: "___ I join you for coffee?",
        options: ["Must", "Can", "Will", "Should"],
        answer: "Can",
      },
      {
        id: "g5_q2",
        question: "You ___ follow the safety protocols at all times.",
        options: ["Can", "Might", "Must", "May"],
        answer: "Must",
      },
      {
        id: "g5_q3",
        question: "It ___ rain later, so take an umbrella.",
        options: ["Must", "Might", "Will", "Shall"],
        answer: "Might",
      },
    ],
  },
  {
    id: "g6",
    scenario_name: "Conditionals",
    questions: [
      {
        id: "g6_q1",
        question: "If we finish early, we ___ go for lunch.",
        options: ["Will", "Would", "Are", "Do"],
        answer: "Will",
      },
      {
        id: "g6_q2",
        question: "If I ___ you, I would take that offer.",
        options: ["Was", "Am", "Were", "Be"],
        answer: "Were",
      },
      {
        id: "g6_q3",
        question: "If they ___ hard, they would have passed.",
        options: ["Study", "Studied", "Have studied", "Had studied"],
        answer: "Had studied",
      },
    ],
  },
  {
    id: "g7",
    scenario_name: "Comparing",
    questions: [
      {
        id: "g7_q1",
        question: "This year's growth is ___ than last year's.",
        options: ["Good", "Better", "Best", "More better"],
        answer: "Better",
      },
      {
        id: "g7_q2",
        question: "This is the ___ expensive laptop in the store.",
        options: ["More", "Most", "Much", "Very"],
        answer: "Most",
      },
      {
        id: "g7_q3",
        question: "He is as ___ as his brother.",
        options: ["Tall", "Taller", "Tallest", "More tall"],
        answer: "Tall",
      },
    ],
  },
  {
    id: "g8",
    scenario_name: "Reported Speech",
    questions: [
      {
        id: "g8_q1",
        question: "She said she ___ happy with the offer.",
        options: ["Is", "Was", "Am", "Are"],
        answer: "Was",
      },
      {
        id: "g8_q2",
        question: "He asked if I ___ finished the report.",
        options: ["Have", "Had", "Has", "Was"],
        answer: "Had",
      },
      {
        id: "g8_q3",
        question: "They told me that they ___ arrive late.",
        options: ["Will", "Would", "Shall", "Can"],
        answer: "Would",
      },
    ],
  },
  {
    id: "g9",
    scenario_name: "Passive Voice",
    questions: [
      {
        id: "g9_q1",
        question: "The error ___ by the QA team last night.",
        options: ["Was discovered", "Discover", "Discovered", "Discovering"],
        answer: "Was discovered",
      },
      {
        id: "g9_q2",
        question: "The new software ___ tested by the engineers.",
        options: ["Is being", "Are being", "Was being", "Has being"],
        answer: "Is being",
      },
      {
        id: "g9_q3",
        question: "The bridge ___ built in 1920.",
        options: ["Is", "Was", "Were", "Has been"],
        answer: "Was",
      },
    ],
  },
  {
    id: "g10",
    scenario_name: "Prepositions",
    questions: [
      {
        id: "g10_q1",
        question: "The meeting starts ___ 9 AM.",
        options: ["On", "At", "In", "With"],
        answer: "At",
      },
      {
        id: "g10_q2",
        question: "He was born ___ July.",
        options: ["In", "On", "At", "By"],
        answer: "In",
      },
      {
        id: "g10_q3",
        question: "The office is ___ the third floor.",
        options: ["In", "At", "On", "By"],
        answer: "On",
      },
    ],
  },
  {
    id: "g11",
    scenario_name: "Future Tenses",
    questions: [
      {
        id: "g11_q1",
        question: "Next year, we ___ expand our team.",
        options: ["Will", "Going to", "Was", "Did"],
        answer: "Will",
      },
      {
        id: "g11_q2",
        question: "I ___ to the gym after work.",
        options: ["Go", "Am going", "Went", "Has gone"],
        answer: "Am going",
      },
      {
        id: "g11_q3",
        question: "By this time tomorrow, I ___ in Paris.",
        options: ["Will be", "Am", "Was", "Would be"],
        answer: "Will be",
      },
    ],
  },
  {
    id: "g12",
    scenario_name: "Final Review",
    questions: [
      {
        id: "g12_q1",
        question: "I ___ finished the entire module.",
        options: ["Am", "Have", "Was", "Did"],
        answer: "Have",
      },
      {
        id: "g12_q2",
        question: "She ___ hard all day.",
        options: ["Works", "Is working", "Working", "Work"],
        answer: "Is working",
      },
      {
        id: "g12_q3",
        question: "They ___ going to the party tonight.",
        options: ["Is", "Are", "Am", "Was"],
        answer: "Are",
      },
    ],
  },
];
