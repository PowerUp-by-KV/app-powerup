import { ListeningScreen, type ListeningAssessment } from "./index";

const exampleAssessment: ListeningAssessment = {
  id: "listening-001",
  title: "English Listening Assessment",
  description: "Listen to audio passages and repeat what you hear",
  totalQuestions: 4,
  passingScore: 70,
  questions: [
    {
      section: "Section A",
      subSection: "Listen to Audio & Speak / Repeat",
      questionNo: 1,
      audioText:
        "The sun rose slowly over the hills, painting the sky in shades of orange and gold.",
      audioDuration: 5,
      noOfLines: 1,
      complexity: "Easy",
      answerType: "Record Voice",
      recordingTime: 15,
    },
    {
      section: "Section A",
      subSection: "Listen to Audio & Speak / Repeat",
      questionNo: 2,
      audioText:
        "Sarah carefully packed her school bag the night before, making sure she had all her books and stationery ready for the next morning.",
      audioDuration: 5,
      noOfLines: 2,
      complexity: "Medium",
      answerType: "Record Voice",
      recordingTime: 15,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function PreListeningExampleUsage() {
  return <ListeningScreen assessment={exampleAssessment} />;
}
