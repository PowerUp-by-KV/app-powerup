import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { RootState } from "@/store";
import {
  updateField,
  nextStep,
  prevStep,
  setStep,
  resetOnboarding,
  type OnboardingState,
} from "@/store/slices/onboardingSlice";
import {
  useGetGroupedQuestionsQuery,
  useSubmitOnboardingMutation,
  useUpdateProfileOnboardingAnswersMutation,
  useLazyGetOnboardingStatusQuery,
  useExtractOnboardingResumeMutation,
  useConfirmOnboardingResumeMutation,
  OnboardingQuestion,
} from "@/services/onboarding-api";
import { useStartSessionMutation, getNextRouteForSection } from "@/services/assessment-api";
import { DynamicOnboardingForm, getWebFileCache } from "./components/DynamicOnboardingForm";
import {
  setProfileCompletedInSession,
  setPreAssessmentCompletedInSession,
  saveAssessmentSessionId,
  getAuthSession,
  getAssessmentSessionId,
  getCompletedSections,
  clearCompletedSections,
  getProfileCompletedInSession,
  saveOnboardingWizardState,
  getOnboardingWizardState,
  clearOnboardingWizardState,
} from "@/services/auth-storage";
import { normalizeBaseUrlForRuntime } from "@/services/api";
import { getApiErrorMessage } from "@/utils/error-message";
import LoaderScreen from "./components/LoaderScreen";
import { OfflineGameView } from "@/components/OfflineGameView";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

