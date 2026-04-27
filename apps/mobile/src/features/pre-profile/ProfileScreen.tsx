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
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getApiErrorMessage } from "@/services/auth-service";
import { useSubmitOnboardingMutation } from "@/services/onboarding-api";
import { DatePicker } from "./components/DatePicker";

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [college, setCollege] = useState("");
  const [education, setEducation] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [branch, setBranch] = useState("");
  const [country, setCountry] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");

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

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === "ios");
    setDate(currentDate);

    // Format date as YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    setDob(`${year}-${month}-${day}`);
  };

  const handleToggle = (value: string, list: string[], setList: (s: string[]) => void) => {
    if (list.includes(value)) setList(list.filter((x) => x !== value));
    else setList([...list, value]);
  };

  const handleSubmit = async () => {
    if (!name || !mobile || !dob || !college) {
      Alert.alert("Validation", "Please fill all required fields (Name, Mobile, DOB, College)");
      return;
    }

    if (mobile.trim().length < 10) {
      Alert.alert("Validation", "Please enter a valid mobile number");
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
      router.replace("/dynamic-onboarding" as any);
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err, "Something went wrong"));
    }
  };

  const OptionChip = ({ label, selected, onPress, multi = false }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full border mr-2 mb-2 ${
        selected ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"
      }`}
    >
      <View className="flex-row items-center">
        {multi && (
          <View
            className={`w-4 h-4 rounded-full border mr-2 items-center justify-center ${
              selected ? "bg-white border-white" : "bg-transparent border-slate-300"
            }`}
          >
            {selected && <Feather name="check" size={10} color="#4F46E5" />}
          </View>
        )}
        <Text className={`font-medium ${selected ? "text-white" : "text-slate-700"}`}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="p-6">
            <Text className="text-3xl text-center font-extrabold mb-2 text-slate-900">
              Create Your Profile
            </Text>
            <Text className="text-center text-slate-500 mb-8 text-lg">
              Enter your details to personalize your experience.
            </Text>

            <View className="space-y-6">
              {/* Basic Details */}
              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">Full Name *</Text>
                <View className="flex-row items-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <Feather name="user" size={20} color="#94A3B8" className="mr-3" />
                  <TextInput
                    placeholder="e.g. John Doe"
                    value={name}
                    onChangeText={setName}
                    className="flex-1 text-slate-900 text-lg"
                  />
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">Mobile Number *</Text>
                <View className="flex-row items-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <Feather name="phone" size={20} color="#94A3B8" className="mr-3" />
                  <TextInput
                    placeholder="e.g. +91 9876543210"
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                    className="flex-1 text-slate-900 text-lg"
                  />
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">Date of Birth *</Text>
                <DatePicker
                  date={date}
                  show={showPicker}
                  onDateChange={onDateChange}
                  onPress={() => setShowPicker(true)}
                  displayDate={dob}
                />
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">College Name *</Text>
                <View className="flex-row items-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <Feather name="book" size={20} color="#94A3B8" className="mr-3" />
                  <TextInput
                    placeholder="e.g. Stanford University"
                    value={college}
                    onChangeText={setCollege}
                    className="flex-1 text-slate-900 text-lg"
                  />
                </View>
              </View>

              {/* Education & Profession */}
              <View>
                <Text className="text-slate-700 font-semibold mb-3 ml-1">
                  Education / Profession
                </Text>
                <View className="flex-row flex-wrap">
                  {["Engineering Student", "Working Professional", "Job Seeker", "Others"].map(
                    (opt) => (
                      <OptionChip
                        key={opt}
                        label={opt}
                        selected={education === opt}
                        onPress={() => setEducation(opt)}
                      />
                    ),
                  )}
                </View>
              </View>

              {education === "Engineering Student" && (
                <>
                  <View>
                    <Text className="text-slate-700 font-semibold mb-3 ml-1">Year of Study</Text>
                    <View className="flex-row flex-wrap">
                      {["1st", "2nd", "3rd", "4th"].map((y) => (
                        <OptionChip
                          key={y}
                          label={y}
                          selected={yearOfStudy === y}
                          onPress={() => setYearOfStudy(y)}
                        />
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text className="text-slate-700 font-semibold mb-3 ml-1">
                      Engineering Branch
                    </Text>
                    <View className="flex-row flex-wrap">
                      {["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "Others"].map((b) => (
                        <OptionChip
                          key={b}
                          label={b}
                          selected={branch === b}
                          onPress={() => setBranch(b)}
                        />
                      ))}
                    </View>
                  </View>
                </>
              )}

              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">Country</Text>
                <View className="flex-row items-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <Feather name="globe" size={20} color="#94A3B8" className="mr-3" />
                  <TextInput
                    placeholder="Country"
                    value={country}
                    onChangeText={setCountry}
                    className="flex-1 text-slate-900 text-lg"
                  />
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-3 ml-1">Native Language</Text>
                <View className="flex-row flex-wrap">
                  {["Hindi", "English", "Bengali", "Tamil", "Telugu", "Other"].map((lang) => (
                    <OptionChip
                      key={lang}
                      label={lang}
                      selected={nativeLanguage === lang}
                      onPress={() => setNativeLanguage(lang)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-3 ml-1">
                  Current English Level
                </Text>
                <View className="flex-row flex-wrap">
                  {["Beginner", "Intermediate", "Upper Intermediate", "Advanced"].map((l) => (
                    <OptionChip
                      key={l}
                      label={l}
                      selected={englishLevel === l}
                      onPress={() => setEnglishLevel(l)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-3 ml-1">
                  Which skills do you find most challenging?
                </Text>
                <View className="flex-row flex-wrap">
                  {[
                    "Speaking",
                    "Listening",
                    "Vocabulary",
                    "Grammar",
                    "Pronunciation",
                    "Interview English",
                  ].map((opt) => (
                    <OptionChip
                      key={opt}
                      label={opt}
                      selected={challengingSkills.includes(opt)}
                      onPress={() => handleToggle(opt, challengingSkills, setChallengingSkills)}
                      multi
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-3 ml-1">Learning Goals</Text>
                <View className="flex-row flex-wrap">
                  {["Placement prep", "Fluency", "Communication skills", "Confidence"].map((g) => (
                    <OptionChip
                      key={g}
                      label={g}
                      selected={primaryGoal === g}
                      onPress={() => setPrimaryGoal(g)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-3 ml-1">
                  Which areas do you want personalized guidance for?
                </Text>
                <View className="flex-row flex-wrap">
                  {["Grammar", "Pronunciation", "Conversational English", "GD/PI"].map((opt) => (
                    <OptionChip
                      key={opt}
                      label={opt}
                      selected={personalizedAreas.includes(opt)}
                      onPress={() => handleToggle(opt, personalizedAreas, setPersonalizedAreas)}
                      multi
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-3 ml-1">Daily Practice Goal</Text>
                <View className="flex-row flex-wrap">
                  {["10 min", "20 min", "30 min", "1 hour"].map((t) => (
                    <OptionChip
                      key={t}
                      label={t}
                      selected={dailyTime === t}
                      onPress={() => setDailyTime(t)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-3 ml-1">
                  Preferred Practice Time
                </Text>
                <View className="flex-row flex-wrap">
                  {["Morning", "Afternoon", "Evening", "Late night"].map((t) => (
                    <OptionChip
                      key={t}
                      label={t}
                      selected={preferredTime === t}
                      onPress={() => setPreferredTime(t)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-3 ml-1">
                  Choose your Streak Challenge
                </Text>
                <View className="flex-row flex-wrap">
                  {["7-Day", "14-Day", "30-Day"].map((s) => (
                    <OptionChip
                      key={s}
                      label={s}
                      selected={streakChallenge === s}
                      onPress={() => setStreakChallenge(s)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-3 ml-1">
                  Speaking Comfort Level
                </Text>
                <View className="flex-row flex-wrap">
                  {["Not comfortable", "Somewhat comfortable", "Comfortable"].map((s) => (
                    <OptionChip
                      key={s}
                      label={s}
                      selected={speakingComfort === s}
                      onPress={() => setSpeakingComfort(s)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-3 ml-1">
                  Correction Preference
                </Text>
                <View className="flex-row flex-wrap">
                  {["Soft corrections", "Detailed feedback"].map((c) => (
                    <OptionChip
                      key={c}
                      label={c}
                      selected={correctionPreference === c}
                      onPress={() => setCorrectionPreference(c)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-3 ml-1">
                  What stops you from practicing regularly?
                </Text>
                <View className="flex-row flex-wrap">
                  {["Fear", "Vocabulary", "No practice partner", "Not sure where to start"].map(
                    (opt) => (
                      <OptionChip
                        key={opt}
                        label={opt}
                        selected={practiceBarriers.includes(opt)}
                        onPress={() => handleToggle(opt, practiceBarriers, setPracticeBarriers)}
                        multi
                      />
                    ),
                  )}
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-3 ml-1">Learning Path Setup</Text>
                <View className="flex-row flex-wrap">
                  {[
                    "Daily English",
                    "Spoken English",
                    "Placement English",
                    "Technical English",
                    "Public Speaking",
                  ].map((f) => (
                    <OptionChip
                      key={f}
                      label={f}
                      selected={focusTrack === f}
                      onPress={() => setFocusTrack(f)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-3 ml-1">Daily Lesson Goal</Text>
                <View className="flex-row flex-wrap">
                  {["1 lesson/day", "2 lessons/day", "3 lessons/day"].map((g) => (
                    <OptionChip
                      key={g}
                      label={g}
                      selected={dailyLearningGoal === g}
                      onPress={() => setDailyLearningGoal(g)}
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className={`py-4 rounded-2xl mt-10 items-center shadow-lg ${
                  isLoading ? "bg-indigo-400" : "bg-indigo-600"
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-bold text-xl">Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
