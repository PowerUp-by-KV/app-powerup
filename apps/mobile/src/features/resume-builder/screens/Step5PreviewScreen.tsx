import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useAppDispatch } from "@/store/hooks";
import { setCurrentStep } from "@/store/slices/resume-builder.slice";
import { useAutoSave } from "../hooks/useAutoSave";
import { ResumeReviewView } from "../components/ResumeReviewView";
import { ResumeExportView } from "../components/ResumeExportView";

export function Step5PreviewScreen() {
  const dispatch = useAppDispatch();
  // Local state controls the UI split without touching the router
  const [showExportView, setShowExportView] = useState(false);
  const [useAutoEnhance, setUseAutoEnhance] = useState(false);

  // Preserve autosave at the top level so it runs in both views
  useAutoSave();

  return (
    <View style={styles.container}>
      {showExportView ? (
        <ResumeExportView onBack={() => setShowExportView(false)} useAutoEnhance={useAutoEnhance} />
      ) : (
        <ResumeReviewView
          onContinue={(autoEnhance) => {
            setUseAutoEnhance(autoEnhance);
            setShowExportView(true);
          }}
          onBack={() => dispatch(setCurrentStep(4))}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