export default function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.onboarding);
  const stepNumber = formData.currentStep;

  const [getOnboardingStatus] = useLazyGetOnboardingStatusQuery();
  const {
    data: groupedQuestions,
    isLoading: isFetching,
    isError: onboardingError,
    refetch: refetchQuestions,
  } = useGetGroupedQuestionsQuery();
  const [submitOnboarding, { isLoading: isSubmitting }] = useSubmitOnboardingMutation();
  const [updateProfile] = useUpdateProfileOnboardingAnswersMutation();
  const [startSession, { isLoading: isStarting }] = useStartSessionMutation();
  const [extractResume, { isLoading: isExtracting }] = useExtractOnboardingResumeMutation();
  const [confirmResume, { isLoading: isConfirming }] = useConfirmOnboardingResumeMutation();

  const [isUploading, setIsUploading] = React.useState(false);
  const [resumeUploaded, setResumeUploaded] = React.useState(false);
  const [isCheckingResume, setIsCheckingResume] = React.useState(true);

  const [extractedData, setExtractedData] = React.useState<any | null>(null);
  const [resumeId, setResumeId] = React.useState<string | null>(null);
  const [isReviewMode, setIsReviewMode] = React.useState(false);

  // Load / Restore saved onboarding wizard state when the component mounts
  React.useEffect(() => {
    const restoreWizardState = async () => {
      try {
        const savedState = await getOnboardingWizardState();
        if (savedState) {
          if (savedState.currentStep) {
            dispatch(setStep(savedState.currentStep));
          }
          if (savedState.formData) {
            Object.entries(savedState.formData).forEach(([field, value]) => {
              dispatch(updateField({ field: field as any, value }));
            });
          }
        } else {
          // No saved state means fresh user / new session — reset the in-memory redux slice
          dispatch(resetOnboarding());
        }
      } catch (err) {
        console.warn("Failed to restore onboarding wizard progress:", err);
      }
    };
    restoreWizardState();
  }, [dispatch]);

  // Auto-save wizard progress to local storage on change
  React.useEffect(() => {
    if (
      stepNumber > 1 ||
      Object.values(formData).some((val) => val !== "" && val !== null && val !== undefined)
    ) {
      saveOnboardingWizardState({
        currentStep: stepNumber,
        formData: formData,
      }).catch((err) => console.warn("Failed to auto-save onboarding wizard progress:", err));
    }
  }, [stepNumber, formData]);

  React.useEffect(() => {
    const checkResumeAssessment = async () => {
      try {
        const session = await getAuthSession();
        if (!session?.user?.id) {
          setIsCheckingResume(false);
          return;
        }

        const localOnboardingDone = await getProfileCompletedInSession();
        let onboardingStatus = null;
        try {
          onboardingStatus = await getOnboardingStatus(session.user.id).unwrap();
        } catch (statusErr) {
          console.warn("Failed to check onboarding status in OnboardingScreen:", statusErr);
        }

        const backendOnboardingDone =
          (onboardingStatus?.answers_present ?? false) &&
          (onboardingStatus?.resume_present ?? false);

        // If onboarding is not completed, stay on onboarding screen
        if (!backendOnboardingDone) {
          setIsCheckingResume(false);
          return;
        }

        // Onboarding is completed! Redirect directly to My Learning tab
        router.replace("/(tabs)/my-learning" as never);
        return;
      } catch (err) {
        console.warn("Failed to check onboarding state:", err);
      } finally {
        setIsCheckingResume(false);
      }
    };

    checkResumeAssessment();
  }, [getOnboardingStatus]);

  // Flatten the questions from the API for the step-by-step wizard
  const flattenedQuestions = React.useMemo(() => {
    if (!groupedQuestions) return [];
    return Object.values(groupedQuestions).flat();
  }, [groupedQuestions]);

  const question = flattenedQuestions[stepNumber - 1];

  if (onboardingError && !isFetching) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 w-full items-center justify-center p-6">
          <View className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-sm items-center justify-center">
            <LottieView
              source={require("../../../assets/mascot/Error 404.lottie")}
              autoPlay
              loop
              style={{ width: 140, height: 140, marginBottom: 12 }}
            />

            <Text className="text-slate-900 font-extrabold text-xl text-center mb-2">
              Server Connection Lost
            </Text>
            <Text className="text-slate-500 text-sm text-center leading-5 mb-4 text-center">
              We couldn't connect to the learning server. Please ensure the backend service is
              running and try again.
            </Text>

            {/* Inline Arcade Offline Game (Chrome Dino Style) */}
            <OfflineGameView />

            <View className="w-full gap-3">
              <TouchableOpacity
                onPress={() => refetchQuestions()}
                className="w-full bg-slate-900 active:bg-slate-800 py-4 rounded-xl items-center justify-center shadow-sm"
              >
                <Text className="text-white font-extrabold text-sm">Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isCheckingResume || isFetching) {
    return <LoaderScreen />;
  }

  if (!question && !isFetching) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-8">
          <View className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-6">
            <Text className="text-4xl">🎯</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-900 text-center mb-2">
            Profile Completed!
          </Text>
          <Text className="text-slate-500 text-center text-base mb-10 px-4">
            Your personalized onboarding is finished. You are now ready to begin the core
            assessment.
          </Text>

          <TouchableOpacity
            onPress={() => {
              router.replace("/(tabs)/my-learning" as never);
            }}
            className="w-full max-w-xs py-4 rounded-2xl flex-row items-center justify-center bg-indigo-600 shadow-lg shadow-indigo-200"
          >
            <Text className="text-white font-bold text-lg">Go to My Learning</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => dispatch(prevStep())} className="mt-6 py-2">
            <Text className="text-indigo-600 font-semibold text-base">Review Answers</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleInputChange = (key: string, value: any) => {
    dispatch(updateField({ field: key as keyof OnboardingState, value }));
    if (question?.input_type === "file" && key === question.question_key) {
      setResumeUploaded(false);
    }
  };

  const submitFinalAnswers = async () => {
    if (isSubmitting || isStarting) return;

    try {
      // 1. Build answers payload — API only accepts question_id + answer_text
      // Skip file questions (handled earlier) and empty/skipped questions
      const answersPayload = flattenedQuestions
        .filter((q) => q.input_type !== "file")
        .map((q) => {
          const answerValue = formData[q.question_key];

          let answer_text: string;
          if (answerValue === undefined || answerValue === null || answerValue === "") {
            answer_text = "";
          } else if (Array.isArray(answerValue)) {
            answer_text = answerValue.join(", ");
          } else if (typeof answerValue === "object") {
            answer_text = JSON.stringify(answerValue);
          } else {
            answer_text = String(answerValue);
          }

          return {
            question_id: q.id,
            answer_text,
          };
        })
        .filter((ans) => {
          // Payload filtering: only send answers that are not empty
          return (
            ans.answer_text !== undefined &&
            ans.answer_text !== null &&
            ans.answer_text.trim() !== ""
          );
        });

      // 2. Submit Onboarding Answers with localized retry loop
      let ansRetries = 3;
      while (ansRetries > 0) {
        try {
          await submitOnboarding({ answers: answersPayload }).unwrap();
          break;
        } catch (ansErr) {
          ansRetries--;
          if (ansRetries === 0) throw ansErr;
          await new Promise((res) => setTimeout(res, 1000));
        }
      }

      // 3. Update the standard profile properties in the backend via PUT /api/v1/users/profile
      // to officially complete the profile details.
      try {
        const profilePayload = {
          name: formData.name ? formData.name.trim() : undefined,
          learning_goal: formData.primaryGoal ? formData.primaryGoal.trim() : undefined,
          learning_frequency: formData.dailyTime ? formData.dailyTime.trim() : undefined,
          language: formData.nativeLanguage ? formData.nativeLanguage.trim() : undefined,
          country:
            formData.country && formData.country.trim().length === 2
              ? formData.country.trim()
              : undefined,
        };
        const cleanedPayload = Object.fromEntries(
          Object.entries(profilePayload).filter(([_, v]) => v !== undefined && v !== ""),
        );
        await updateProfile(cleanedPayload).unwrap();
      } catch (profileErr) {
        console.warn("Failed to complete profile via PUT users/profile:", profileErr);
      }

      // 4. Mark profile as completed locally, reset pre-assessment completed flag, clear wizard state and completed pre-assessment sections
      await setProfileCompletedInSession(true);
      await setPreAssessmentCompletedInSession(false);
      await clearCompletedSections();
      await clearOnboardingWizardState();

      // 5. Redirect directly to My Learning tab
      router.replace("/(tabs)/my-learning" as never);
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err, "Submission failed. Please try again."));
    }
  };

  const handleNext = async () => {
    if (!question) return;

    const isFileQuestion = question.input_type === "file";

    // Check required fields
    const answerValue = formData[question.question_key as keyof typeof formData];
    if (question.is_required && !answerValue && !isFileQuestion) {
      Alert.alert("Required", "Please provide an answer to continue.");
      return;
    }

    if (isFileQuestion) {
      const fileUri = formData[question.question_key];
      if (!fileUri) {
        Alert.alert("Required", "Please select a resume to upload.");
        return;
      }

      if (!resumeUploaded) {
        setIsUploading(true);
        try {
          const authSession = await getAuthSession();
          const apiUrl = process.env.EXPO_PUBLIC_API_URL;
          if (!apiUrl) throw new Error("EXPO_PUBLIC_API_URL is not set");
          const rawBase = apiUrl.replace(/\/$/, "");
          const baseUrl = normalizeBaseUrlForRuntime(rawBase);
          const extractUrl = `${baseUrl}/v1/onboarding/resume/extract`;

          const fileName = (formData[`${question.question_key}Name`] || "resume.pdf") as string;
          const fd = new FormData();

          if (Platform.OS === "web") {
            console.log("[OnboardingScreen] Attempting web file upload. fileUri:", fileUri);
            const g = (typeof window !== "undefined" ? window : globalThis) as any;
            const cachedFile = getWebFileCache().get(fileUri) || g.__latestWebFile;
            if (cachedFile) {
              console.log(
                "[OnboardingScreen] Success! Found cachedFile in memory or global fallback:",
                cachedFile,
              );
              fd.append("file", cachedFile);
            } else {
              console.warn(
                "[OnboardingScreen] Warning: cachedFile not found in webFileCache or global fallback. Falling back to fetching blob:",
                fileUri,
              );
              try {
                const r = await fetch(fileUri);
                const blob = await r.blob();
                fd.append("file", new File([blob], fileName, { type: "application/pdf" }));
                console.log("[OnboardingScreen] Fallback successful. Blob fetched and appended.");
              } catch (fetchErr) {
                console.warn(
                  "[OnboardingScreen] Fallback failed! Could not fetch blob URI:",
                  fetchErr,
                );
                throw new Error(
                  "Could not fetch the picked file. Please click 'Change File' and re-select your resume.",
                );
              }
            }
          } else {
            const rnFile = { uri: fileUri, name: fileName, type: "application/pdf" };
            fd.append("file", rnFile as unknown as Blob, fileName);
          }

          // 2. Call extract to parse details from the uploaded resume
          const extractResponse = await fetch(extractUrl, {
            method: "POST",
            headers: authSession?.access_token
              ? {
                  Authorization: `Bearer ${authSession.access_token}`,
                  "X-Tunnel-Skip-AntiPhishing-Page": "true",
                }
              : {
                  "X-Tunnel-Skip-AntiPhishing-Page": "true",
                },
            body: fd,
          });

          if (!extractResponse.ok) {
            throw new Error(`Extraction failed (${extractResponse.status})`);
          }

          const extractData = await extractResponse.json();
          if (extractData?.resume_id && extractData?.parsed_data) {
            console.log("[OnboardingScreen] Resume extracted successfully. Auto-confirming...");
            try {
              await confirmResume({
                resume_id: extractData.resume_id,
                confirmed_data: JSON.stringify(extractData.parsed_data),
              }).unwrap();
              console.log("[OnboardingScreen] Auto-confirm success (200 OK)!");
            } catch (confirmErr) {
              console.warn(
                "[OnboardingScreen] Auto-confirm endpoint failed, but continuing:",
                confirmErr,
              );
            }
          }

          // Advance directly to the next onboarding step, bypassing the review UI entirely as requested
          setResumeUploaded(true);
          setIsUploading(false);
          if (stepNumber < flattenedQuestions.length) {
            dispatch(nextStep());
          } else {
            await submitFinalAnswers();
          }
          return;
        } catch (uploadErr: any) {
          setIsUploading(false);
          Alert.alert(
            "Upload Failed",
            uploadErr?.message || "Could not upload and extract resume. Please try again.",
          );
          return;
        }
      }
    }

    if (stepNumber < flattenedQuestions.length) {
      dispatch(nextStep());
    } else {
      await submitFinalAnswers();
    }
  };

  const handleSkip = async () => {
    if (!question) return;

    if (question.input_type === "file") {
      Alert.alert(
        "Resume Required",
        "Resume upload is a required first step to personalize your onboarding. You cannot skip this step.",
      );
      return;
    }

    // Optionally clear value when skipping
    dispatch(updateField({ field: question.question_key as any, value: "" }));

    if (stepNumber < flattenedQuestions.length) {
      dispatch(nextStep());
    } else {
      await submitFinalAnswers();
    }
  };

  const handleBack = () => {
    if (stepNumber > 1) {
      dispatch(prevStep());
    } else {
      router.back();
    }
  };

  const progress = (stepNumber / flattenedQuestions.length) * 100;
  const isFileQuestion = question?.input_type === "file";

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 40,
          paddingTop: Platform.OS === "android" ? 48 : 20,
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Track Header */}
        <View className="w-32 h-1.5 bg-slate-200 rounded-full mt-2 mb-2 overflow-hidden">
          <View className="h-full bg-slate-600 rounded-full" style={{ width: `${progress}%` }} />
        </View>

        {/* Section Title */}
        <Text className="text-sm font-bold text-slate-800 text-center mb-6">
          {isFileQuestion ? "Upload your Resume" : question?.section || "Self Assessment"}
        </Text>

        {/* Question & Options Card Container */}
        <View
          className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 w-full max-w-md ${
            isFileQuestion ? "mb-4" : "mb-8"
          }`}
        >
          {!isFileQuestion && (
            <Text className="text-base font-bold text-slate-900 mb-4 leading-relaxed">
              {question?.question_text}
            </Text>
          )}

          {question && (
            <DynamicOnboardingForm
              questions={[question]}
              formData={formData}
              onInputChange={handleInputChange}
              hideLabel={true}
            />
          )}
        </View>

        {/* Description paragraph specific to file upload step */}
        {isFileQuestion && (
          <Text className="text-sm text-slate-500 text-center px-4 mb-6 leading-relaxed max-w-md">
            Upload your resume to analyze and enhance your professional profile
          </Text>
        )}

        {/* Bottom Continue Button */}
        <TouchableOpacity
          onPress={handleNext}
          disabled={isSubmitting || isStarting || isUploading}
          className={`py-3.5 px-16 rounded-2xl items-center justify-center shadow-sm ${
            isSubmitting || isStarting || isUploading ? "bg-slate-400" : "bg-slate-700"
          }`}
        >
          {isSubmitting || isStarting || isUploading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" size="small" className="mr-2" />
              <Text className="text-white font-bold text-sm">
                {isUploading ? "Uploading..." : "Processing..."}
              </Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-sm">
              {isFileQuestion && resumeUploaded
                ? "Upload Successful - Continue"
                : isFileQuestion
                  ? "Upload & Continue"
                  : "Continue"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Dynamic Secondary Action Link */}
        {stepNumber > 1 ? (
          <TouchableOpacity onPress={handleBack} className="mt-4 py-2">
            <Text className="text-sm text-slate-400">Go Back</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );

  // Handler to confirm the parsed resume details and proceed
  const handleConfirmAndContinue = async () => {
    if (!resumeId || !extractedData || isConfirming) return;
    setIsUploading(true);
    try {
      await confirmResume({
        resume_id: resumeId,
        confirmed_data: JSON.stringify(extractedData),
      }).unwrap();

      setIsReviewMode(false);
      setIsUploading(false);

      // Proceed to the next step or final submit
      if (stepNumber < flattenedQuestions.length) {
        dispatch(nextStep());
      } else {
        await submitFinalAnswers();
      }
    } catch (confirmErr) {
      setIsUploading(false);
      Alert.alert(
        "Confirmation Failed",
        "Could not confirm your extracted profile details. Please try again.",
      );
    }
  };

  if (isReviewMode && extractedData) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Text className="text-xl font-extrabold text-slate-900 text-center mb-1">
            Review Extracted Profile
          </Text>
          <Text className="text-sm text-slate-400 text-center mb-6">
            We analyzed your resume. Edit or verify the fields below.
          </Text>

          {/* Edit Form */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 w-full max-w-md mb-6">
            {/* Name */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Full Name
              </Text>
              <TextInput
                value={extractedData.contact?.name || ""}
                onChangeText={(val) =>
                  setExtractedData({
                    ...extractedData,
                    contact: { ...extractedData.contact, name: val },
                  })
                }
                placeholder="Enter Full Name"
                placeholderTextColor="#cbd5e1"
                className="w-full bg-slate-50 text-slate-800 px-4 py-2.5 rounded-xl border border-slate-200/60 text-sm font-semibold"
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Email Address
              </Text>
              <TextInput
                value={extractedData.contact?.email || ""}
                onChangeText={(val) =>
                  setExtractedData({
                    ...extractedData,
                    contact: { ...extractedData.contact, email: val },
                  })
                }
                placeholder="Enter Email"
                placeholderTextColor="#cbd5e1"
                className="w-full bg-slate-50 text-slate-800 px-4 py-2.5 rounded-xl border border-slate-200/60 text-sm font-semibold"
              />
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Phone Number
              </Text>
              <TextInput
                value={extractedData.contact?.phone || ""}
                onChangeText={(val) =>
                  setExtractedData({
                    ...extractedData,
                    contact: { ...extractedData.contact, phone: val },
                  })
                }
                placeholder="Enter Phone Number"
                placeholderTextColor="#cbd5e1"
                className="w-full bg-slate-50 text-slate-800 px-4 py-2.5 rounded-xl border border-slate-200/60 text-sm font-semibold"
              />
            </View>

            {/* Summary */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Professional Summary
              </Text>
              <TextInput
                value={extractedData.summary || ""}
                onChangeText={(val) => setExtractedData({ ...extractedData, summary: val })}
                placeholder="Enter Summary"
                placeholderTextColor="#cbd5e1"
                multiline
                numberOfLines={3}
                className="w-full bg-slate-50 text-slate-800 px-4 py-2.5 rounded-xl border border-slate-200/60 text-sm font-semibold min-h-[80px]"
              />
            </View>

            {/* Skills */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Key Skills (comma-separated)
              </Text>
              <TextInput
                value={Array.isArray(extractedData.skills) ? extractedData.skills.join(", ") : ""}
                onChangeText={(val) =>
                  setExtractedData({
                    ...extractedData,
                    skills: val.split(",").map((s: string) => s.trim()),
                  })
                }
                placeholder="Enter Skills"
                placeholderTextColor="#cbd5e1"
                className="w-full bg-slate-50 text-slate-800 px-4 py-2.5 rounded-xl border border-slate-200/60 text-sm font-semibold"
              />
            </View>

            {/* Education Institution */}
            <View className="mb-2">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                College/University
              </Text>
              <TextInput
                value={extractedData.education?.[0]?.institution || ""}
                onChangeText={(val) => {
                  const newEdu = [...(extractedData.education || [])];
                  if (newEdu.length === 0) {
                    newEdu.push({ institution: val });
                  } else {
                    newEdu[0] = { ...newEdu[0], institution: val };
                  }
                  setExtractedData({ ...extractedData, education: newEdu });
                }}
                placeholder="Enter Institution"
                placeholderTextColor="#cbd5e1"
                className="w-full bg-slate-50 text-slate-800 px-4 py-2.5 rounded-xl border border-slate-200/60 text-sm font-semibold"
              />
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirmAndContinue}
            disabled={isUploading || isConfirming}
            className="w-full max-w-md py-4 rounded-2xl items-center justify-center bg-indigo-600 shadow-lg shadow-indigo-100 active:bg-indigo-700"
          >
            {isUploading || isConfirming ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-extrabold text-sm">Confirm & Submit</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
