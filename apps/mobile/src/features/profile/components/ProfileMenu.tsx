import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
}

interface ProfileMenuProps {
  menuItems: MenuItem[];
}

export const ProfileMenu = ({ menuItems }: ProfileMenuProps) => {
  return (
    <View className="px-5 mb-10">
      <View className="bg-white rounded-[30px] py-2.5 shadow-sm shadow-black/5 elevation-3">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center justify-between py-3.5 px-5 ${
              index === menuItems.length - 1 ? "" : "border-b border-[#F1F5F9]"
            }`}
            onPress={item.onPress}
            activeOpacity={0.6}
          >
            <View className="flex-row items-center">
              <View
                className={`w-10 h-10 rounded-xl justify-center items-center ${
                  item.isDestructive ? "bg-[#FEE2E2]" : "bg-[#F8FAFC]"
                }`}
              >
                {item.icon}
              </View>
              <Text
                className={`text-base ml-[15px] font-bold ${
                  item.isDestructive ? "text-[#EF4444]" : "text-[#334155]"
                }`}
              >
                {item.label}
              </Text>
            </View>
            {!item.isDestructive && <ChevronRight size={18} color="#CBD5E1" />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
