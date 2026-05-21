import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeBack } from "@/hooks/useSafeBack";

import { useGetProfileQuery, usePatchProfileMutation } from "@/services/auth-api";

import {
  useGetProfileOnboardingAnswersQuery,
  useUpdateProfileOnboardingAnswersMutation,
} from "@/services/onboarding-api";
import { getApiErrorMessage } from "@/utils/error-message";

// Helper to parse multi-select answers
const parseMultiSelect = (text: string): string[] => {
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

export function EditProfileScreen() {
  const safeBack = useSafeBack();
  const { data: profile } = useGetProfileQuery();
  const [patch] = usePatchProfileMutation();

  // Fetch onboarding profile answers from GET /api/v1/users/profile
  const {
    data: onboardingAnswers,
    isLoading: answersLoading,
    refetch,
  } = useGetProfileOnboardingAnswersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [updateProfileOnboardingAnswers, { isLoading: isSaving }] =
    useUpdateProfileOnboardingAnswersMutation();

  // Mode state: 'view' or 'edit'
  const [mode, setMode] = useState<"view" | "edit">("view");

  // State mapping for all 22 questions
  const [name, setName] = useState("");
  const [education, setEducation] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [branch, setBranch] = useState("");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");

  const [englishProficiency, setEnglishProficiency] = useState("");
  const [challengingSkills, setChallengingSkills] = useState<string[]>([]);

  const [primaryGoal, setPrimaryGoal] = useState("");
  const [achieve30Days, setAchieve30Days] = useState("");
  const [guidanceAreas, setGuidanceAreas] = useState<string[]>([]);

  const [dailyTime, setDailyTime] = useState("");
  const [practiceTime, setPracticeTime] = useState("");
  const [streakChallenge, setStreakChallenge] = useState("");

  const [comfortSpeaking, setComfortSpeaking] = useState("");
  const [aiCorrection, setAiCorrection] = useState("");

  const [motivation, setMotivation] = useState("");
  const [stopsPractice, setStopsPractice] = useState<string[]>([]);

  const [focusTrack, setFocusTrack] = useState("");
  const [dailyLearningGoal, setDailyLearningGoal] = useState("");

  // Store backend UUIDs mapped by question_key or lowercased question_text keyword
  const [questionIds, setQuestionIds] = useState<Record<string, string>>({});

  useEffect(() => {
    if (onboardingAnswers) {
      const data = onboardingAnswers;
      const allQuestionsWithAnswers = Object.values(data).flat() as any[];

      // Populate dynamic question mapping
      const idsMap: Record<string, string> = {};
      allQuestionsWithAnswers.forEach((q) => {
        if (q.question_key && q.id) {
          idsMap[q.question_key] = q.id;
        }
      });
      setQuestionIds(idsMap);

      // Robust lookup function
      const findQuestion = (keys: string[], textPhrase: string) => {
        return allQuestionsWithAnswers.find((q) => {
          const keyMatch = keys.some((k) => q.question_key?.toLowerCase() === k.toLowerCase());
          const textMatch = q.question_text?.toLowerCase().includes(textPhrase.toLowerCase());
          return keyMatch || textMatch;
        });
      };

      // 1. Basic Profile
      const qName = findQuestion(["name", "full_name"], "name or preferred");
      const qEducation = findQuestion(["education", "profession"], "education or profession");
      const qYear = findQuestion(["study_year", "year_of_study"], "year of study");
      const qBranch = findQuestion(["engineering_branch", "branch"], "engineering branch");
      const qDob = findQuestion(["dob", "date_of_birth"], "date of birth");
      const qCountry = findQuestion(["country"], "country");
      const qLang = findQuestion(["native_language"], "native language");

      // 2. English Level
      const qProf = findQuestion(["proficiency", "english_proficiency"], "proficiency");
      const qSkills = findQuestion(["challenging_skills"], "challenging");

      // 3. Learning Goals
      const qGoal = findQuestion(["learning_goal", "primary_goal"], "primary goal");
      const qAchieve = findQuestion(["achieve_30_days", "next_30_days"], "achieve in the next");
      const qGuidance = findQuestion(["personalized_guidance"], "personalized guidance");

      // 4. Usage & Preferences
      const qTime = findQuestion(["daily_time", "dedicate_time"], "dedicate per day");
      const qPractice = findQuestion(["practice_time"], "prefer to practice");
      const qStreak = findQuestion(["streak_challenge"], "streak challenge");

      // 5. Speaking & Confidence
      const qComfort = findQuestion(["comfort_speaking"], "comfortable speaking");
      const qCorrect = findQuestion(["ai_correction", "correct_method"], "correct you");

      // 6. Motivation & Challenges
      const qMotiv = findQuestion(["motivation"], "motivates");
      const qStops = findQuestion(["challenges", "stops_practice"], "stops you");

      // 7. Learning Path Setup
      const qFocus = findQuestion(["focus_track"], "focus track");
      const qDailyGoal = findQuestion(["daily_learning_goal"], "daily learning goal");

      // Update questionIds with fallbacks based on textPhrase match to guarantee we have their database IDs
      const mergeId = (key: string, qObj: any) => {
        if (qObj?.id) {
          idsMap[key] = qObj.id;
        }
      };
      mergeId("name", qName);
      mergeId("education", qEducation);
      mergeId("year_of_study", qYear);
      mergeId("branch", qBranch);
      mergeId("dob", qDob);
      mergeId("country", qCountry);
      mergeId("native_language", qLang);
      mergeId("proficiency", qProf);
      mergeId("challenging_skills", qSkills);
      mergeId("primary_goal", qGoal);
      mergeId("achieve_30_days", qAchieve);
      mergeId("personalized_guidance", qGuidance);
      mergeId("daily_time", qTime);
      mergeId("practice_time", qPractice);
      mergeId("streak_challenge", qStreak);
      mergeId("comfort_speaking", qComfort);
      mergeId("ai_correction", qCorrect);
      mergeId("motivation", qMotiv);
      mergeId("stops_practice", qStops);
      mergeId("focus_track", qFocus);
      mergeId("daily_learning_goal", qDailyGoal);
      setQuestionIds(idsMap);

      // Populate state values
      setName(qName?.answer_text || "");
      setEducation(qEducation?.answer_text || "");
      setYearOfStudy(qYear?.answer_text || "");
      setBranch(qBranch?.answer_text || "");
      setDob(qDob?.answer_text || "");
      setCountry(qCountry?.answer_text || "");
      setNativeLanguage(qLang?.answer_text || "");

      setEnglishProficiency(qProf?.answer_text || "");
      setChallengingSkills(parseMultiSelect(qSkills?.answer_text || ""));

      setPrimaryGoal(qGoal?.answer_text || "");
      setAchieve30Days(qAchieve?.answer_text || "");
      setGuidanceAreas(parseMultiSelect(qGuidance?.answer_text || ""));

      setDailyTime(qTime?.answer_text || "");
      setPracticeTime(qPractice?.answer_text || "");
      setStreakChallenge(qStreak?.answer_text || "");

      setComfortSpeaking(qComfort?.answer_text || "");
      setAiCorrection(qCorrect?.answer_text || "");

      setMotivation(qMotiv?.answer_text || "");
      setStopsPractice(parseMultiSelect(qStops?.answer_text || ""));

      setFocusTrack(qFocus?.answer_text || "");
      setDailyLearningGoal(qDailyGoal?.answer_text || "");
    }
  }, [onboardingAnswers]);

  // Options lists
  const EDUCATION_OPTIONS = ["Engineering Student", "Working Professional", "Job Seeker", "Others"];
  const YEAR_OPTIONS = ["1st year", "2nd year", "3rd year", "4th year"];
  const BRANCH_OPTIONS = ["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "Others"];
  const LANGUAGE_OPTIONS = [
    "Hindi",
    "Telugu",
    "Tamil",
    "Kannada",
    "Malayalam",
    "Marathi",
    "Bengali",
    "Gujarati",
    "Others",
  ];
  const PROFICIENCY_OPTIONS = ["Beginner", "Intermediate", "Upper Intermediate", "Advanced"];
  const SKILLS_OPTIONS = [
    "Speaking",
    "Listening",
    "Vocabulary",
    "Grammar",
    "Pronunciation",
    "Interview English",
  ];
  const GOAL_OPTIONS = [
    "Placement prep",
    "Fluency",
    "Communication skills",
    "Confidence",
    "Others",
  ];
  const GUIDANCE_OPTIONS = [
    "Grammar",
    "Pronunciation",
    "Conversational English",
    "GD/PI",
    "Others",
  ];
  const DAILY_TIME_OPTIONS = ["10 min", "20 min", "30 min", "1 hour"];
  const PRACTICE_TIME_OPTIONS = ["Morning", "Afternoon", "Evening", "Late night"];
  const STREAK_OPTIONS = ["7-Day", "14-Day", "30-Day"];
  const COMFORT_OPTIONS = ["Not comfortable", "Somewhat comfortable", "Comfortable"];
  const CORRECTION_OPTIONS = ["Soft corrections", "Detailed feedback"];
  const MOTIVATION_STOPS_OPTIONS = [
    "Fear",
    "Vocabulary",
    "No practice partner",
    "Not sure where to start",
  ];
  const TRACK_OPTIONS = [
    "Daily English",
    "Spoken English",
    "Placement English",
    "Technical English",
    "Public Speaking",
  ];
  const LEARNING_GOAL_OPTIONS = ["1 lesson/day", "2 lessons/day", "3 lessons/day"];

  const handleSave = async () => {
    try {
      const answersList: any[] = [];

      const addAnswer = (key: string, value: string) => {
        const questionId = questionIds[key];
        if (questionId) {
          answersList.push({
            question_id: questionId,
            answer_text: value,
            is_skipped: !value,
          });
        }
      };

      const addMultiAnswer = (key: string, values: string[]) => {
        const questionId = questionIds[key];
        if (questionId) {
          answersList.push({
            question_id: questionId,
            answer_text: values.join(", "),
            is_skipped: values.length === 0,
          });
        }
      };

      // 1. Basic Profile
      addAnswer("name", name);
      addAnswer("education", education);
      addAnswer("year_of_study", yearOfStudy);
      addAnswer("branch", branch);
      addAnswer("dob", dob);
      addAnswer("country", country);
      addAnswer("native_language", nativeLanguage);

      // 2. English Level
      addAnswer("proficiency", englishProficiency);
      addMultiAnswer("challenging_skills", challengingSkills);

      // 3. Learning Goals
      addAnswer("primary_goal", primaryGoal);
      addAnswer("achieve_30_days", achieve30Days);
      addMultiAnswer("personalized_guidance", guidanceAreas);

      // 4. Usage & Preferences
      addAnswer("daily_time", dailyTime);
      addAnswer("practice_time", practiceTime);
      addAnswer("streak_challenge", streakChallenge);

      // 5. Speaking & Confidence
      addAnswer("comfort_speaking", comfortSpeaking);
      addAnswer("ai_correction", aiCorrection);

      // 6. Motivation & Challenges
      addAnswer("motivation", motivation);
      addMultiAnswer("stops_practice", stopsPractice);

      // 7. Learning Path Setup
      addAnswer("focus_track", focusTrack);
      addAnswer("daily_learning_goal", dailyLearningGoal);

      const payload = {
        answers: answersList,
      };

      // Update backend using PUT users/profile matching the OpenAPI schema
      await updateProfileOnboardingAnswers(payload).unwrap();

      // Dispatch local profile patch to keep global user state perfectly in sync
      try {
        const patchPayload = {
          name,
          phone_number: profile?.phone_number || undefined,
          country: country || undefined,
          gender: profile?.gender || undefined,
          learning_goal: primaryGoal || undefined,
        };
        await patch(patchPayload).unwrap();
      } catch (err) {
        // Silently skip if auth patch fails but users/profile PUT completes
      }

      Alert.alert("Success", "Profile updated successfully!");
      setMode("view");
      refetch();
    } catch (err) {
      Alert.alert("Save failed", getApiErrorMessage(err, "Could not save your profile."));
    }
  };

  if (answersLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  // Multi-select helpers
  const toggleMultiSelect = (val: string, currentList: string[], setFn: (l: string[]) => void) => {
    if (currentList.includes(val)) {
      setFn(currentList.filter((x) => x !== val));
    } else {
      setFn([...currentList, val]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Top Header Bar */}
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-slate-100 shadow-sm">
          <Pressable
            onPress={() => safeBack()}
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
          >
            <Feather name="chevron-left" size={22} color="#1e293b" />
          </Pressable>
          <Text className="text-slate-900 font-extrabold text-lg">Personal Details</Text>

          {mode === "view" ? (
            <Pressable
              onPress={() => setMode("edit")}
              className="flex-row items-center px-4 py-2 bg-indigo-600 rounded-full shadow"
            >
              <Feather name="edit-2" size={14} color="#fff" className="mr-1.5" />
              <Text className="text-white font-bold text-xs">EDIT</Text>
            </Pressable>
          ) : (
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => {
                  setMode("view");
                  refetch();
                }}
                className="w-10 h-10 items-center justify-center rounded-full bg-slate-100"
              >
                <Feather name="x" size={18} color="#475569" />
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                className="flex-row items-center px-4 py-2 bg-emerald-600 rounded-full shadow"
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather name="check" size={14} color="#fff" className="mr-1.5" />
                    <Text className="text-white font-bold text-xs">SAVE</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 18, paddingBottom: 120, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* VIEW MODE LAYOUT */}
          {mode === "view" && (
            <View className="gap-6">
              {/* 1. Basic Profile Card */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                  <Feather name="user" size={18} color="#6366f1" />
                  <Text className="text-slate-950 font-black text-sm uppercase tracking-wider">
                    Basic Profile
                  </Text>
                </View>
                <View className="gap-3">
                  <DetailRow label="Name / Preferred Name" value={name} />
                  <DetailRow label="Education / Profession" value={education} />
                  {education === "Engineering Student" && (
                    <>
                      <DetailRow label="Year of Study" value={yearOfStudy} />
                      <DetailRow label="Engineering Branch" value={branch} />
                    </>
                  )}
                  <DetailRow label="Date of Birth" value={dob} />
                  <DetailRow label="Country" value={country} />
                  <DetailRow label="Native Language" value={nativeLanguage} />
                </View>
              </View>

              {/* 2. English Level Card */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                  <Feather name="trending-up" size={18} color="#10b981" />
                  <Text className="text-slate-950 font-black text-sm uppercase tracking-wider">
                    English Level
                  </Text>
                </View>
                <View className="gap-3">
                  <DetailRow label="Proficiency Rating" value={englishProficiency} />
                  <DetailChipsRow
                    label="Challenging Skills"
                    values={challengingSkills}
                    color="emerald"
                  />
                </View>
              </View>

              {/* 3. Learning Goals Card */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                  <Feather name="target" size={18} color="#f59e0b" />
                  <Text className="text-slate-950 font-black text-sm uppercase tracking-wider">
                    Learning Goals
                  </Text>
                </View>
                <View className="gap-3">
                  <DetailRow label="Primary Goal" value={primaryGoal} />
                  <DetailRow label="Next 30 Days Objective" value={achieve30Days} />
                  <DetailChipsRow
                    label="Personalized Guidance Areas"
                    values={guidanceAreas}
                    color="amber"
                  />
                </View>
              </View>

              {/* 4. Preferences Card */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                  <Feather name="clock" size={18} color="#ec4899" />
                  <Text className="text-slate-950 font-black text-sm uppercase tracking-wider">
                    Preferences
                  </Text>
                </View>
                <View className="gap-3">
                  <DetailRow label="Daily Time Dedication" value={dailyTime} />
                  <DetailRow label="Preferred Practice Time" value={practiceTime} />
                  <DetailRow label="Streak Challenge" value={streakChallenge} />
                </View>
              </View>

              {/* 5. Speaking & Confidence Card */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                  <Feather name="mic" size={18} color="#8b5cf6" />
                  <Text className="text-slate-950 font-black text-sm uppercase tracking-wider">
                    Speaking & Confidence
                  </Text>
                </View>
                <View className="gap-3">
                  <DetailRow label="Speaking Comfort Level" value={comfortSpeaking} />
                  <DetailRow label="Preferred AI Corrections" value={aiCorrection} />
                </View>
              </View>

              {/* 6. Motivation & Challenges Card */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                  <Feather name="heart" size={18} color="#f43f5e" />
                  <Text className="text-slate-950 font-black text-sm uppercase tracking-wider">
                    Motivation & Challenges
                  </Text>
                </View>
                <View className="gap-3">
                  <DetailRow label="Learning Motivators" value={motivation} />
                  <DetailChipsRow
                    label="Regular Practice Blockers"
                    values={stopsPractice}
                    color="rose"
                  />
                </View>
              </View>

              {/* 7. Learning Path Setup Card */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                  <Feather name="map" size={18} color="#06b6d4" />
                  <Text className="text-slate-950 font-black text-sm uppercase tracking-wider">
                    Learning Path Setup
                  </Text>
                </View>
                <View className="gap-3">
                  <DetailRow label="Focus Track" value={focusTrack} />
                  <DetailRow label="Daily Learning Goal" value={dailyLearningGoal} />
                </View>
              </View>
            </View>
          )}

          {/* EDIT MODE LAYOUT */}
          {mode === "edit" && (
            <View className="gap-6">
              {/* 1. Basic Profile Fields */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                  <Feather name="user" size={18} color="#6366f1" />
                  <Text className="text-indigo-600 font-bold text-sm uppercase tracking-wider">
                    Basic Profile
                  </Text>
                </View>

                <View className="gap-4">
                  <InputField
                    label="What is your name or preferred display name?"
                    value={name}
                    onChange={setName}
                  />

                  <SelectField
                    label="What is your current education or profession?"
                    value={education}
                    onChange={setEducation}
                    options={EDUCATION_OPTIONS}
                  />

                  {education === "Engineering Student" && (
                    <>
                      <SelectField
                        label="If student, which year of study are you in?"
                        value={yearOfStudy}
                        onChange={setYearOfStudy}
                        options={YEAR_OPTIONS}
                      />

                      <SelectField
                        label="Which engineering branch do you belong to?"
                        value={branch}
                        onChange={setBranch}
                        options={BRANCH_OPTIONS}
                      />
                    </>
                  )}

                  <InputField
                    label="Date of Birth"
                    placeholder="YYYY-MM-DD"
                    value={dob}
                    onChange={setDob}
                  />
                  <InputField label="Country" value={country} onChange={setCountry} />

                  <SelectField
                    label="What is your native language?"
                    value={nativeLanguage}
                    onChange={setNativeLanguage}
                    options={LANGUAGE_OPTIONS}
                  />
                </View>
              </View>

              {/* 2. English Level Fields */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                  <Feather name="trending-up" size={18} color="#10b981" />
                  <Text className="text-emerald-600 font-bold text-sm uppercase tracking-wider">
                    English Level (Self-Assessment)
                  </Text>
                </View>

                <View className="gap-4">
                  <SelectField
                    label="How would you rate your English proficiency?"
                    value={englishProficiency}
                    onChange={setEnglishProficiency}
                    options={PROFICIENCY_OPTIONS}
                  />

                  <MultiSelectField
                    label="Which skills do you find most challenging?"
                    selected={challengingSkills}
                    options={SKILLS_OPTIONS}
                    onToggle={(val) =>
                      toggleMultiSelect(val, challengingSkills, setChallengingSkills)
                    }
                  />
                </View>
              </View>

              {/* 3. Learning Goals Fields */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                  <Feather name="target" size={18} color="#f59e0b" />
                  <Text className="text-amber-600 font-bold text-sm uppercase tracking-wider">
                    Learning Goals
                  </Text>
                </View>

                <View className="gap-4">
                  <SelectField
                    label="What is your primary goal for learning English?"
                    value={primaryGoal}
                    onChange={setPrimaryGoal}
                    options={GOAL_OPTIONS}
                  />

                  <InputField
                    label="What would you like to achieve in the next 30 days?"
                    value={achieve30Days}
                    onChange={(setKeep) => setAchieve30Days(setKeep)}
                    multiline
                  />

                  <MultiSelectField
                    label="Which areas do you want personalized guidance for?"
                    selected={guidanceAreas}
                    options={GUIDANCE_OPTIONS}
                    onToggle={(val) => toggleMultiSelect(val, guidanceAreas, setGuidanceAreas)}
                  />
                </View>
              </View>

              {/* 4. Preferences Fields */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                  <Feather name="clock" size={18} color="#ec4899" />
                  <Text className="text-pink-600 font-bold text-sm uppercase tracking-wider">
                    Usage & Preferences
                  </Text>
                </View>

                <View className="gap-4">
                  <SelectField
                    label="How much time can you dedicate per day?"
                    value={dailyTime}
                    onChange={setDailyTime}
                    options={DAILY_TIME_OPTIONS}
                  />

                  <SelectField
                    label="When do you prefer to practice daily?"
                    value={practiceTime}
                    onChange={setPracticeTime}
                    options={PRACTICE_TIME_OPTIONS}
                  />

                  <SelectField
                    label="Choose your Streak Challenge"
                    value={streakChallenge}
                    onChange={setStreakChallenge}
                    options={STREAK_OPTIONS}
                  />
                </View>
              </View>

              {/* 5. Speaking & Confidence Fields */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                  <Feather name="mic" size={18} color="#8b5cf6" />
                  <Text className="text-violet-600 font-bold text-sm uppercase tracking-wider">
                    Speaking & Confidence Assessment
                  </Text>
                </View>

                <View className="gap-4">
                  <SelectField
                    label="How comfortable are you speaking English in front of others?"
                    value={comfortSpeaking}
                    onChange={setComfortSpeaking}
                    options={COMFORT_OPTIONS}
                  />

                  <SelectField
                    label="How would you like the AI tutor to correct you?"
                    value={aiCorrection}
                    onChange={setAiCorrection}
                    options={CORRECTION_OPTIONS}
                  />
                </View>
              </View>

              {/* 6. Motivation & Challenges Fields */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                  <Feather name="heart" size={18} color="#f43f5e" />
                  <Text className="text-rose-600 font-bold text-sm uppercase tracking-wider">
                    Motivation & Challenges
                  </Text>
                </View>

                <View className="gap-4">
                  <InputField
                    label="What motivates you to learn English?"
                    value={motivation}
                    onChange={setMotivation}
                    multiline
                  />

                  <MultiSelectField
                    label="What stops you from practicing regularly?"
                    selected={stopsPractice}
                    options={MOTIVATION_STOPS_OPTIONS}
                    onToggle={(val) => toggleMultiSelect(val, stopsPractice, setStopsPractice)}
                  />
                </View>
              </View>

              {/* 7. Learning Path Setup Fields */}
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                  <Feather name="map" size={18} color="#06b6d4" />
                  <Text className="text-cyan-600 font-bold text-sm uppercase tracking-wider">
                    Learning Path Setup
                  </Text>
                </View>

                <View className="gap-4">
                  <SelectField
                    label="Choose your focus track"
                    value={focusTrack}
                    onChange={setFocusTrack}
                    options={TRACK_OPTIONS}
                  />

                  <SelectField
                    label="Set your daily learning goal"
                    value={dailyLearningGoal}
                    onChange={setDailyLearningGoal}
                    options={LEARNING_GOAL_OPTIONS}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ------------------- UI HELPER COMPONENTS -------------------

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
      <Text className="text-slate-500 font-medium text-xs flex-1 pr-4">{label}</Text>
      <Text className="text-slate-800 font-extrabold text-xs text-right max-w-[60%]">
        {value || "—"}
      </Text>
    </View>
  );
}

function DetailChipsRow({
  label,
  values,
  color,
}: {
  label: string;
  values: string[];
  color: string;
}) {
  const getBadgeStyle = () => {
    switch (color) {
      case "emerald":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "amber":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "rose":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
    }
  };

  return (
    <View className="py-2.5 border-b border-slate-50 last:border-0 gap-2">
      <Text className="text-slate-500 font-medium text-xs">{label}</Text>
      <View className="flex-row flex-wrap gap-1.5 mt-1">
        {values.length > 0 ? (
          values.map((v) => (
            <View
              key={v}
              className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getBadgeStyle()}`}
            >
              <Text className="text-[10px] font-extrabold">{v}</Text>
            </View>
          ))
        ) : (
          <Text className="text-slate-400 text-xs italic">—</Text>
        )}
      </View>
    </View>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <View className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
      <Text className="text-slate-600 font-bold text-xs mb-1.5">{label}</Text>
      <TextInput
        placeholder={placeholder || "Type answer..."}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        className="text-slate-900 font-extrabold text-sm py-1"
        style={multiline ? { textAlignVertical: "top" } : undefined}
      />
    </View>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <View className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
      <Text className="text-slate-600 font-bold text-xs mb-2">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(isSelected ? "" : opt)}
              className={`px-3 py-1.5 rounded-xl border ${isSelected ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"}`}
            >
              <Text
                className={`text-xs font-extrabold ${isSelected ? "text-white" : "text-slate-700"}`}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MultiSelectField({
  label,
  selected,
  options,
  onToggle,
}: {
  label: string;
  selected: string[];
  options: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <View className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
      <Text className="text-slate-600 font-bold text-xs mb-2">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <Pressable
              key={opt}
              onPress={() => onToggle(opt)}
              className={`px-3 py-1.5 rounded-xl border ${isSelected ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"}`}
            >
              <Text
                className={`text-xs font-extrabold ${isSelected ? "text-white" : "text-slate-700"}`}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
