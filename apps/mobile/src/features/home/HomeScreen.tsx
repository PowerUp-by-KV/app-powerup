import React from "react";
import { Alert, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useGetProfileQuery } from "@/services/auth-api";

import { FeatureCard } from "./components/FeatureCard";

export function HomeScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-slate-500 text-sm">Welcome back</Text>
            <Text className="text-slate-900 text-2xl font-extrabold">
              {profile?.name ?? "Learner"}
            </Text>
          </View>
          {profile?.cefr_range && (
            <View className="bg-indigo-100 px-3 py-1 rounded-full">
              <Text className="text-indigo-700 font-bold text-xs tracking-wider">
                {profile.cefr_range}
              </Text>
            </View>
          )}
        </View>

        <FeatureCard
          title="Convo Coach"
          subtitle="Practice real conversations with AI"
          icon="💬"
          backgroundColor="#4f46e5"
          onPress={() => Alert.alert("Coming soon", "Convo Coach launches in the next release.")}
        />
        <FeatureCard
          title="Resume Studio"
          subtitle="Build and polish your resume"
          icon="📄"
          backgroundColor="#db2777"
          onPress={() => router.push("/resume" as never)}
        />
        <FeatureCard
          title="Learning Journey"
          subtitle="Continue your CEFR learning path"
          icon="🎓"
          backgroundColor="#059669"
          onPress={() => router.push("/dashboard" as never)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
