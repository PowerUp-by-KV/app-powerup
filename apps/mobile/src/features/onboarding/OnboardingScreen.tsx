/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { useSafeBack } from "@/hooks/useSafeBack";
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
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Circle,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import companyEmployees from "../../../assets/mascot/company-employees.json";
import { showAlert } from "@/utils/alert";

export default function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const safeBack = useSafeBack();
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
        router.replace("/(tabs)" as any);
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
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
        className="bg-slate-50 dark:bg-[#0e0e11]"
      >
        <View className="flex-1 w-full items-center justify-center p-6">
          <View className="w-full max-w-sm bg-white dark:bg-[#1E1F2A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm items-center justify-center">
            <View
              style={{
                width: 140,
                height: 140,
                marginBottom: 12,
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LottieView
                source={require("../../../assets/mascot/Error 404.lottie")}
                autoPlay
                loop
                style={{ width: "100%", height: "100%" }}
              />
            </View>

            <Text className="text-slate-900 dark:text-white font-extrabold text-xl text-center mb-2">
              Server Connection Lost
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm text-center leading-5 mb-4 text-center">
              We couldn't connect to the learning server. Please ensure the backend service is
              running and try again.
            </Text>

            {/* Inline Arcade Offline Game (Chrome Dino Style) */}
            <OfflineGameView />

            <View className="w-full gap-3">
              <TouchableOpacity
                onPress={() => refetchQuestions()}
                className="w-full bg-blue-500 active:bg-blue-600 dark:bg-blue-600 py-4 rounded-2xl items-center justify-center shadow-sm"
              >
                <Text className="text-white font-extrabold text-sm">Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (isCheckingResume || isFetching || isProfileLoading || isOnboardingStatusLoading) {
    return <LoaderScreen />;
  }

  if (!question && !isFetching) {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
        className="bg-white"
      >
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
              router.replace("/(tabs)" as any);
            }}
            className="w-full max-w-xs py-4 rounded-2xl flex-row items-center justify-center bg-indigo-600"
          >
            <Text className="text-white font-bold text-lg">Go to My Learning</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => dispatch(prevStep())} className="mt-6 py-2">
            <Text className="text-indigo-600 font-semibold text-base">Review Answers</Text>
          </TouchableOpacity>
        </View>
      </View>
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
      // Include skipped file questions as empty strings, but omit uploaded files (handled earlier)
      const answersPayload = flattenedQuestions
        .map((q) => {
          const answerValue = formData[q.question_key];

          let answer_text: any; // Allow null
          if (
            answerValue === undefined ||
            answerValue === null ||
            answerValue === "" ||
            answerValue === "null"
          ) {
            answer_text = null;
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
            input_type: q.input_type,
          };
        })
        .filter((ans) => {
          // If it's a file question and was skipped, send null
          if (ans.input_type === "file" && ans.answer_text === null) {
            return true;
          }
          // Omit file questions that have local file URIs (they were uploaded via resume endpoints)
          if (ans.input_type === "file") {
            return false;
          }
          // For everything else, only send answers that are not empty
          return (
            ans.answer_text !== undefined && ans.answer_text !== null && ans.answer_text !== ""
          );
        })
        .map(({ question_id, answer_text }) => ({ question_id, answer_text }));

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
      router.replace("/(tabs)" as any);
    } catch (err) {
      showAlert("Error", getApiErrorMessage(err, "Submission failed. Please try again."));
    }
  };

  const handleNext = async () => {
    if (!question) return;

    const isFileQuestion = question.input_type === "file";

    // Check required fields
    const answerValue = formData[question.question_key as keyof typeof formData];
    if (question.is_required && !answerValue && !isFileQuestion) {
      showAlert("Required", "Please provide an answer to continue.");
      return;
    }

    if (isFileQuestion) {
      const fileUri = formData[question.question_key];
      if (!fileUri) {
        showAlert("Required", "Please select a resume to upload.");
        return;
      }

      if (!resumeUploaded) {
        setIsUploading(true);
        try {
          const fileName = (formData[`${question.question_key}Name`] || "resume.pdf") as string;
          const fd = new FormData();

          const fileType = (formData[`${question.question_key}Type`] ||
            "application/pdf") as string;
          if (Platform.OS === "web") {
            const r = await fetch(fileUri);
            const blob = await r.blob();
            fd.append("file", new File([blob], fileName, { type: fileType }));
          } else {
            // React Native FormData accepts an object with { uri, name, type }
            // even though the standard DOM FormData type does not. Cast through
            // unknown to avoid the mismatch without using `any`.
            fd.append("file", { uri: fileUri, name: fileName, type: fileType } as unknown as Blob);
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
        } catch {
          setIsUploading(false);
          showAlert(
            "Upload Failed",
            "Could not upload and extract your resume. You can try again or continue onboarding without it.",
            [
              { text: "Try Again", style: "cancel" },
              {
                text: "Continue Without Resume",
                onPress: async () => {
                  // Clear the file answer so we proceed with only questionnaire answers
                  dispatch(
                    updateField({
                      field: question.question_key as any,
                      value: "",
                    }),
                  );
                  setResumeUploaded(false);
                  if (stepNumber < flattenedQuestions.length) {
                    dispatch(nextStep());
                  } else {
                    await submitFinalAnswers();
                  }
                },
              },
            ],
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

    dispatch(updateField({ field: question.question_key as any, value: "null" }));
    if (question.input_type === "file") {
      setResumeUploaded(false);
    }

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
      safeBack();
    }
  };

  const progress = (stepNumber / flattenedQuestions.length) * 100;
  const isFileQuestion = question?.input_type === "file";

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="bg-slate-50 dark:bg-[#151620] relative"
    >
      {/* Background Vector Shapes - Neat intersecting circles as per mockup */}
      <Svg height="100%" width="100%" style={{ position: "absolute", top: 0, left: 0 }}>
        <Defs>
          <SvgLinearGradient id="bottomRightGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={isDark ? "#283438" : "#dcfce7"} stopOpacity="1" />
            <Stop offset="1" stopColor={isDark ? "#171e22" : "#f0fdf4"} stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="bottomLeftGrad" x1="1" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={isDark ? "#2d334a" : "#dbeafe"} stopOpacity="1" />
            <Stop offset="1" stopColor={isDark ? "#1a1f30" : "#eff6ff"} stopOpacity="1" />
          </SvgLinearGradient>
          <RadialGradient id="topLeftGrad" cx="0%" cy="0%" rx="80%" ry="80%">
            <Stop offset="0" stopColor={isDark ? "#38295c" : "#f3e8ff"} stopOpacity="0.5" />
            <Stop offset="1" stopColor={isDark ? "#151620" : "#ffffff"} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Top Left Soft Glow */}
        <Circle cx={0} cy={0} r={Math.min(width * 0.6, 300)} fill="url(#topLeftGrad)" />

        {/* Bottom Left Circle (Blueish) */}
        <Circle
          cx={-20}
          cy={height - 150}
          r={Math.min(width * 0.45, 220)}
          fill="url(#bottomLeftGrad)"
        />

        {/* Bottom Right Circle (Greenish) - Rendered after to overlap left circle */}
        <Circle
          cx={width + 20}
          cy={height - 50}
          r={Math.min(width * 0.5, 280)}
          fill="url(#bottomRightGrad)"
        />
      </Svg>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 40,
          paddingTop: Platform.OS === "android" ? 48 : 20,
          alignItems: "center",
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top and Middle Content Wrapper */}
        <View className="flex-1 w-full items-center">
          {/* Top Navigation & Progress Bar Row */}
          <View className="flex-row items-center w-full max-w-md px-1 mb-6">
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 items-center justify-center shadow-sm active:opacity-80 z-10"
            >
              <Feather name="arrow-left" size={18} color="#64748b" />
            </TouchableOpacity>
            <View className="flex-1 h-2 bg-slate-200/80 dark:bg-slate-700/80 rounded-full ml-4 overflow-hidden">
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
          <Text className="text-xs font-extrabold text-slate-400 tracking-widest uppercase text-center mb-1.5 z-10">
            {isFileQuestion ? "Upload your Resume" : question?.section || "Self Assessment"}
          </Text>

          {/* Question Text */}
          {!isFileQuestion && (
            <Text className="text-[20px] font-extrabold text-slate-900 dark:text-white text-center px-4 mb-4 leading-snug max-w-md z-10">
              {question?.question_text}
            </Text>
          )}

          {/* Loopable Mascot Animation */}
          {!isFileQuestion && (
            <View className="items-center justify-center my-2 z-10">
              <LottieView
                source={companyEmployees}
                autoPlay
                loop
                style={{ width: 220, height: 160 }}
              />
            </View>
          )}

          {/* Main Options / Input Fields */}
          <View className={`w-full mb-6 z-10 ${isFileQuestion ? "max-w-xl" : "max-w-md"}`}>
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
            <Text className="text-sm font-semibold text-slate-400 dark:text-slate-500 text-center px-6 mb-8 leading-relaxed max-w-xl z-10">
              Upload your resume to analyze and enhance your professional profile
            </Text>
          )}
        </View>

        {/* Bottom Continue Button */}
        <TouchableOpacity
          onPress={handleNext}
          disabled={isSubmitting || isStarting || isUploading}
          className={`py-4 w-full rounded-2xl items-center justify-center shadow-md active:opacity-90 transition-all z-10 ${
            isFileQuestion ? "max-w-xl" : "max-w-md"
          } ${isSubmitting || isStarting || isUploading ? "bg-slate-300 dark:bg-slate-700" : "bg-blue-500"}`}
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
    </View>
  );
}
