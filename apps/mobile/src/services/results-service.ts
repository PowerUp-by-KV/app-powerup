// Types for Results
export type AssessmentResult = {
  type: "reading" | "listening" | "writing";
  title: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  isPassed: boolean;
};

export type AllResults = {
  reading?: AssessmentResult;
  listening?: AssessmentResult;
  writing?: AssessmentResult;
};

// In-memory storage for results (reset on each session)
let results: AllResults = {};

export const setAssessmentResult = (result: AssessmentResult) => {
  results[result.type] = result;
};

export const getAllResults = (): AllResults => {
  return results;
};

export const clearResults = () => {
  results = {};
};

export const getOverallStats = () => {
  const resultsArray = Object.values(results).filter(Boolean) as AssessmentResult[];
  
  if (resultsArray.length === 0) {
    return { totalMarks: 0, obtainedMarks: 0, percentage: 0, isPassed: false };
  }

  const totalMarks = resultsArray.reduce((sum, r) => sum + r.totalMarks, 0);
  const obtainedMarks = resultsArray.reduce((sum, r) => sum + r.obtainedMarks, 0);
  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
  const isPassed = resultsArray.every(r => r.isPassed);

  return { totalMarks, obtainedMarks, percentage, isPassed };
};

export const isAllAssessmentsComplete = (): boolean => {
  return !!results.reading && !!results.listening && !!results.writing;
};
