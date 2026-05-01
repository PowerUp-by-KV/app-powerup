import { SpeakingReadScreen, type SpeakingReadAssessment } from "./index";

const exampleAssessment: SpeakingReadAssessment = {
  id: "speaking-read-001",
  title: "English Speaking - Read the Sentences",
  description: "Read sentences aloud and record your voice",
  totalQuestions: 4,
  passingScore: 70,
  questions: [
    {
      section: "Section A",
      subSection: "Speaking - Read the Sentences",
      questionNo: 1,
      sentence: "The children played in the park while their parents watched from a bench nearby.",
      noOfLines: 1,
      complexity: "Easy",
      answerType: "Record Voice",
      recordingTime: 15,
    },
    {
      section: "Section A",
      subSection: "Speaking - Read the Sentences",
      questionNo: 2,
      sentence:
        "Renewable energy sources, such as solar and wind power, are essential for reducing carbon emissions and combating climate change.",
      noOfLines: 2,
      complexity: "Medium",
      answerType: "Record Voice",
      recordingTime: 15,
    },
    {
      section: "Section A",
      subSection: "Speaking - Read the Sentences",
      questionNo: 3,
      sentence:
        "Despite facing numerous challenges, the team worked together and successfully completed the project ahead of schedule.",
      noOfLines: 2,
      complexity: "Medium",
      answerType: "Record Voice",
      recordingTime: 15,
    },
    {
      section: "Section A",
      subSection: "Speaking - Read the Sentences",
      questionNo: 4,
      sentence:
        "The internet has revolutionized education by providing access to vast amounts of information, enabling online learning, and fostering global collaboration among students and educators.",
      noOfLines: 3,
      complexity: "Advanced",
      answerType: "Record Voice",
      recordingTime: 30,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function PreSpeakingReadExampleUsage() {
  return <SpeakingReadScreen assessment={exampleAssessment} />;
}
