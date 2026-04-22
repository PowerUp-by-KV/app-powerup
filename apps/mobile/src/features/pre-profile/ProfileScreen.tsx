import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { getApiErrorMessage } from "@/services/auth-service";
import { setProfileCompletedInSession } from "@/services/auth-storage";
import { useSubmitOnboardingMutation } from "@/services/onboarding-api";
import * as DocumentPicker from "expo-document-picker";

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [college, setCollege] = useState("");
  const [education, setEducation] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [branch, setBranch] = useState("");
  const [country, setCountry] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeUri, setResumeUri] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);

  const [englishLevel, setEnglishLevel] = useState("");
  const [challengingSkills, setChallengingSkills] = useState<string[]>([]);

  const [primaryGoal, setPrimaryGoal] = useState("");
  const [thirtyDayGoal, setThirtyDayGoal] = useState("");
  const [personalizedAreas, setPersonalizedAreas] = useState<string[]>([]);

  const [dailyTime, setDailyTime] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [streakChallenge, setStreakChallenge] = useState("");

  const [speakingComfort, setSpeakingComfort] = useState("");
  const [correctionPreference, setCorrectionPreference] = useState("");

  const [motivation, setMotivation] = useState("");
  const [practiceBarriers, setPracticeBarriers] = useState<string[]>([]);

  const [focusTrack, setFocusTrack] = useState("");
  const [dailyLearningGoal, setDailyLearningGoal] = useState("");

  const [submitOnboarding, { isLoading }] = useSubmitOnboardingMutation();

  const handleToggle = (value: string, list: string[], setList: (s: string[]) => void) => {
    if (list.includes(value)) setList(list.filter((x) => x !== value));
    else setList([...list, value]);
  };

  const handleSubmit = async () => {
    if (!name || !mobile || !dob) {
      Alert.alert("Validation", "Please fill required fields (name, mobile, dob)");
      return;
    }
    if (mobile.trim().length < 10 || mobile.trim().length > 20) {
      Alert.alert("Validation", "Mobile number must be 10 to 20 characters");
      return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dob.trim())) {
      Alert.alert("Validation", "Date of birth must be DD/MM/YYYY");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        mobile: mobile.trim(),
        dob: dob.trim(),
        college: college.trim(),
        education,
        yearOfStudy,
        branch,
        country,
        nativeLanguage,
        resumeUploaded,
        resumeUri,
        resumeName,
        englishLevel,
        challengingSkills,
        primaryGoal,
        thirtyDayGoal,
        personalizedAreas,
        dailyTime,
        preferredTime,
        streakChallenge,
        speakingComfort,
        correctionPreference,
        motivation,
        practiceBarriers,
        focusTrack,
        dailyLearningGoal,
      };

      await submitOnboarding(payload).unwrap();
      await setProfileCompletedInSession(true);
      router.replace("/dashboard");
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err, "Something went wrong"));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          contentInsetAdjustmentBehavior="automatic"
        >
          <View className="justify-center p-6">
            <View className="bg-white p-5 rounded-2xl">
              <Text className="text-2xl text-center font-extrabold mb-2">
                Complete Your Profile
              </Text>
              <Text className="text-center text-slate-500 mb-4">
                Help us personalize your experience.
              </Text>

              <TextInput
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                className="bg-slate-50 rounded-2xl p-3 mb-2"
              />
              <TextInput
                placeholder="Mobile Number"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                className="bg-slate-50 rounded-2xl p-3 mb-2"
              />
              <TextInput
                placeholder="Date of Birth (DD/MM/YYYY)"
                value={dob}
                onChangeText={setDob}
                className="bg-slate-50 rounded-2xl p-3 mb-2"
              />
              <TextInput
                placeholder="College Name"
                value={college}
                onChangeText={setCollege}
                className="bg-slate-50 rounded-2xl p-3 mb-2"
              />

              <Text className="font-semibold mt-3">Education / Profession</Text>
              <View className="flex-row flex-wrap my-2">
                {["Engineering Student", "Working Professional", "Job Seeker", "Others"].map(
                  (opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => setEducation(opt)}
                      className={`px-3 py-2 rounded-xl border border-slate-200 mr-2 mb-2 ${education === opt ? "bg-slate-900" : "bg-white"}`}
                    >
                      <Text className={`${education === opt ? "text-white" : "text-slate-900"}`}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

              {education === "Engineering Student" ? (
                <>
                  <Text className="font-semibold mt-2">Year of Study</Text>
                  <View className="flex-row flex-wrap my-2">
                    {["1st", "2nd", "3rd", "4th"].map((y) => (
                      <TouchableOpacity
                        key={y}
                        onPress={() => setYearOfStudy(y)}
                        className={`px-3 py-2 rounded-xl border border-slate-200 mr-2 mb-2 ${yearOfStudy === y ? "bg-slate-900" : "bg-white"}`}
                      >
                        <Text className={`${yearOfStudy === y ? "text-white" : "text-slate-900"}`}>
                          {y}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text className="font-semibold mt-2">Engineering Branch</Text>
                  <View className="flex-row flex-wrap my-2">
                    {["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "Others"].map((b) => (
                      <TouchableOpacity
                        key={b}
                        onPress={() => setBranch(b)}
                        className={`px-3 py-2 rounded-xl border border-slate-200 mr-2 mb-2 ${branch === b ? "bg-slate-900" : "bg-white"}`}
                      >
                        <Text className={`${branch === b ? "text-white" : "text-slate-900"}`}>
                          {b}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : null}

              <Text className="font-semibold mt-3">Country</Text>
              <TextInput
                placeholder="Country (auto-detect optional)"
                value={country}
                onChangeText={setCountry}
                className="bg-slate-50 rounded-2xl p-3 mb-2"
              />

              <Text className="font-semibold mt-3">Native Language</Text>
              <View className="flex-row flex-wrap my-2">
                {["Hindi", "English", "Bengali", "Tamil", "Telugu", "Other"].map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => setNativeLanguage(lang)}
                    className={`px-3 py-2 rounded-xl border border-slate-200 mr-2 mb-2 ${nativeLanguage === lang ? "bg-slate-900" : "bg-white"}`}
                  >
                    <Text
                      className={`${nativeLanguage === lang ? "text-white" : "text-slate-900"}`}
                    >
                      {lang}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={async () => {
                  try {
                    const res = await DocumentPicker.getDocumentAsync({
                      copyToCacheDirectory: false,
                    });
                    type DocResult = {
                      type?: string;
                      assets?: Array<{ uri?: string; name?: string; fileName?: string }>;
                      output?: unknown;
                      uri?: string;
                      name?: string;
                      canceled?: boolean;
                    };
                    const result = res as DocResult;
                    const success = result.type === "success" || result.canceled === false;
                    const assets =
                      result.assets ||
                      (result.output as Array<Record<string, unknown>> | null) ||
                      null;
                    if (success) {
                      if (assets && Array.isArray(assets) && assets.length > 0) {
                        const first = assets[0] as Record<string, unknown>;
                        setResumeUploaded(true);
                        setResumeUri((first.uri as string) || null);
                        setResumeName((first.name as string) || (first.fileName as string) || null);
                      } else {
                        setResumeUploaded(true);
                        setResumeUri(result.uri || null);
                        setResumeName(result.name || null);
                      }
                    }
                  } catch (err) {
                    console.warn(err);
                  }
                }}
                className="items-center my-2"
              >
                <Text className="text-indigo-600">
                  {resumeUploaded ? `Resume: ${resumeName}` : "Upload Resume (Optional)"}
                </Text>
              </TouchableOpacity>

              <Text className="font-semibold mt-3">Current English Level</Text>
              <View className="flex-row flex-wrap my-2">
                {["Beginner", "Intermediate", "Upper Intermediate", "Advanced"].map((l) => (
                  <TouchableOpacity
                    key={l}
                    onPress={() => setEnglishLevel(l)}
                    className={`px-3 py-2 rounded-xl border border-slate-200 mr-2 mb-2 ${englishLevel === l ? "bg-slate-900" : "bg-white"}`}
                  >
                    <Text className={`${englishLevel === l ? "text-white" : "text-slate-900"}`}>
                      {l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="font-semibold mt-3">Which skills do you find most challenging?</Text>
              <View className="my-2">
                {[
                  "Speaking",
                  "Listening",
                  "Vocabulary",
                  "Grammar",
                  "Pronunciation",
                  "Interview English",
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => handleToggle(opt, challengingSkills, setChallengingSkills)}
                    className="flex-row items-center py-2"
                  >
                    <View
                      className={`w-4 h-4 rounded-full mr-2 ${challengingSkills.includes(opt) ? "bg-slate-900" : "bg-slate-200"}`}
                    />
                    <Text>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="font-semibold mt-3">Learning Goals</Text>
              <View className="flex-row flex-wrap my-2">
                {["Placement prep", "Fluency", "Communication skills", "Confidence"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setPrimaryGoal(g)}
                    className={`px-3 py-2 rounded-xl border border-slate-200 mr-2 mb-2 ${primaryGoal === g ? "bg-slate-900" : "bg-white"}`}
                  >
                    <Text className={`${primaryGoal === g ? "text-white" : "text-slate-900"}`}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="Short-term goal"
                value={thirtyDayGoal}
                onChangeText={setThirtyDayGoal}
                className="bg-slate-50 rounded-2xl p-3 mb-2"
              />

              <Text className="font-semibold mt-3">
                Which areas do you want personalized guidance for?
              </Text>
              <View className="my-2">
                {["Grammar", "Pronunciation", "Conversational English", "GD/PI"].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => handleToggle(opt, personalizedAreas, setPersonalizedAreas)}
                    className="flex-row items-center py-2"
                  >
                    <View
                      className={`w-4 h-4 rounded-full mr-2 ${personalizedAreas.includes(opt) ? "bg-slate-900" : "bg-slate-200"}`}
                    />
                    <Text>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="font-semibold mt-3">Usage & Preferences</Text>
              <View className="flex-row flex-wrap my-2">
                {["10 min", "20 min", "30 min", "1 hour"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setDailyTime(t)}
                    className={`px-3 py-2 rounded-xl border border-slate-200 mr-2 mb-2 ${dailyTime === t ? "bg-slate-900" : "bg-white"}`}
                  >
                    <Text className={`${dailyTime === t ? "text-white" : "text-slate-900"}`}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="font-semibold mt-3">When do you prefer to practice daily?</Text>
              <View className="flex-row flex-wrap my-2">
                {["Morning", "Afternoon", "Evening", "Late night"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setPreferredTime(t)}
                    className={`px-3 py-2 rounded-xl border border-slate-200 mr-2 mb-2 ${preferredTime === t ? "bg-slate-900" : "bg-white"}`}
                  >
                    <Text className={`${preferredTime === t ? "text-white" : "text-slate-900"}`}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="font-semibold mt-3">Choose your Streak Challenge</Text>
              <View className="flex-row flex-wrap my-2">
                {["7-Day", "14-Day", "30-Day"].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStreakChallenge(s)}
                    className={`px-3 py-2 rounded-xl border border-slate-200 mr-2 mb-2 ${streakChallenge === s ? "bg-slate-900" : "bg-white"}`}
                  >
                    <Text className={`${streakChallenge === s ? "text-white" : "text-slate-900"}`}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="font-semibold mt-3">Speaking & Confidence</Text>
              <View className="flex-row flex-wrap my-2">
                {["Not comfortable", "Somewhat comfortable", "Comfortable"].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSpeakingComfort(s)}
                    className={`px-3 py-2 rounded-xl border border-slate-200 mr-2 mb-2 ${speakingComfort === s ? "bg-slate-900" : "bg-white"}`}
                  >
                    <Text className={`${speakingComfort === s ? "text-white" : "text-slate-900"}`}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="font-semibold mt-3">
                How would you like the AI tutor to correct you?
              </Text>
              <View className="flex-row flex-wrap my-2">
                {["Soft corrections", "Detailed feedback"].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCorrectionPreference(c)}
                    className={`px-3 py-2 rounded-xl border border-slate-200 mr-2 mb-2 ${correctionPreference === c ? "bg-slate-900" : "bg-white"}`}
                  >
                    <Text
                      className={`${correctionPreference === c ? "text-white" : "text-slate-900"}`}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="What motivates you to learn English?"
                value={motivation}
                onChangeText={setMotivation}
                className="bg-slate-50 rounded-2xl p-3 mb-2"
              />

              <Text className="font-semibold mt-3">What stops you from practicing regularly?</Text>
              <View className="my-2">
                {["Fear", "Vocabulary", "No practice partner", "Not sure where to start"].map(
                  (opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => handleToggle(opt, practiceBarriers, setPracticeBarriers)}
                      className="flex-row items-center py-2"
                    >
                      <View
                        className={`w-4 h-4 rounded-full mr-2 ${practiceBarriers.includes(opt) ? "bg-slate-900" : "bg-slate-200"}`}
                      />
                      <Text>{opt}</Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

              <Text className="font-semibold mt-3">Learning Path Setup</Text>
              <View className="flex-row flex-wrap my-2">
                {[
                  "Daily English",
                  "Spoken English",
                  "Placement English",
                  "Technical English",
                  "Public Speaking",
                ].map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFocusTrack(f)}
                    className={`px-3 py-2 rounded-xl border border-slate-200 mr-2 mb-2 ${focusTrack === f ? "bg-slate-900" : "bg-white"}`}
                  >
                    <Text className={`${focusTrack === f ? "text-white" : "text-slate-900"}`}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="font-semibold mt-3">Set your daily learning goal</Text>
              <View className="flex-row flex-wrap my-2">
                {["1 lesson/day", "2 lessons/day", "3 lessons/day"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setDailyLearningGoal(g)}
                    className={`px-3 py-2 rounded-xl border border-slate-200 mr-2 mb-2 ${dailyLearningGoal === g ? "bg-slate-900" : "bg-white"}`}
                  >
                    <Text
                      className={`${dailyLearningGoal === g ? "text-white" : "text-slate-900"}`}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className="bg-indigo-600 py-3 rounded-2xl mt-3 items-center"
              >
                <Text className="text-white font-bold">
                  {isLoading ? "Submitting..." : "Continue"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
