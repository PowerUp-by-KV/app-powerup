import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

const QUIZ_CATEGORIES = [
  {
    title: "Tenses",
    icon: "🕙",
    colors: ["#6366f1", "#4f46e5"] as const,
    items: [
      { name: "Present Simple", route: "/quiz/present-simple-quiz" },
      { name: "Present Continuous", route: "/quiz/present-continuous-quiz" },
      { name: "Present Perfect", route: "/quiz/present-perfect-quiz" },
      { name: "Past Simple", route: "/quiz/past-simple-quiz" },
      { name: "Past Continuous", route: "/quiz/past-continuous-quiz" },
      { name: "Past Perfect", route: "/quiz/past-perfect-quiz" },
      { name: "Future Simple", route: "/quiz/future-simple-quiz" },
      { name: "Future Continuous", route: "/quiz/future-continuous-quiz" },
      { name: "Future Perfect", route: "/quiz/future-perfect-quiz" },
    ],
  },
  {
    title: "Grammar & Structure",
    icon: "📖",
    colors: ["#ec4899", "#db2777"] as const,
    items: [
      { name: "Conditionals", route: "/quiz/conditionals" },
      { name: "Modal Verbs", route: "/quiz/modal-verbs" },
      { name: "Parts of Speech", route: "/quiz/parts-of-speech" },
      { name: "Phrasal Verbs", route: "/quiz/phrasal-verb" },
      { name: "Punctuation", route: "/quiz/punctuation" },
      { name: "Reported Speech", route: "/quiz/voice-reported" },
    ],
  },
];

export function QuizScreen() {
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-[#f8fafc]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Animated.View
        entering={FadeInDown.duration(600)}
        className="px-6 pt-16 pb-10 bg-white rounded-b-[40px] shadow-sm mb-6"
      >
        <Text className="text-4xl font-extrabold text-gray-900 mb-2">Quiz Center</Text>
        <Text className="text-gray-400 text-lg font-medium leading-relaxed">
          Unlock your potential with daily grammar practices.
        </Text>
      </Animated.View>

      {QUIZ_CATEGORIES.map((category, catIndex) => (
        <View key={category.title} className="mb-10 px-6">
          <Animated.View
            entering={FadeInDown.delay(catIndex * 200).duration(600)}
            className="flex-row items-center mb-6"
          >
            <View className="bg-white p-2 rounded-xl shadow-sm mr-3">
              <Text className="text-xl">{category.icon}</Text>
            </View>
            <Text className="text-sm font-black text-gray-400 uppercase tracking-[2px]">
              {category.title}
            </Text>
          </Animated.View>

          <View className="flex-row flex-wrap justify-between">
            {category.items.map((item, index) => (
              <Animated.View
                key={item.route}
                entering={FadeInUp.delay(catIndex * 200 + index * 100)
                  .springify()
                  .damping(15)}
                layout={Layout.springify()}
                style={{ width: CARD_WIDTH }}
                className="mb-5"
              >
                <Pressable
                  onPress={() => router.push(item.route as any)}
                  className="active:scale-95 transition-all overflow-hidden rounded-[28px] bg-white border border-gray-100 shadow-sm"
                  style={{ height: 160 }}
                >
                  <LinearGradient
                    colors={category.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10"
                  />

                  <View className="p-6 h-full justify-between">
                    <View className="w-10 h-10 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100">
                      <Text className="text-lg">📋</Text>
                    </View>

                    <View>
                      <Text className="text-gray-900 font-bold text-[15px] leading-tight mb-1">
                        {item.name}
                      </Text>
                      <View className="w-4 h-1 bg-blue-500 rounded-full" />
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
