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
import { DatePicker } from "./components/DatePicker";

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [college, setCollege] = useState("");

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

  const handleSubmit = async () => {
    if (!name || !mobile || !dob || !college) {
      Alert.alert("Validation", "Please fill all required fields");
      return;
    }

    // Basic mobile validation
    if (mobile.trim().length < 10) {
      Alert.alert("Validation", "Please enter a valid mobile number");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        mobile: mobile.trim(),
        dob: dob.trim(), // Assuming DD/MM/YYYY or as required by API
        college: college.trim(),
      };

      await submitOnboarding(payload).unwrap();
      // We don't set profile completed yet because there's dynamic onboarding next
      router.replace("/dynamic-onboarding" as any);
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
        >
          <View className="p-6">
            <Text className="text-3xl text-center font-extrabold mb-2 text-slate-900">
              Create Your Profile
            </Text>
            <Text className="text-center text-slate-500 mb-8 text-lg">
              Enter your basic details to get started.
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">Full Name</Text>
                <TextInput
                  placeholder="e.g. John Doe"
                  value={name}
                  onChangeText={setName}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-slate-900 text-lg"
                />
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1 mt-4">Mobile Number</Text>
                <TextInput
                  placeholder="e.g. +91 9876543210"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-slate-900 text-lg"
                />
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1 mt-4">Date of Birth</Text>
                <DatePicker
                  date={date}
                  show={showPicker}
                  onDateChange={onDateChange}
                  onPress={() => setShowPicker(true)}
                  displayDate={dob}
                />
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1 mt-4">College Name</Text>
                <TextInput
                  placeholder="e.g. Stanford University"
                  value={college}
                  onChangeText={setCollege}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-slate-900 text-lg"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className={`py-4 rounded-2xl mt-10 items-center shadow-lg ${
                isLoading ? "bg-indigo-400" : "bg-indigo-600"
              }`}
            >
              <Text className="text-white font-bold text-xl">
                {isLoading ? "Saving..." : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
