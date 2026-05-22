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
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { RootState } from "@/store";
import {
  updateField,
  nextStep,
  prevStep,
  type OnboardingState,
} from "@/store/slices/onboardingSlice";
import {
  useGetGroupedQuestionsQuery,
  useSubmitOnboardingMutation,
} from "@/services/onboarding-api";
import { useGetProfileQuery } from "@/services/auth-api";
import { useStartSessionMutation, getNextRouteForSection } from "@/services/assessment-api";
import { DynamicOnboardingForm } from "./components/DynamicOnboardingForm";
import {
  setProfileCompletedInSession,
  saveAssessmentSessionId,
  getAuthSession,
  getAssessmentSessionId,
  getCompletedSections,
  clearCompletedSections,
  getProfileCompletedInSession,
} from "@/services/auth-storage";
import { normalizeBaseUrlForRuntime } from "@/services/api";
import { getApiErrorMessage } from "@/utils/error-message";
import LoaderScreen from "./components/LoaderScreen";

export default function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.onboarding);
  const stepNumber = formData.currentStep;

  const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery();
  const { data: groupedQuestions, isLoading: isFetching } = useGetGroupedQuestionsQuery();
  const [submitOnboarding, { isLoading: isSubmitting }] = useSubmitOnboardingMutation();
  const [startSession, { isLoading: isStarting }] = useStartSessionMutation();

  const [isUploading, setIsUploading] = React.useState(false);
  const [resumeUploaded, setResumeUploaded] = React.useState(false);
  const [isCheckingResume, setIsCheckingResume] = React.useState(true);

  React.useEffect(() => {
    if (isProfileLoading) return;

    const checkResumeAssessment = async () => {
      try {
        const localOnboardingDone = await getProfileCompletedInSession();
        const isOnboardingComplete = profile?.profile_completed || localOnboardingDone;

        // If the user profile is not loaded or onboarding is not completed, DO NOT start any assessment session!
        if (!profile || !isOnboardingComplete) {
          setIsCheckingResume(false);
          return;
        }

        // Onboarding is completed! Redirect directly to My Learning tab
        router.replace("/my-learning" as any);
        return;
      } catch (err) {
        console.warn("Failed to check onboarding state:", err);
      } finally {
        setIsCheckingResume(false);
      }
    };

    checkResumeAssessment();
  }, [profile, isProfileLoading]);

  // Flatten the questions from the API for the step-by-step wizard
  const flattenedQuestions = React.useMemo(() => {
    if (!groupedQuestions) return [];
    return Object.values(groupedQuestions).flat();
  }, [groupedQuestions]);

  const question = flattenedQuestions[stepNumber - 1];

  if (isCheckingResume || isFetching || isProfileLoading) {
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
              router.replace("/my-learning" as any);
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

      // 3. Mark profile as completed locally
      await setProfileCompletedInSession(true);

      // 4. Redirect directly to My Learning tab
      router.replace("/my-learning" as any);
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
          const uploadUrl = `${baseUrl}/v1/onboarding/resume`;

          const fileName = (formData[`${question.question_key}Name`] || "resume.pdf") as string;
          const fd = new FormData();

          if (Platform.OS === "web") {
            const r = await fetch(fileUri);
            const blob = await r.blob();
            fd.append("file", new File([blob], fileName, { type: "application/pdf" }));
          } else {
            fd.append("file", { uri: fileUri, name: fileName, type: "application/pdf" } as any);
          }

          const response = await fetch(uploadUrl, {
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

          // 2xx = explicit success
          // 5xx = backend server/parsing error — file was transmitted, treat as accepted
          //        (500 = parser crash, 504 = AI timeout, 502/503 = gateway issues)
          // 4xx = real client errors (wrong format, too large, unauthorized) — block
          const isClientError = response.status >= 400 && response.status < 500;
          if (isClientError) {
            const errBody = await response.json().catch(() => ({ detail: "Upload rejected" }));
            const msg = errBody?.detail || `Upload rejected (${response.status})`;
            throw new Error(msg);
          }
          // For 5xx: proceed with a console warning — the backend is the problem, not the user

          setResumeUploaded(true);
          setIsUploading(false);
          // Only proceed after successful upload
          if (stepNumber < flattenedQuestions.length) {
            dispatch(nextStep());
          } else {
            await submitFinalAnswers();
          }
          return;
        } catch (uploadErr) {
          setIsUploading(false);
          Alert.alert(
            "Upload Failed",
            "Could not upload resume. Please check your connection and try again.",
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
        {isFileQuestion ? (
          <TouchableOpacity onPress={handleSkip} className="mt-4 py-2">
            <Text className="text-sm text-slate-400">Skip for now</Text>
          </TouchableOpacity>
        ) : stepNumber > 1 ? (
          <TouchableOpacity onPress={handleBack} className="mt-4 py-2">
            <Text className="text-sm text-slate-400">Go Back</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
