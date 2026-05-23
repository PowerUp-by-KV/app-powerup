import { api } from './api';
import { Platform } from 'react-native';

export interface PracticeSessionStart {
  session_id: string;
}

export interface QuestionOut {
  id: string;
  text: string;
  // optional audio URL if provided later
  audio_url?: string;
}

const getAudioFileForBlob = async (blob: Blob) => {
  const header = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  const startsWith = (...bytes: number[]) => bytes.every((byte, index) => header[index] === byte);
  const hasTextAt = (offset: number, text: string) =>
    [...text].every((char, index) => header[offset + index] === char.charCodeAt(0));

  if (startsWith(0x52, 0x49, 0x46, 0x46) && hasTextAt(8, 'WAVE')) {
    return new File([blob], 'answer.wav', { type: 'audio/wav' });
  }

  if (startsWith(0x1a, 0x45, 0xdf, 0xa3)) {
    return new File([blob], 'answer.webm', { type: 'audio/webm' });
  }

  if (hasTextAt(0, 'OggS')) {
    return new File([blob], 'answer.ogg', { type: 'audio/ogg' });
  }

  if (hasTextAt(4, 'ftyp')) {
    return new File([blob], 'answer.m4a', { type: 'audio/mp4' });
  }

  return new File([blob], 'answer.webm', { type: blob.type || 'audio/webm' });
};

export const practiceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    startPracticeSession: builder.mutation<PracticeSessionStart, void>({
      query: () => ({
        url: '/v1/practice/start',
        method: 'POST',
      }),
    }),
    fetchPracticeQuestions: builder.query<QuestionOut[], string>({
      // sessionId optional, backend may ignore it
      query: (sessionId) => ({
        url: '/v1/practice/questions/start',
        method: 'GET',
        params: { session_id: sessionId },
      }),
    }),
    submitPracticeAnswer: builder.mutation<any, { sessionId?: string; questionId: string; file: any }>({
      queryFn: async ({ sessionId, questionId, file }, _api, _extraOptions, fetchWithBQ) => {
        const form = new FormData();
        form.append('question_id', questionId);
        if (sessionId) form.append('session_id', sessionId);

        if (Platform.OS === 'web') {
          const response = await fetch(file.uri);
          const blob = await response.blob();
          form.append('file', await getAudioFileForBlob(blob));
        } else {
          form.append('file', {
            uri: file.uri,
            name: file.name || 'answer.wav',
            type: file.type || 'audio/wav',
          } as any);
        }

        return fetchWithBQ({
          url: '/v1/practice/answer',
          method: 'POST',
          body: form,
        });
      },
    }),
    generateInterviewReport: builder.mutation<any, string>({
      query: (sessionId) => ({
        url: `/v1/interviews/sessions/${sessionId}/generate-report`,
        method: 'POST',
      }),
    }),
    fetchInterviewPdf: builder.query<Blob, string>({
      query: (sessionId) => ({
        url: `/v1/interviews/report/${sessionId}/pdf`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
    fetchPracticeHistory: builder.query<any, void>({
      query: () => ({
        url: '/v1/practice/history',
        method: 'GET',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useStartPracticeSessionMutation,
  useFetchPracticeQuestionsQuery,
  useSubmitPracticeAnswerMutation,
  useGenerateInterviewReportMutation,
  useFetchInterviewPdfQuery,
  useFetchPracticeHistoryQuery,
} = practiceApi;
