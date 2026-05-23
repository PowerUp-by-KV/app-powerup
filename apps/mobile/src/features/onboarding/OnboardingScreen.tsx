import React, { useState } from "react";
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
  KeyboardAvoidingView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
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
import {
  setProfileCompletedInSession,
  saveAssessmentSessionId,
  getAuthSession,
} from "@/services/auth-storage";
import { normalizeBaseUrlForRuntime } from "@/services/api";
import { getApiErrorMessage } from "@/utils/error-message";

export default function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.onboarding);
  const stepNumber = formData.currentStep;

  const { data: groupedQuestions, isLoading: isFetching } = useGetGroupedQuestionsQuery();
  const [submitOnboarding, { isLoading: isSubmitting }] = useSubmitOnboardingMutation();
  const [startSession, { isLoading: isStarting }] = useStartSessionMutation();

  const [extractedData, setExtractedData] = useState<any>(null);
  const [extractedResumeId, setExtractedResumeId] = useState<string | null>(null);
  const [isConfirmingResume, setIsConfirmingResume] = useState(false);
  const [isExtractingResume, setIsExtractingResume] = useState(false);

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

  if (!question && !isFetching && !extractedData) {
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

  const submitFinalAnswers = async (skipExtraction = false) => {
    if (isSubmitting || isStarting) return;

    try {
      const authSession = await getAuthSession();
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("EXPO_PUBLIC_API_URL is not set");
      const rawBase = apiUrl.replace(/\/$/, "");
      const baseUrl = normalizeBaseUrlForRuntime(rawBase);

      // 1. Check if a resume was uploaded, if so extract data
      if (!skipExtraction) {
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
              const fileName = (formData[`${q.question_key}Name` as keyof typeof formData] ||
                "resume.pdf") as string;
              
              setIsExtractingResume(true);
              
              try {
                const extractResult: any = await new Promise((resolve, reject) => {
                  const uploadUrl = `${baseUrl}/v1/onboarding/resume/extract`;
                  const xhr = new XMLHttpRequest();
                  xhr.open("POST", uploadUrl);
                  if (authSession?.access_token) {
                    xhr.setRequestHeader("Authorization", `Bearer ${authSession.access_token}`);
                  }

                  xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                      try {
                        const jsonResponse = JSON.parse(xhr.responseText);
                        resolve(jsonResponse);
                      } catch (e) {
                        reject(new Error("Failed to parse extraction response"));
                      }
                    } else {
                      reject(new Error(`Extraction failed: ${xhr.responseText}`));
                    }
                  };

                  xhr.onerror = (err) => reject(new Error("Network connection error"));

                  const fd = new FormData();
                  if (Platform.OS === "web") {
                    fetch(fileUri)
                      .then((r) => r.blob())
                      .then((blob) => {
                        fd.append("file", new File([blob], fileName, { type: "application/pdf" }));
                        xhr.send(fd);
                      })
                      .catch(reject);
                  } else {
                    fd.append("file", {
                      uri: fileUri,
                      name: fileName,
                      type: "application/pdf",
                    } as any);
                    xhr.send(fd);
                  }
                });

                setIsExtractingResume(false);

                const resId = extractResult?.resume_id || extractResult?.id;
                if (extractResult && resId && extractResult.parsed_data) {
                  setExtractedResumeId(resId);
                  setExtractedData(extractResult.parsed_data);
                  return; // EARLY RETURN: wait for user to confirm UI before proceeding
                } else {
                  console.error("Missing expected fields in response:", extractResult);
                  throw new Error(`Invalid extraction response format. Expected resume_id and parsed_data. Got: ${JSON.stringify(extractResult)}`);
                }
              } catch (err) {
                setIsExtractingResume(false);
                console.error("[OnboardingScreen] Extraction failed:", err);
                throw err; // Stop submission and let the outer catch block show an alert
              }
            }
          }
        }
      }

      // 2. Build answers payload — API only accepts question_id + answer_text
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

  const handleConfirmResume = async () => {
    if (!extractedResumeId || !extractedData) return;
    setIsConfirmingResume(true);

    try {
      const authSession = await getAuthSession();
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const rawBase = apiUrl!.replace(/\/$/, "");
      const baseUrl = normalizeBaseUrlForRuntime(rawBase);

      await new Promise<void>((resolve, reject) => {
        const confirmUrl = `${baseUrl}/v1/onboarding/resume/confirm`;
        const xhr = new XMLHttpRequest();
        xhr.open("POST", confirmUrl);
        if (authSession?.access_token) {
          xhr.setRequestHeader("Authorization", `Bearer ${authSession.access_token}`);
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Confirmation failed: ${xhr.responseText}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network connection error"));

        const fd = new FormData();
        fd.append("resume_id", extractedResumeId);
        fd.append("confirmed_data", JSON.stringify(extractedData));
        xhr.send(fd);
      });

      setIsConfirmingResume(false);
      setExtractedData(null); // hide UI

      // Resume submission process without re-extracting
      await submitFinalAnswers(true);

    } catch (err) {
      setIsConfirmingResume(false);
      Alert.alert("Error", getApiErrorMessage(err, "Could not confirm resume details"));
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

  // RENDER EXTRACTED DATA CONFIRMATION UI
  if (extractedData) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View className="flex-1 px-6 pt-8 pb-4">
            <Text className="text-slate-900 text-2xl font-extrabold mb-2">
              Review your details
            </Text>
            <Text className="text-slate-500 text-sm leading-relaxed">
              We extracted this from your resume. Please verify or edit any mistakes before starting the assessment.
            </Text>
          </View>

     <ScrollView 
  style={{ flex: 1 }} 
  className="px-5" 
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 40 }}
>
  {/* Personal Details Card */}
  <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm border border-slate-200/60">
    <View className="flex-row items-center mb-4">
      <MaterialIcons name="person" size={22} color="#2563EB" />
      <Text className="text-slate-800 font-bold text-lg ml-2">Personal Details</Text>
    </View>
    <TextInput
      className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-2 text-slate-900"
      placeholder="Full Name"
      placeholderTextColor="#94A3B8"
      value={extractedData.contact?.fullName || ''}
      onChangeText={(text) => setExtractedData({
        ...extractedData,
        contact: { ...extractedData.contact, fullName: text },
      })}
    />
    <TextInput
      className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-2 text-slate-900"
      placeholder="Email"
      placeholderTextColor="#94A3B8"
      keyboardType="email-address"
      value={extractedData.contact?.email || ''}
      onChangeText={(text) => setExtractedData({
        ...extractedData,
        contact: { ...extractedData.contact, email: text },
      })}
    />
    <TextInput
      className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-2 text-slate-900"
      placeholder="Phone"
      placeholderTextColor="#94A3B8"
      keyboardType="phone-pad"
      value={extractedData.contact?.phone || ''}
      onChangeText={(text) => setExtractedData({
        ...extractedData,
        contact: { ...extractedData.contact, phone: text },
      })}
    />
    <TextInput
      className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-2 text-slate-900"
      placeholder="Location"
      placeholderTextColor="#94A3B8"
      value={extractedData.contact?.location || ''}
      onChangeText={(text) => setExtractedData({
        ...extractedData,
        contact: { ...extractedData.contact, location: text },
      })}
    />
    <TextInput
      className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
      placeholder="LinkedIn URL"
      placeholderTextColor="#94A3B8"
      value={extractedData.contact?.linkedin || ''}
      onChangeText={(text) => setExtractedData({
        ...extractedData,
        contact: { ...extractedData.contact, linkedin: text },
      })}
    />
  </View>

  {/* Summary Card (optional) */}
  {extractedData.summary?.text && (
    <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm border border-slate-200/60">
      <View className="flex-row items-center mb-4">
        <MaterialIcons name="description" size={22} color="#2563EB" />
        <Text className="text-slate-800 font-bold text-lg ml-2">Professional Summary</Text>
      </View>
      <TextInput
        className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900"
        multiline
        style={{ textAlignVertical: "top" }}
        placeholder="Enter a brief professional summary"
        placeholderTextColor="#94A3B8"
        value={extractedData.summary?.text || ''}
        onChangeText={(text) => setExtractedData({
          ...extractedData,
          summary: { ...extractedData.summary, text },
        })}
      />
    </View>
  )}

  {/* Skills Card */}
  <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm border border-slate-200/60">
    <View className="flex-row items-center mb-4">
      <MaterialIcons name="code" size={22} color="#2563EB" />
      <Text className="text-slate-800 font-bold text-lg ml-2">Skills</Text>
    </View>
    <TextInput
      className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 leading-5 min-h-[80px]"
      multiline
      style={{ textAlignVertical: "top" }}
      placeholder="e.g. React, Python, Project Management..."
      placeholderTextColor="#94A3B8"
      value={extractedData.skills?.map((s:any)=> typeof s==='string'?s:s.name).join(", ")}
      onChangeText={(text)=> setExtractedData({
        ...extractedData,
        skills: text.split(',').map(s=>s.trim()).filter(Boolean)
      })}
    />
    <Text className="text-xs text-slate-400 mt-2 ml-1">Separate skills with commas</Text>
  </View>

            {/* Experience Card */}
            <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm border border-slate-200/60">
              <View className="flex-row items-center mb-4">
                <MaterialIcons name="work" size={22} color="#2563EB" />
                <Text className="text-slate-800 font-bold text-lg ml-2">Experience</Text>
              </View>
              
              {extractedData.experience?.map((exp: any, index: number) => (
                <View key={index} className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <View className="flex-row justify-between items-center mb-2 border-b border-slate-200 pb-2">
                    <TextInput 
                      className="font-bold text-base text-slate-900 flex-1" 
                      value={exp.position} 
                      onChangeText={(text) => {
                        const newExp = [...(extractedData.experience || [])];
                        newExp[index] = {...newExp[index], position: text};
                        setExtractedData({...extractedData, experience: newExp});
                      }}
                      placeholder="Position/Title"
                      placeholderTextColor="#94A3B8"
                    />
                    <TouchableOpacity onPress={() => {
                        const newExp = [...(extractedData.experience || [])];
                        newExp.splice(index, 1);
                        setExtractedData({...extractedData, experience: newExp});
                    }}>
                      <MaterialIcons name="close" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                  <TextInput 
                    className="text-slate-700 font-medium" 
                    value={exp.company} 
                    onChangeText={(text) => {
                      const newExp = [...(extractedData.experience || [])];
                      newExp[index] = {...newExp[index], company: text};
                      setExtractedData({...extractedData, experience: newExp});
                    }}
                    placeholder="Company Name"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              ))}
              
              <TouchableOpacity 
                className="flex-row items-center justify-center py-3 bg-indigo-50 rounded-xl mt-1 border border-indigo-100"
                onPress={() => setExtractedData({ ...extractedData, experience: [...(extractedData.experience || []), { position: "", company: "" }]})}
              >
                <MaterialIcons name="add" size={20} color="#4F46E5" />
                <Text className="text-indigo-600 font-bold ml-1">Add Experience</Text>
              </TouchableOpacity>
            </View>

            {/* Projects Card */}
            <View className="bg-white rounded-2xl p-5 mb-8 shadow-sm border border-slate-200/60">
              <View className="flex-row items-center mb-4">
                <MaterialIcons name="folder-open" size={22} color="#2563EB" />
                <Text className="text-slate-800 font-bold text-lg ml-2">Projects</Text>
              </View>
              
              {extractedData.projects?.map((proj: any, index: number) => (
                <View key={index} className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <View className="flex-row justify-between items-center">
                    <TextInput 
                      className="font-bold text-base text-slate-900 flex-1" 
                      value={proj.name} 
                      onChangeText={(text) => {
                        const newProj = [...(extractedData.projects || [])];
                        newProj[index] = {...newProj[index], name: text};
                        setExtractedData({...extractedData, projects: newProj});
                      }}
                      placeholder="Project Name"
                      placeholderTextColor="#94A3B8"
                    />
                    <TouchableOpacity onPress={() => {
                        const newProj = [...(extractedData.projects || [])];
                        newProj.splice(index, 1);
                        setExtractedData({...extractedData, projects: newProj});
                    }}>
                      <MaterialIcons name="close" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity 
                className="flex-row items-center justify-center py-3 bg-indigo-50 rounded-xl mt-1 border border-indigo-100"
                onPress={() => setExtractedData({ ...extractedData, projects: [...(extractedData.projects || []), { name: "" }]})}
              >
                <MaterialIcons name="add" size={20} color="#4F46E5" />
                <Text className="text-indigo-600 font-bold ml-1">Add Project</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View className="px-5 py-4 bg-white border-t border-slate-100">
            <TouchableOpacity
              onPress={handleConfirmResume}
              disabled={isConfirmingResume || isStarting || isSubmitting}
              className={`rounded-2xl py-4 flex-row justify-center items-center mb-2 shadow-sm ${isConfirmingResume || isStarting || isSubmitting ? "bg-indigo-400" : "bg-indigo-600 shadow-indigo-200"}`}
            >
              {isConfirmingResume || isStarting || isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-white font-bold text-base mr-2">Confirm & Continue</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

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
          disabled={isSubmitting || isStarting || isExtractingResume}
          className={`py-3.5 px-16 rounded-2xl items-center justify-center shadow-sm ${
            isSubmitting || isStarting || isExtractingResume ? "bg-slate-400" : "bg-slate-700"
          }`}
        >
          {isSubmitting || isStarting || isExtractingResume ? (
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
