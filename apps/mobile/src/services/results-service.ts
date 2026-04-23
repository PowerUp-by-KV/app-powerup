export interface AssessmentResult {
  id: string;
  title: string;
  percentage: number;
  score: number;
  totalMarks: number;
  obtainedMarks: number;
  isPassed: boolean;
  type?: string;
}

const storedResults: Record<string, AssessmentResult> = {};

export function getAllResults(): Record<string, AssessmentResult> {
  return storedResults;
}

export function getOverallStats(): {
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  isPassed: boolean;
} {
  const results = Object.values(storedResults);
  const totalMarks = results.reduce((sum, result) => sum + result.totalMarks, 0);
  const obtainedMarks = results.reduce((sum, result) => sum + result.score, 0);
  const percentage = totalMarks === 0 ? 0 : Math.round((obtainedMarks / totalMarks) * 100);
  return {
    totalMarks,
    obtainedMarks,
    percentage,
    isPassed: percentage >= 60,
  };
}

export function setAssessmentResult(result: AssessmentResult): void {
  storedResults[result.id] = result;
}
