import { PreListenWithAudioScreen, type ListenWithAudioAssessment } from "./index";

const exampleAssessment: ListenWithAudioAssessment = {
  id: "listen-with-audio-001",
  title: "English Listening Assessment - Listen & Repeat",
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
    {
      section: "Section A",
      subSection: "Listen to Audio & Speak / Repeat",
      questionNo: 3,
      audioText:
        "The science teacher reminded the students that their project submissions were due by Friday, and that late entries would not be accepted under any circumstances.",
      audioDuration: 5,
      noOfLines: 2,
      complexity: "Medium",
      answerType: "Record Voice",
      recordingTime: 15,
    },
    {
      section: "Section A",
      subSection: "Listen to Audio & Speak / Repeat",
      questionNo: 4,
      audioText:
        "Every evening, the lighthouse keeper climbed the narrow spiral staircase to light the great lamp, guiding ships safely through the rocky waters below. He had kept this routine without fail for thirty years, through storms, fog, and the quietest of nights, finding purpose in the steady rhythm of his solitary duty.",
      audioDuration: 5,
      noOfLines: 3,
      complexity: "Advanced",
      answerType: "Record Voice",
      recordingTime: 30,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function PreListenWithAudioExampleUsage() {
  return <PreListenWithAudioScreen assessment={exampleAssessment} />;
}
