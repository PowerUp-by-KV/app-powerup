import React from "react";
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { useGetProfileQuery } from "@/services/auth-api";
import { Feather } from "@expo/vector-icons";

export function HomeScreen() {
  const { data: user, isLoading } = useGetProfileQuery();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-6 py-6"
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-8 mt-4">
          <View>
            <Text className="text-slate-500 font-medium text-sm uppercase tracking-wider">
              Welcome back,
            </Text>
            <Text className="text-3xl font-extrabold text-slate-900 mt-1">
              {isLoading ? "Loading..." : user?.name || "User"}
            </Text>
          </View>
          <View className="w-14 h-14 rounded-2xl bg-indigo-50 items-center justify-center border border-indigo-100">
            <Feather name="user" size={28} color="#4f46e5" />
          </View>
        </View>

        <View className="bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-200">
          <View className="flex-row items-center mb-4">
            <View className="bg-white/10 p-2 rounded-lg mr-3">
              <Feather name="mail" size={20} color="white" />
            </View>
            <Text className="text-white/70 font-medium">Account Email</Text>
          </View>
          <Text className="text-white text-xl font-bold mb-6">
            {isLoading ? "Fetching..." : user?.email || "No email linked"}
          </Text>

          <TouchableOpacity className="bg-white py-4 rounded-2xl items-center">
            <Text className="text-slate-900 font-bold text-base">View Full Profile</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-10">
          <Text className="text-xl font-bold text-slate-900 mb-6">Continue Learning</Text>
          <View className="space-y-4">
            {[
              { title: "Speaking Practice", icon: "mic", color: "bg-blue-500" },
              { title: "Grammar Quiz", icon: "book", color: "bg-purple-500" },
              { title: "Listening Skills", icon: "headphones", color: "bg-orange-500" },
            ].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                className="flex-row items-center bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-4"
              >
                <View className={`${item.color} p-3 rounded-xl mr-4`}>
                  <Feather name={item.icon as any} size={22} color="white" />
                </View>
                <Text className="flex-1 text-slate-800 font-bold text-lg">{item.title}</Text>
                <Feather name="chevron-right" size={20} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
