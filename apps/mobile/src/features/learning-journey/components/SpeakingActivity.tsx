import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";

import type { ActivityQuestion } from "@powerup/shared";

import { useSubmitSpeakingAnswerMutation } from "@/services/module-api";

export interface SpeakingActivityResult {
  passed: boolean;
  score: number;
}

interface SpeakingActivityProps {
  activityId: string;
  questions: ActivityQuestion[];
  onComplete: (result: SpeakingActivityResult) => void;
}

interface Breakdown {
  fluency?: number;
  vocab?: number;
  grammar?: number;
  feedback?: string;
}

/**
 * Record → submit → AI score. One prompt per activity. Score breakdown is
 * read from the backend's response_data / score_breakdown payload when present.
 */
export function SpeakingActivity({ activityId, questions, onComplete }: SpeakingActivityProps) {
  const prompt = questions[0];
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreView, setScoreView] = useState<{
    score: number;
    passed: boolean;
    breakdown: Breakdown;
  } | null>(null);

  const [submitSpeaking] = useSubmitSpeakingAnswerMutation();

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    if (isRecording) {
      id = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      recordingRef.current?.stopAndUnloadAsync().catch(() => undefined);
      recordingRef.current = null;
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError("Microphone permission required to record.");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setElapsed(0);
    } catch {
      setError("Couldn't start recording. Please try again.");
    }
  };

  const stopAndSubmit = async () => {
    const rec = recordingRef.current;
    if (!rec) return;
    setIsRecording(false);
    try {
      await rec.stopAndUnloadAsync();
    } catch {
      // already stopped
    }
    const uri = rec.getURI();
    recordingRef.current = null;
    if (!uri) {
      setError("Recording file not found.");
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("activity_id", activityId);
      form.append("question_id", prompt?.id ?? "");
      // RN multipart file shape — DO NOT set Content-Type manually anywhere.
      form.append("file", {
        uri,
        name: "speaking.m4a",
        type: "audio/m4a",
      } as unknown as Blob);

      const res = await submitSpeaking(form).unwrap();
      const score = Number(res?.score ?? 0);
      const passed = score >= 70;
      const breakdown: Breakdown =
        (res as unknown as { score_breakdown?: Breakdown }).score_breakdown ?? {};
      setScoreView({ score, passed, breakdown });
    } catch {
      setError("Scoring failed. Tap retry to send again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (scoreView) {
    return (
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <Text className="text-slate-900 text-xl font-bold mb-2">Your speaking score</Text>
        <Text
          style={{
            fontSize: 48,
            fontWeight: "800",
            color: scoreView.passed ? "#16a34a" : "#dc2626",
          }}
        >
          {scoreView.score}
        </Text>
        <Text className="text-slate-500 mb-6">
          {scoreView.passed ? "Great work — you passed." : "Below 70% — try again for the bonus."}
        </Text>
        {Object.entries(scoreView.breakdown).map(([k, v]) =>
          k === "feedback" ? (
            <Text key={k} style={{ marginTop: 8, color: "#475569" }}>
              {String(v)}
            </Text>
          ) : typeof v === "number" ? (
            <View
              key={k}
              style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}
            >
              <Text style={{ color: "#334155", textTransform: "capitalize" }}>{k}</Text>
              <Text style={{ color: "#0f172a", fontWeight: "600" }}>{v}</Text>
            </View>
          ) : null,
        )}
        <Pressable
          onPress={() => onComplete({ passed: scoreView.passed, score: scoreView.score })}
          style={{
            marginTop: 24,
            backgroundColor: "#0f172a",
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Continue</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
      <Text className="text-xs uppercase tracking-wider text-slate-500 mb-2">Speaking</Text>
      <Text className="text-slate-900 text-lg font-bold mb-4">{prompt?.question_text ?? ""}</Text>

      {(prompt?.criteria ?? []).length > 0 ? (
        <View
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: 10,
            padding: 14,
            marginBottom: 24,
          }}
        >
          <Text className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            You'll be scored on
          </Text>
          {(prompt?.criteria ?? []).map((c, i) => (
            <Text key={i} style={{ color: "#475569", marginBottom: 4 }}>
              • {c}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={{ alignItems: "center", marginTop: 24 }}>
        {submitting ? (
          <View style={{ alignItems: "center" }}>
            <ActivityIndicator size="large" color="#2f95dc" />
            <Text style={{ marginTop: 12, color: "#475569" }}>Analyzing your answer…</Text>
          </View>
        ) : (
          <>
            <Pressable
              onPress={isRecording ? stopAndSubmit : startRecording}
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: isRecording ? "#dc2626" : "#0f172a",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name={isRecording ? "square" : "mic"} size={36} color="#fff" />
            </Pressable>
            <Text style={{ marginTop: 12, color: "#64748b" }}>
              {isRecording ? `Recording… ${elapsed}s — tap to stop` : "Tap to record"}
            </Text>
          </>
        )}
      </View>

      {error ? (
        <Text style={{ marginTop: 16, color: "#dc2626", textAlign: "center" }}>{error}</Text>
      ) : null}
    </ScrollView>
  );
}
