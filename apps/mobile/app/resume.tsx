import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Step0ChooseMethod } from "@/features/resume-builder/screens/Step0ChooseMethod";
import { Step0UploadResume } from "@/features/resume-builder/screens/Step0UploadResume";

export default function ResumeRoute() {
  const router = useRouter();
  const [step, setStep] = useState<"choose" | "upload">("choose");

  const handleNextChoose = (method: "upload" | "scratch") => {
    if (method === "upload") {
      setStep("upload");
    } else {
      router.push("/resume/builder?mode=scratch");
    }
  };

  const handleNextUpload = () => {
    // Navigate to score screen after upload is done
    router.push("/resume/score");
  };

  if (step === "choose") {
    return <Step0ChooseMethod onNext={handleNextChoose} onBack={() => router.back()} />;
  }

  if (step === "upload") {
    return <Step0UploadResume onNext={handleNextUpload} onBack={() => setStep("choose")} />;
  }

  return null;
}
