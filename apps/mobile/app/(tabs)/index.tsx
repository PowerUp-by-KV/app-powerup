import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter, type Href } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-12 pb-8">
        <Text className="text-4xl font-bold text-gray-900 mb-2">Hello! 👋</Text>
        <Text className="text-lg text-gray-500">Ready to power up your English skills today?</Text>
      </View>

      <View className="px-6 mb-10">
        <Pressable
          onPress={() => router.push("/(tabs)/quiz" as Href)}
          className="bg-blue-600 p-8 rounded-[32px] shadow-xl active:scale-95 transition-all"
        >
          <View className="flex-row justify-between items-center mb-4">
            <View className="bg-white/20 p-3 rounded-2xl">
              <Text className="text-2xl">⚡</Text>
            </View>
            <Text className="text-white/60 font-bold uppercase tracking-widest text-xs">
              Daily Challenge
            </Text>
          </View>

          <Text className="text-white text-3xl font-bold mb-2">Practice Quizzes</Text>
          <Text className="text-blue-100 text-lg leading-relaxed mb-6">
            Master grammar and tenses with our interactive drag-and-drop exercises.
          </Text>

          <View className="bg-white py-4 rounded-2xl items-center">
            <Text className="text-blue-600 font-bold text-lg">Start Learning Now</Text>
          </View>
        </Pressable>
      </View>

      <View className="px-6">
        <Text className="text-xl font-bold text-gray-900 mb-4">Recent Progress</Text>
        <View className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <Text className="text-gray-400 text-center italic">
            Your recent activity will appear here once you complete a quiz.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
