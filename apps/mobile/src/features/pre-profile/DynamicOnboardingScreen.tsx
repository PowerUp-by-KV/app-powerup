import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { RootState } from "@/store";
import { updateField, nextStep, prevStep } from "@/store/slices/onboardingSlice";
import {
  useGetGroupedQuestionsQuery,
  useSubmitOnboardingMutation,
} from "@/services/onboarding-api";
import { DynamicOnboardingForm } from "./components/DynamicOnboardingForm";
import { setProfileCompletedInSession } from "@/services/auth-storage";
import { getApiErrorMessage } from "@/services/auth-service";

export default function DynamicOnboardingScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.onboarding);
  const stepNumber = formData.currentStep;

  const { data: groupedQuestions, isLoading: isFetching } = useGetGroupedQuestionsQuery();
  const [submitOnboarding, { isLoading: isSubmitting }] = useSubmitOnboardingMutation();

  // Flatten the questions from the API for the step-by-step wizard
  const flattenedQuestions = React.useMemo(() => {
    if (!groupedQuestions) return [];
    return Object.values(groupedQuestions).flat();
  }, [groupedQuestions]);

  const question = flattenedQuestions[stepNumber - 1];

  if (isFetching) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-slate-500 font-medium">Loading questions...</Text>
      </View>
    );
  }

  if (!question && !isFetching) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-slate-500 text-center text-lg">No more questions available.</Text>
        <TouchableOpacity
          onPress={() => router.replace("/read")}
          className="mt-6 px-8 py-3 bg-indigo-600 rounded-2xl"
        >
          <Text className="text-white font-bold">Go to Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => dispatch(prevStep())} className="mt-4">
          <Text className="text-indigo-600 font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleInputChange = (key: string, value: any) => {
    dispatch(updateField({ field: key as any, value }));
  };

  const handleNext = async () => {
    if (!question) return;

    // Check required fields
    if (question.is_required && !formData[question.question_key as keyof typeof formData]) {
      Alert.alert("Required", "Please provide an answer to continue.");
      return;
    }

    if (stepNumber < flattenedQuestions.length) {
      dispatch(nextStep());
    } else {
      // Final submission
      try {
        const { currentStep, showDatePicker, ...submissionData } = formData;
        await submitOnboarding(submissionData).unwrap();
        await setProfileCompletedInSession(true);
        router.replace("/read"); // Go to read page as requested
      } catch (err) {
        Alert.alert("Error", getApiErrorMessage(err, "Submission failed"));
      }
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Progress Bar */}
      <View className="h-1 bg-slate-100 w-full">
        <View className="h-full bg-indigo-600" style={{ width: `${progress}%` }} />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8">
          <Text className="text-indigo-600 font-bold mb-1 uppercase tracking-wider text-xs">
            {question?.section} • Step {stepNumber} of {flattenedQuestions.length}
          </Text>
          <Text className="text-3xl font-extrabold text-slate-900 leading-tight">
            {question?.question_text}
          </Text>
        </View>

        <View className="flex-1">
          {question && (
            <DynamicOnboardingForm
              questions={[question]}
              formData={formData}
              onInputChange={handleInputChange}
              hideLabel={true}
            />
          )}
        </View>

        <View className="flex-row justify-between items-center mt-12 mb-6">
          {stepNumber > 1 ? (
            <TouchableOpacity
              onPress={handleBack}
              className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100"
            >
              <Text className="text-slate-500 font-bold text-lg">Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          <TouchableOpacity
            onPress={handleNext}
            disabled={isSubmitting}
            className={`px-12 py-4 rounded-2xl flex-row items-center justify-center shadow-lg ${
              isSubmitting ? "bg-indigo-400" : "bg-indigo-600"
            }`}
          >
            {isSubmitting && <ActivityIndicator color="white" className="mr-2" />}
            <Text className="text-white font-bold text-xl">
              {stepNumber === flattenedQuestions.length
                ? isSubmitting
                  ? "Saving..."
                  : "Finish"
                : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
