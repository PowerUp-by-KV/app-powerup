import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getApiErrorMessage } from "@/services/auth-service";
import { setProfileCompletedInSession } from "@/services/auth-storage";
import { useSubmitOnboardingMutation } from "@/services/onboarding-api";

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [showDobPicker, setShowDobPicker] = useState(false);
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDobPicker(Platform.OS === "ios");
    if (selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, "0");
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
      const year = selectedDate.getFullYear();
      setDob(`${day}/${month}/${year}`);
    }
  };

  const handleToggle = (value: string, list: string[], setList: (s: string[]) => void) => {
    if (list.includes(value)) setList(list.filter((x) => x !== value));
    else setList([...list, value]);
  };

  const handleSubmit = async () => {
    if (!name || !mobile || !dob) {
      alert("Please fill required fields (name, mobile, dob)");
      return;
    }
    if (mobile.trim().length < 10 || mobile.trim().length > 20) {
      alert("Mobile number must be 10 to 20 characters");
      return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dob.trim())) {
      alert("Date of birth must be DD/MM/YYYY");
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
      await setProfileCompletedInSession(true);
      router.replace("/dashboard");
    } catch (err) {
      alert(getApiErrorMessage(err, "Something went wrong"));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
            <View
              style={{ backgroundColor: "rgba(255,255,255,0.95)", padding: 20, borderRadius: 24 }}
            >
              <Text
                style={{ fontSize: 26, textAlign: "center", marginBottom: 8, fontWeight: "700" }}
              >
                Complete Your Profile
              </Text>
              <Text style={{ textAlign: "center", color: "#6B7280", marginBottom: 16 }}>
                Help us personalize your experience.
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F8FAFC",
                  borderRadius: 24,
                  paddingHorizontal: 12,
                  marginBottom: 10,
                }}
              >
                <Feather name="user" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  style={{ flex: 1, paddingVertical: 12 }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F8FAFC",
                  borderRadius: 24,
                  paddingHorizontal: 12,
                  marginBottom: 10,
                }}
              >
                <Feather name="phone" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Mobile Number"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  style={{ flex: 1, paddingVertical: 12 }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F8FAFC",
                  borderRadius: 24,
                  paddingHorizontal: 12,
                  marginBottom: 10,
                }}
              >
                <Feather name="calendar" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TouchableOpacity
                  onPress={() => setShowDobPicker(true)}
                  style={{ flex: 1, paddingVertical: 12 }}
                >
                  <Text style={{ color: dob ? "#000" : "#9CA3AF" }}>
                    {dob || "Date of Birth (DD/MM/YYYY)"}
                  </Text>
                </TouchableOpacity>
                {showDobPicker && (
                  <DateTimePicker
                    value={
                      dob
                        ? new Date(
                            parseInt(dob.split("/")[2]),
                            parseInt(dob.split("/")[1]) - 1,
                            parseInt(dob.split("/")[0]),
                          )
                        : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F8FAFC",
                  borderRadius: 24,
                  paddingHorizontal: 12,
                  marginBottom: 10,
                }}
              >
                <Feather name="book" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="College Name"
                  value={college}
                  onChangeText={setCollege}
                  style={{ flex: 1, paddingVertical: 12 }}
                />
              </View>

              <Text style={{ fontWeight: "600", marginTop: 12 }}>Education / Profession</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                {["Engineering Student", "Working Professional", "Job Seeker", "Others"].map(
                  (opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => setEducation(opt)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        marginRight: 8,
                        marginBottom: 8,
                        backgroundColor: education === opt ? "#9CA3AF" : "#fff",
                      }}
                    >
                      <Text style={{ color: education === opt ? "#fff" : "#111827" }}>{opt}</Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

              {education === "Engineering Student" ? (
                <>
                  <Text style={{ fontWeight: "600", marginTop: 8 }}>Year of Study</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                    {["1st", "2nd", "3rd", "4th"].map((y) => (
                      <TouchableOpacity
                        key={y}
                        onPress={() => setYearOfStudy(y)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: "#E5E7EB",
                          marginRight: 8,
                          marginBottom: 8,
                          backgroundColor: yearOfStudy === y ? "#9CA3AF" : "#fff",
                        }}
                      >
                        <Text style={{ color: yearOfStudy === y ? "#fff" : "#111827" }}>{y}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={{ fontWeight: "600", marginTop: 8 }}>Engineering Branch</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                    {["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "Others"].map((b) => (
                      <TouchableOpacity
                        key={b}
                        onPress={() => setBranch(b)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: "#E5E7EB",
                          marginRight: 8,
                          marginBottom: 8,
                          backgroundColor: branch === b ? "#9CA3AF" : "#fff",
                        }}
                      >
                        <Text style={{ color: branch === b ? "#fff" : "#111827" }}>{b}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : null}

              <Text style={{ fontWeight: "600", marginTop: 12 }}>Country</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F8FAFC",
                  borderRadius: 24,
                  paddingHorizontal: 12,
                  marginBottom: 10,
                }}
              >
                <Feather name="globe" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Country (auto-detect optional)"
                  value={country}
                  onChangeText={setCountry}
                  style={{ flex: 1, paddingVertical: 12 }}
                />
              </View>

              <Text style={{ fontWeight: "600", marginTop: 12 }}>Native Language</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                {["Hindi", "English", "Bengali", "Tamil", "Telugu", "Other"].map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => setNativeLanguage(lang)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      marginRight: 8,
                      marginBottom: 8,
                      backgroundColor: nativeLanguage === lang ? "#9CA3AF" : "#fff",
                    }}
                  >
                    <Text style={{ color: nativeLanguage === lang ? "#fff" : "#111827" }}>
                      {lang}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontWeight: "600", marginTop: 12 }}>Current English Level</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                {["Beginner", "Intermediate", "Upper Intermediate", "Advanced"].map((l) => (
                  <TouchableOpacity
                    key={l}
                    onPress={() => setEnglishLevel(l)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      marginRight: 8,
                      marginBottom: 8,
                      backgroundColor: englishLevel === l ? "#9CA3AF" : "#fff",
                    }}
                  >
                    <Text style={{ color: englishLevel === l ? "#fff" : "#111827" }}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontWeight: "600", marginTop: 12 }}>
                Which skills do you find most challenging?
              </Text>
              <View style={{ marginVertical: 8, backgroundColor: "#fff" }}>
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
                    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        marginRight: 10,
                        backgroundColor: challengingSkills.includes(opt) ? "#9CA3AF" : "#E5E7EB",
                      }}
                    />
                    <Text>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontWeight: "600", marginTop: 12 }}>Learning Goals</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                {["Placement prep", "Fluency", "Communication skills", "Confidence"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setPrimaryGoal(g)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      marginRight: 8,
                      marginBottom: 8,
                      backgroundColor: primaryGoal === g ? "#9CA3AF" : "#fff",
                    }}
                  >
                    <Text style={{ color: primaryGoal === g ? "#fff" : "#111827" }}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontWeight: "600", marginTop: 12 }}>
                Which areas do you want personalized guidance for?
              </Text>
              <View style={{ marginVertical: 8 }}>
                {["Grammar", "Pronunciation", "Conversational English", "GD/PI"].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => handleToggle(opt, personalizedAreas, setPersonalizedAreas)}
                    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        marginRight: 10,
                        backgroundColor: personalizedAreas.includes(opt) ? "#9CA3AF" : "#E5E7EB",
                      }}
                    />
                    <Text>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontWeight: "600", marginTop: 12 }}>Usage & Preferences</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                {["10 min", "20 min", "30 min", "1 hour"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setDailyTime(t)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      marginRight: 8,
                      marginBottom: 8,
                      backgroundColor: dailyTime === t ? "#9CA3AF" : "#fff",
                    }}
                  >
                    <Text style={{ color: dailyTime === t ? "#fff" : "#111827" }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontWeight: "600", marginTop: 12 }}>
                When do you prefer to practice daily?
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                {["Morning", "Afternoon", "Evening", "Late night"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setPreferredTime(t)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      marginRight: 8,
                      marginBottom: 8,
                      backgroundColor: preferredTime === t ? "#9CA3AF" : "#fff",
                    }}
                  >
                    <Text style={{ color: preferredTime === t ? "#fff" : "#111827" }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontWeight: "600", marginTop: 12 }}>Choose your Streak Challenge</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                {["7-Day", "14-Day", "30-Day"].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStreakChallenge(s)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      marginRight: 8,
                      marginBottom: 8,
                      backgroundColor: streakChallenge === s ? "#111827" : "#fff",
                    }}
                  >
                    <Text style={{ color: streakChallenge === s ? "#fff" : "#111827" }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontWeight: "600", marginTop: 12 }}>Speaking & Confidence</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                {["Not comfortable", "Somewhat comfortable", "Comfortable"].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSpeakingComfort(s)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      marginRight: 8,
                      marginBottom: 8,
                      backgroundColor: speakingComfort === s ? "#111827" : "#fff",
                    }}
                  >
                    <Text style={{ color: speakingComfort === s ? "#fff" : "#111827" }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontWeight: "600", marginTop: 12 }}>
                How would you like the AI tutor to correct you?
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                {["Soft corrections", "Detailed feedback"].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCorrectionPreference(c)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      marginRight: 8,
                      marginBottom: 8,
                      backgroundColor: correctionPreference === c ? "#111827" : "#fff",
                    }}
                  >
                    <Text style={{ color: correctionPreference === c ? "#fff" : "#111827" }}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontWeight: "600", marginTop: 12 }}>
                What stops you from practicing regularly?
              </Text>
              <View style={{ marginVertical: 8 }}>
                {["Fear", "Vocabulary", "No practice partner", "Not sure where to start"].map(
                  (opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => handleToggle(opt, practiceBarriers, setPracticeBarriers)}
                      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          marginRight: 10,
                          backgroundColor: practiceBarriers.includes(opt) ? "#111827" : "#E5E7EB",
                        }}
                      />
                      <Text>{opt}</Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

              <Text style={{ fontWeight: "600", marginTop: 12 }}>Learning Path Setup</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
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
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      marginRight: 8,
                      marginBottom: 8,
                      backgroundColor: focusTrack === f ? "#111827" : "#fff",
                    }}
                  >
                    <Text style={{ color: focusTrack === f ? "#fff" : "#111827" }}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontWeight: "600", marginTop: 12 }}>Set your daily learning goal</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                {["1 lesson/day", "2 lessons/day", "3 lessons/day"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setDailyLearningGoal(g)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      marginRight: 8,
                      marginBottom: 8,
                      backgroundColor: dailyLearningGoal === g ? "#111827" : "#fff",
                    }}
                  >
                    <Text style={{ color: dailyLearningGoal === g ? "#fff" : "#111827" }}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                style={{
                  backgroundColor: "#4F46E5",
                  paddingVertical: 12,
                  borderRadius: 24,
                  marginTop: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {isLoading ? "Submitting..." : "Continue"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
