import React from "react";

import type { Activity, ActivityQuestion } from "@powerup/shared";

import { ListeningActivity } from "./ListeningActivity";
import { McqActivity, McqActivityResult } from "./McqActivity";
import { SpeakingActivity, SpeakingActivityResult } from "./SpeakingActivity";
import { WritingActivity, WritingActivityResult } from "./WritingActivity";

export type ActivityResult = McqActivityResult | SpeakingActivityResult | WritingActivityResult;

interface ActivityRendererProps {
  activity: Activity;
  questions: ActivityQuestion[];
  /** Fires once the user has finished the activity (or failed and chose to move on). */
  onComplete: (result: ActivityResult) => void;
}

/**
 * Dispatches an activity to the correct renderer based on its skill field.
 * Reading, vocabulary, and grammar all fall through to `McqActivity`.
 */
export function ActivityRenderer({ activity, questions, onComplete }: ActivityRendererProps) {
  const skill = String(activity.skill_type ?? activity.skill ?? "").toLowerCase();
  const hasAudio = questions.some((q) => !!q.audio_url);

  if (skill === "speaking") {
    return (
      <SpeakingActivity activityId={activity.id} questions={questions} onComplete={onComplete} />
    );
  }
  if (skill === "listening" || hasAudio) {
    return <ListeningActivity questions={questions} onComplete={onComplete} />;
  }
  if (skill === "writing") {
    return (
      <WritingActivity activityId={activity.id} questions={questions} onComplete={onComplete} />
    );
  }
  return <McqActivity questions={questions} onComplete={onComplete} />;
}
