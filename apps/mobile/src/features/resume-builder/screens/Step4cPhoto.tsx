import React from "react";
import { StyleSheet, View } from "react-native";
import { WizardHeader } from "../components/WizardHeader";
import { WizardFooterCTA } from "../components/WizardFooterCTA";
import { PhotoUploader } from "../components/PhotoUploader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectBuilderPhotoUrl, setPhotoUrl } from "@/store/slices/resume-builder.slice";

interface Step4cPhotoProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step4cPhoto({ onNext, onBack }: Step4cPhotoProps) {
  const dispatch = useAppDispatch();
  const photoUrl = useAppSelector(selectBuilderPhotoUrl);

  const handlePhotoUploaded = (url: string | null) => {
    dispatch(setPhotoUrl(url));
  };

  return (
    <View style={styles.container}>
      <WizardHeader
        title="Upload your Passport size photo"
        onBack={onBack}
        currentSubStep={3}
        totalSubSteps={5}
      />

      <View style={styles.content}>
        <PhotoUploader photoUrl={photoUrl} onPhotoUploaded={handlePhotoUploaded} />
      </View>

      <WizardFooterCTA
        onNext={onNext}
        nextLabel={photoUrl ? "Continue" : "Skip Photo"}
        onSkip={onBack}
        skipLabel="← Back"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
});
