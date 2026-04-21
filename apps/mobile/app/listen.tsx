import { ListeningScreen } from "@/features/pre-listening";
import { mockListeningAssessment } from "@/utils/mock-assessments";

export default function ListenRoute() {
  return <ListeningScreen assessment={mockListeningAssessment} />;
}
