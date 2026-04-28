import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, ChevronDown, Check } from "lucide-react-native";
import { ProgressChart } from "./components";

const DropdownSelector = ({
  label,
  options,
  onSelect,
}: {
  label: string;
  options: string[];
  onSelect: (val: string) => void;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        className="flex-row items-center border-[1.5px] border-[#CBD5E1] rounded-lg px-3 py-2 mr-2.5"
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text className="text-base font-bold text-[#475569] mr-1.25">{label}</Text>
        <ChevronDown size={18} color="#475569" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/10 justify-start pt-[120px] px-5"
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View className="w-[60%] bg-white rounded-xl p-1.25 max-h-[50%] elevation-5 shadow-lg shadow-black/20 border border-[#EDF2F7]">
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center justify-between py-3 px-[15px] border-b border-[#F1F5F9]/30"
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text
                    className={`text-base ${item === label ? "text-[#6366F1] font-bold" : "text-black font-medium"}`}
                  >
                    {item}
                  </Text>
                  {item === label && <Check size={18} color="#6366F1" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export const ProgressTrends = () => {
  const [module, setModule] = useState("grammar");
  const [period, setPeriod] = useState("30 Days");

  const modules = ["grammar", "listening", "reading", "Pronunciation", "Vocabulary"];
  const periods = ["7 Days", "30 Days", "90 Days", "All Time"];

  // Module specific mock data to show interactivity
  const getMockData = (mod: string) => {
    switch (mod) {
      case "listening":
        return [20, 40, 45, 10, 75];
      case "reading":
        return [10, 30, 10, 20, 90];
      default:
        return [35, 45, 20, 90, 100];
    }
  };

  const chartData = {
    labels: ["Mar 1", "Mar 15", "Mar 29"],
    datasets: [{ data: getMockData(module) }],
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/progress");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-5 py-5">
        <TouchableOpacity onPress={handleBack} className="flex-row items-center">
          <ChevronLeft size={28} color="#000" />
          <Text className="text-[22px] font-bold text-black ml-2.5">
            Progress Over <Text className="text-[#FF5A5F]">Time</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        <View className="flex-row mb-[30px] mt-2.5 z-10">
          <DropdownSelector label={module} options={modules} onSelect={setModule} />
          <DropdownSelector label={period} options={periods} onSelect={setPeriod} />
        </View>

        <ProgressChart data={chartData} />

        <View className="mt-10 px-2.5">
          <View className="flex-row items-center mb-[15px]">
            <Text className="text-2xl mr-[15px]">📈</Text>
            <Text className="text-lg font-medium text-[#475569]">+15% improvement this month</Text>
          </View>
          <View className="flex-row items-center mb-[15px]">
            <Text className="text-2xl mr-[15px]">🎯</Text>
            <Text className="text-lg font-medium text-[#475569]">
              Next goal: Reach <Text className="text-[#6366F1] font-bold">80%</Text> in {module}
            </Text>
          </View>
        </View>

        <View className="h-[50px]" />
      </ScrollView>
    </View>
  );
};
