import { useEffect, useRef, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectBuilderDraft,
  selectBuilderIsDirty,
  markSaved,
  setSaving,
} from "@/store/slices/resume-builder.slice";
import { useUpdateBuiltResumeMutation } from "@/services/resume-builder-api";

/**
 * Reusable auto-save hook that watches the draft state and triggers
 * a debounced (500ms) PUT /v1/resume-builder mutation upon changes.
 */
export function useAutoSave() {
  const dispatch = useAppDispatch();
  const draftResume = useAppSelector(selectBuilderDraft);
  const isDirty = useAppSelector(selectBuilderIsDirty);
  const [updateBuiltResume, { isLoading }] = useUpdateBuiltResumeMutation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const draftRef = useRef(draftResume);

  useEffect(() => {
    draftRef.current = draftResume;
  }, [draftResume]);

  const performSave = useCallback(async () => {
    try {
      dispatch(setSaving(true));
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      await updateBuiltResume(draftRef.current).unwrap();
      dispatch(markSaved(timestamp));
    } catch (error) {
      dispatch(setSaving(false));
      console.warn("Auto-save failed:", error);
    }
  }, [updateBuiltResume, dispatch]);

  useEffect(() => {
    if (!isDirty) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      performSave();
    }, 500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isDirty, performSave]);

  return { isSaving: isLoading };
}
