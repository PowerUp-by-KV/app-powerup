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
import { updateField, nextStep, prevStep } from "@/store/slices/onboardingSlice";
import {
  useGetGroupedQuestionsQuery,
  useSubmitOnboardingMutation,
} from "@/services/onboarding-api";
import { useStartSessionMutation, getNextRouteForSection } from "@/services/assessment-api";
import { DynamicOnboardingForm } from "./components/DynamicOnboardingForm";
import { setProfileCompletedInSession, saveAssessmentSessionId } from "@/services/auth-storage";
import { getApiErrorMessage } from "@/services/auth-service";

export default function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.onboarding);
  const stepNumber = formData.currentStep;

  const { data: groupedQuestions, isLoading: isFetching } = useGetGroupedQuestionsQuery();
  const [submitOnboarding, { isLoading: isSubmitting }] = useSubmitOnboardingMutation();
  const [startSession, { isLoading: isStarting }] = useStartSessionMutation();

  // Flatten the questions from the API for the step-by-step wizard
  const flattenedQuestions = React.useMemo(() => {
    if (!groupedQuestions) return [];
    return Object.values(groupedQuestions).flat();
  }, [groupedQuestions]);

  const question = flattenedQuestions[stepNumber - 1];

  if (isFetching) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#334155" />
        <Text className="mt-4 text-slate-500 text-sm font-medium">Loading assessment...</Text>
      </View>
    );
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
            onPress={async () => {
              try {
                let session: any = null;
                let retries = 3;
                while (retries > 0) {
                  try {
                    session = await startSession().unwrap();
                    break;
                  } catch (startErr) {
                    retries--;
                    if (retries === 0) throw startErr;
                    await new Promise((res) => setTimeout(res, 1000));
                  }
                }

                if (session?.session_id) {
                  await saveAssessmentSessionId(session.session_id);
                  const nextRoute = getNextRouteForSection(session.first_section);

                  // Small delay on Android to ensure native bridge is ready
                  if (Platform.OS === "android") {
                    await new Promise((resolve) => setTimeout(resolve, 300));
                  }

                  const cleanPath = nextRoute.startsWith("/") ? nextRoute : `/${nextRoute}`;
                  router.replace(
                    `${cleanPath}?session_id=${encodeURIComponent(session.session_id)}` as any,
                  );
                }
              } catch (err) {
                Alert.alert("Error", getApiErrorMessage(err, "Could not start assessment session"));
              }
            }}
            disabled={isStarting}
            className={`w-full max-w-xs py-4 rounded-2xl flex-row items-center justify-center ${
              isStarting ? "bg-indigo-400" : "bg-indigo-600"
            } shadow-lg shadow-indigo-200`}
          >
            {isStarting && <ActivityIndicator color="white" className="mr-3" size="small" />}
            <Text className="text-white font-bold text-lg">
              {isStarting ? "Preparing..." : "Start Assessment"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => dispatch(prevStep())}
            disabled={isStarting}
            className="mt-6 py-2"
          >
            <Text className="text-indigo-600 font-semibold text-base">Review Answers</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleInputChange = (key: string, value: any) => {
    dispatch(updateField({ field: key as any, value }));
  };

  const submitFinalAnswers = async () => {
    if (isSubmitting || isStarting) return;

    try {
      // 1. Upload resume file if selected (truly non-blocking background upload)
      for (const q of flattenedQuestions) {
        if (q.input_type === "file") {
          const fileUri = formData[q.question_key as keyof typeof formData];
          if (
            fileUri &&
            typeof fileUri === "string" &&
            (fileUri.startsWith("blob:") ||
              fileUri.startsWith("file:") ||
              fileUri.startsWith("content:") ||
              fileUri.startsWith("/"))
          ) {
            try {
              const fileName = (formData[`${q.question_key}Name` as keyof typeof formData] ||
                "resume.pdf") as string;

              import("@/services/auth-storage")
                .then(async ({ getAuthSession: getSession }) => {
                  const authSession = await getSession();
                  const baseUrl = (
                    process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api"
                  ).replace(/\/$/, "");
                  const uploadUrl = `${baseUrl}/v1/onboarding/resume`;

                  const xhr = new XMLHttpRequest();
                  xhr.open("POST", uploadUrl);
                  if (authSession?.access_token) {
                    xhr.setRequestHeader("Authorization", `Bearer ${authSession.access_token}`);
                  }

                  const fd = new FormData();
                  if (Platform.OS === "web") {
                    fetch(fileUri)
                      .then((r) => r.blob())
                      .then((blob) => {
                        fd.append("file", new File([blob], fileName, { type: "application/pdf" }));
                        xhr.send(fd);
                      })
                      .catch(() => {});
                  } else {
                    fd.append("file", {
                      uri: fileUri,
                      name: fileName,
                      type: "application/pdf",
                    } as any);
                    xhr.send(fd);
                  }
                })
                .catch(() => {});
            } catch (uploadErr) {
              // Ignore background spawn errors
            }
          }
        }
      }

      // 2. Build answers payload — API only accepts question_id + answer_text
      // Skip file questions (handled above) and skipped questions
      const answersPayload = flattenedQuestions
        .filter((q) => q.input_type !== "file")
        .map((q) => {
          const answerValue = formData[q.question_key as keyof typeof formData];

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
        });

      // 3. Submit Onboarding Answers with localized retry loop
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

      // 4. Mark profile as completed locally
      await setProfileCompletedInSession(true);

      // 5. Start Assessment Session with localized retry loop
      let session: any = null;
      let sessionRetries = 3;
      while (sessionRetries > 0) {
        try {
          session = await startSession().unwrap();
          break;
        } catch (startErr) {
          sessionRetries--;
          if (sessionRetries === 0) throw startErr;
          await new Promise((res) => setTimeout(res, 1000));
        }
      }

      // 6. Save Session ID and navigate
      if (session?.session_id) {
        await saveAssessmentSessionId(session.session_id);
        const nextRoute = getNextRouteForSection(session.first_section);

        if (Platform.OS === "android") {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        const cleanPath = nextRoute.startsWith("/") ? nextRoute : `/${nextRoute}`;
        router.replace(`${cleanPath}?session_id=${encodeURIComponent(session.session_id)}` as any);
      } else {
        throw new Error("No session ID returned from server.");
      }
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err, "Submission failed. Please try again."));
    }
  };

  const handleNext = async () => {
    if (!question) return;

    const answerValue = formData[question.question_key as keyof typeof formData];

    // Check required fields
    if (question.is_required && !answerValue) {
      Alert.alert("Required", "Please provide an answer to continue.");
      return;
    }

    if (stepNumber < flattenedQuestions.length) {
      dispatch(nextStep());
    } else {
      await submitFinalAnswers();
    }
  };

  const handleSkip = async () => {
    if (!question) return;

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
          disabled={isSubmitting || isStarting}
          className={`py-3.5 px-16 rounded-2xl items-center justify-center shadow-sm ${
            isSubmitting || isStarting ? "bg-slate-400" : "bg-slate-700"
          }`}
        >
          {isSubmitting || isStarting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-bold text-sm">Continue</Text>
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
