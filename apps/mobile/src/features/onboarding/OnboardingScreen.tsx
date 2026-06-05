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
  useExtractOnboardingResumeMutation,
  useConfirmOnboardingResumeMutation,
  useGetOnboardingStatusQuery,
} from "@/services/onboarding-api";
import { useGetProfileQuery } from "@/services/auth-api";
import { useStartSessionMutation } from "@/services/assessment-api";
import { LinearGradient } from "expo-linear-gradient";
import { DynamicOnboardingForm } from "./components/DynamicOnboardingForm";
import {
  setProfileCompletedInSession,
  setPreAssessmentCompletedInSession,
  clearCompletedSections,
  saveLocalOnboardingAnswers,
} from "@/services/auth-storage";
import { getApiErrorMessage } from "@/utils/error-message";
import LoaderScreen from "./components/LoaderScreen";
import { OfflineGameView } from "@/components/OfflineGameView";
import LottieView from "lottie-react-native";
import { Feather } from "@expo/vector-icons";
import companyEmployees from "../../../assets/mascot/company-employees.json";

export default function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.onboarding);
  const stepNumber = formData.currentStep;

  const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery();
  const {
    data: groupedQuestions,
    isLoading: isFetching,
    isError: onboardingError,
    refetch: refetchQuestions,
  } = useGetGroupedQuestionsQuery();
  const [submitOnboarding, { isLoading: isSubmitting }] = useSubmitOnboardingMutation();
  const [extractResume] = useExtractOnboardingResumeMutation();
  const [confirmResume] = useConfirmOnboardingResumeMutation();
  const [, { isLoading: isStarting }] = useStartSessionMutation();

  const { data: onboardingStatus, isLoading: isOnboardingStatusLoading } =
    useGetOnboardingStatusQuery(profile?.id ?? "", {
      skip: !profile?.id,
    });

  const [isUploading, setIsUploading] = React.useState(false);
  const [resumeUploaded, setResumeUploaded] = React.useState(false);
  const [isCheckingResume, setIsCheckingResume] = React.useState(true);

  React.useEffect(() => {
    if (isProfileLoading || isOnboardingStatusLoading) return;

    const checkResumeAssessment = async () => {
      try {
        const isOnboardingComplete = onboardingStatus?.answers_present ?? false;

        // If the user profile is not loaded or onboarding is not completed, let them stay
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
  }, [profile, isProfileLoading, onboardingStatus, isOnboardingStatusLoading]);

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
                className="w-full bg-blue-500 active:bg-blue-600 py-4 rounded-2xl items-center justify-center shadow-sm"
              >
                <Text className="text-white font-extrabold text-sm">Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isCheckingResume || isFetching || isProfileLoading || isOnboardingStatusLoading) {
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

      // 2.5 Save answers to SecureStore for EditProfileScreen local fallback
      try {
        if (groupedQuestions) {
          const answersGroupedWithAnswers: Record<string, any[]> = {};
          Object.entries(groupedQuestions).forEach(([sectionName, questionsList]) => {
            answersGroupedWithAnswers[sectionName] = questionsList.map((q) => {
              const answerValue = formData[q.question_key as keyof typeof formData];
              let answer_text = "";
              if (answerValue !== undefined && answerValue !== null && answerValue !== "") {
                if (Array.isArray(answerValue)) {
                  answer_text = answerValue.join(", ");
                } else if (typeof answerValue === "object") {
                  answer_text = JSON.stringify(answerValue);
                } else {
                  answer_text = String(answerValue);
                }
              }
              return {
                ...q,
                answer_text,
              };
            });
          });
          await saveLocalOnboardingAnswers(answersGroupedWithAnswers);
        }
      } catch (saveErr) {
        console.warn("Failed to save local onboarding answers copy:", saveErr);
      }

      // 3. Mark profile as completed locally, reset pre-assessment completed flag, and clear completed pre-assessment sections
      await setProfileCompletedInSession(true);
      await setPreAssessmentCompletedInSession(false);
      await clearCompletedSections();

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
          const fileName = (formData[`${question.question_key}Name`] || "resume.pdf") as string;
          const fd = new FormData();

          if (Platform.OS === "web") {
            const r = await fetch(fileUri);
            const blob = await r.blob();
            fd.append("file", new File([blob], fileName, { type: "application/pdf" }));
          } else {
            // React Native FormData accepts an object with { uri, name, type }
            // even though the standard DOM FormData type does not. Cast through
            // unknown to a Blob shape so TypeScript is satisfied without `any`.
            const rnFile = { uri: fileUri, name: fileName, type: "application/pdf" };
            fd.append("file", rnFile as unknown as Blob, fileName);
          }

          // 1. Extract resume data and save file
          const extractRes = await extractResume(fd).unwrap();
          const resumeId = extractRes?.resume_id;
          const parsedData = extractRes?.parsed_data;

          // 2. Confirm immediately using the extracted parsed data
          if (resumeId && parsedData) {
            await confirmResume({
              resume_id: resumeId,
              confirmed_data: JSON.stringify(parsedData),
            }).unwrap();
          }

          setResumeUploaded(true);
          setIsUploading(false);
          // Only proceed after successful upload
          if (stepNumber < flattenedQuestions.length) {
            dispatch(nextStep());
          } else {
            await submitFinalAnswers();
          }
          return;
        } catch (err) {
          setIsUploading(false);
          Alert.alert(
            "Upload Failed",
            getApiErrorMessage(err, "Could not upload and extract your resume. Please try again."),
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
        {/* Top Navigation & Progress Bar Row */}
        <View className="flex-row items-center w-full max-w-md px-1 mb-6">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 items-center justify-center shadow-sm active:opacity-80"
          >
            <Feather name="arrow-left" size={18} color="#64748b" />
          </TouchableOpacity>
          <View className="flex-1 h-2 bg-slate-200/80 rounded-full ml-4 overflow-hidden">
            <LinearGradient
              colors={["#3b82f6", "#22c55e"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${progress}%` }}
              className="h-full rounded-full"
            />
          </View>
        </View>

        {/* Section Title */}
        <Text className="text-xs font-extrabold text-slate-400 tracking-widest uppercase text-center mb-1.5">
          {isFileQuestion ? "Upload your Resume" : question?.section || "Self Assessment"}
        </Text>

        {/* Question Text */}
        {!isFileQuestion && (
          <Text className="text-[20px] font-extrabold text-slate-900 text-center px-4 mb-4 leading-snug max-w-md">
            {question?.question_text}
          </Text>
        )}

        {/* Loopable Mascot Animation */}
        {!isFileQuestion && (
          <View className="items-center justify-center my-2">
            <LottieView
              source={companyEmployees}
              autoPlay
              loop
              style={{ width: 220, height: 160 }}
            />
          </View>
        )}

        {/* Main Options / Input Fields */}
        <View className={`w-full mb-6 ${isFileQuestion ? "max-w-xl" : "max-w-md"}`}>
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
          <Text className="text-sm font-semibold text-slate-400 text-center px-6 mb-8 leading-relaxed max-w-xl">
            Upload your resume to analyze and enhance your professional profile
          </Text>
        )}

        {/* Bottom Continue Button */}
        <TouchableOpacity
          onPress={handleNext}
          disabled={isSubmitting || isStarting || isUploading}
          className={`py-4 w-full rounded-2xl items-center justify-center shadow-md active:opacity-90 transition-all ${
            isFileQuestion ? "max-w-xl" : "max-w-md"
          } ${isSubmitting || isStarting || isUploading ? "bg-slate-300" : "bg-blue-500"}`}
        >
          {isSubmitting || isStarting || isUploading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" size="small" className="mr-2" />
              <Text className="text-white font-extrabold text-sm">
                {isUploading ? "Uploading..." : "Processing..."}
              </Text>
            </View>
          ) : (
            <Text className="text-white font-extrabold text-sm">
              {isFileQuestion && resumeUploaded
                ? "Upload Successful - Continue"
                : isFileQuestion
                  ? "Upload & Continue"
                  : "Continue"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Secondary Navigation Actions */}
        {isFileQuestion ? (
          <TouchableOpacity onPress={handleSkip} className="mt-5 py-2">
            <Text className="text-sm font-bold text-slate-400 hover:text-slate-500 transition-colors">
              Skip for now
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
