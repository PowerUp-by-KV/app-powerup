import React from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { ChevronRight, User, Globe, Lock, Sun, Bell, Info, ShieldCheck } from "lucide-react-native";

interface ProfileMenuProps {
  onLogout: () => void;
  onPrivacy: () => void;
}

export const ProfileMenu = ({ onLogout, onPrivacy }: ProfileMenuProps) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(true);

  const SettingsItem = ({
    icon,
    label,
    onPress,
    hasChevron = true,
    hasToggle = false,
    toggleValue,
    onToggle,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
    hasChevron?: boolean;
    hasToggle?: boolean;
    toggleValue?: boolean;
    onToggle?: (val: boolean) => void;
  }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={hasToggle}
      onPress={onPress}
      className="bg-slate-100 rounded-2xl px-5 py-3 mb-3 flex-row items-center justify-between"
    >
      <View className="flex-row items-center">
        <View className="mr-4">{icon}</View>
        <Text className="text-slate-700 font-bold text-base">{label}</Text>
      </View>
      {hasToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: "#CBD5E1", true: "#334155" }}
        />
      ) : (
        hasChevron && <ChevronRight size={20} color="#94A3B8" />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="px-5">
      <Text className="text-slate-400 font-bold text-[12px] uppercase tracking-widest mb-4 ml-1">
        Settings
      </Text>

      <SettingsItem icon={<User size={20} color="#64748B" />} label="Personal Details" />
      <SettingsItem icon={<Globe size={20} color="#64748B" />} label="Language" />
      <SettingsItem icon={<Lock size={20} color="#64748B" />} label="Passwords" />
      <SettingsItem
        icon={<Sun size={20} color="#64748B" />}
        label="Mode"
        hasChevron={false}
        hasToggle={true}
        toggleValue={isDarkMode}
        onToggle={setIsDarkMode}
      />
      <SettingsItem
        icon={<Bell size={20} color="#64748B" />}
        label="Notifications"
        hasChevron={false}
        hasToggle={true}
        toggleValue={isNotificationsEnabled}
        onToggle={setIsNotificationsEnabled}
      />

      <View className="mt-6">
        <SettingsItem icon={<Info size={20} color="#64748B" />} label="About Us" />
        <SettingsItem
          icon={<ShieldCheck size={20} color="#64748B" />}
          label="Privacy & Security"
          onPress={onPrivacy}
        />
        <TouchableOpacity onPress={onLogout} className="mt-4 items-center">
          <Text className="text-red-500 font-bold">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
