import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react-native";

interface StreakCalendarProps {
  viewMode: "Weekly" | "Monthly";
}

export const StreakCalendar = ({ viewMode }: StreakCalendarProps) => {
  const [viewDate, setViewDate] = React.useState(new Date()); // Current system date
  const days = ["S", "M", "T", "W", "T", "F", "S"];

  // Generate calendar days dynamically
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const calendar: { day: number; currentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      calendar.push({ day: prevMonthLastDay - i, currentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      calendar.push({ day: i, currentMonth: true });
    }

    // Next month padding to complete the grid (usually 35 or 42 cells)
    const remaining = (7 - (calendar.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      calendar.push({ day: i, currentMonth: false });
    }

    return calendar;
  };

  const calendarDays = generateCalendarDays(viewDate);

  // In Weekly mode, show only the row containing today (or the start of the current week)
  const getWeeklySlice = () => {
    const today = viewDate.getDate();
    const todayIndex = calendarDays.findIndex((d) => d.day === today && d.currentMonth);
    if (todayIndex === -1) return calendarDays.slice(0, 7);
    const startOfWeek = Math.floor(todayIndex / 7) * 7;
    return calendarDays.slice(startOfWeek, startOfWeek + 7);
  };

  const displayDays = viewMode === "Weekly" ? getWeeklySlice() : calendarDays;

  const monthName = viewDate.toLocaleString("default", { month: "long" });
  const yearName = viewDate.getFullYear();

  // Streak logic: Mock a 5-day streak ending today (April 13th)
  const streakEnd = 13;
  const streakStart = 9;

  const isInStreak = (day: number, isCurrentMonth: boolean) =>
    isCurrentMonth && day >= streakStart && day <= streakEnd && viewDate.getMonth() === 3; // April 2026

  const isStreakStart = (day: number, isCurrentMonth: boolean) =>
    isCurrentMonth && day === streakStart;
  const isStreakEnd = (day: number, isCurrentMonth: boolean) => isCurrentMonth && day === streakEnd;
  const isStreakMiddle = (day: number, isCurrentMonth: boolean) =>
    isCurrentMonth && day > streakStart && day < streakEnd;

  const navigateMonth = (offset: number) => {
    const nextDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(nextDate);
  };

  return (
    <View className="bg-slate-100 rounded-[32px] p-6 pb-8">
      {/* Month Selector */}
      <View className="flex-row justify-between items-center mb-6 px-2">
        <TouchableOpacity onPress={() => navigateMonth(-1)}>
          <ChevronLeft size={20} color="#334155" />
        </TouchableOpacity>
        <Text className="text-slate-800 font-bold text-xl">
          {monthName} {yearName}
        </Text>
        <TouchableOpacity onPress={() => navigateMonth(1)}>
          <ChevronRight size={20} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* Week Day Headers */}
      <View className="flex-row justify-between px-5 mb-8">
        {days.map((d, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-slate-500 font-bold text-xs uppercase tracking-tighter">{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View className="flex-row flex-wrap justify-center w-full">
        {displayDays.map((date, index) => {
          const inStreak = isInStreak(date.day, date.currentMonth);
          const isStart = isStreakStart(date.day, date.currentMonth);
          const isEnd = isStreakEnd(date.day, date.currentMonth);
          const isMiddle = isStreakMiddle(date.day, date.currentMonth);

          return (
            <View key={index} className="w-[14.28%] h-10 items-center justify-center relative">
              {/* Streak Pill Background */}
              {inStreak && (
                <View
                  className={`absolute h-[28px] bg-slate-400/90
                    ${isStart ? "left-[10%] right-0 rounded-l-full" : ""}
                    ${isEnd ? "left-0 right-[10%] rounded-r-full" : ""}
                    ${isMiddle ? "left-0 right-0" : ""}
                  `}
                />
              )}

              <View className="items-center justify-center w-full h-full z-10">
                {inStreak ? (
                  <View className="items-center justify-center">
                    <Flame size={10} color="white" fill="white" />
                  </View>
                ) : (
                  <Text
                    className={`text-[13px] font-bold ${date.currentMonth ? "text-slate-700" : "text-slate-300"}`}
                  >
                    {date.day}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
