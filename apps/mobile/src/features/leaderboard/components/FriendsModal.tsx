import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

import {
  useAcceptFriendRequestMutation,
  useListFriendRequestsQuery,
  useListFriendsQuery,
  useRejectFriendRequestMutation,
  useSearchFriendsQuery,
  useSendFriendRequestMutation,
  useGetLeaderboardQuery,
  type FriendRequest,
  type FriendRow,
  type SearchResult,
} from "@/services/social-api";
import { getAvatarUri } from "@/utils/avatar";
import { SafeFlatListProps } from "@/types";

const RequestFlatList = FlatList as unknown as React.ComponentType<
  SafeFlatListProps<FriendRequest>
>;
const FriendsFlatList = FlatList as unknown as React.ComponentType<SafeFlatListProps<FriendRow>>;
const SearchFlatList = FlatList as unknown as React.ComponentType<SafeFlatListProps<SearchResult>>;

interface FriendsModalProps {
  visible: boolean;
  onClose: () => void;
}

type Tab = "requests" | "friends" | "add";

export function FriendsModal({ visible, onClose }: FriendsModalProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [tab, setTab] = useState<Tab>("requests");
  const [query, setQuery] = useState("");

  const { data: rawRequests = [], isLoading: reqLoading } = useListFriendRequestsQuery(undefined, {
    skip: !visible,
  });

  const requests = rawRequests.filter((r: any) => {
    const dir = (r.direction || r.type || r.status || "").toLowerCase();
    return dir !== "outgoing" && dir !== "sent" && dir !== "pending_outgoing";
  });
  const { data: friends = [], isLoading: friendsLoading } = useListFriendsQuery(undefined, {
    skip: !visible,
  });
  const { data: results = [], isLoading: searchLoading } = useSearchFriendsQuery(query, {
    skip: !visible || tab !== "add" || query.length === 0,
  });

  const { data: leaderboardData, isLoading: leaderboardLoading } = useGetLeaderboardQuery(
    { period: "weekly" },
    { skip: !visible || tab !== "add" || query.length > 0 },
  );

  const displayResults: SearchResult[] =
    query.length === 0
      ? (leaderboardData?.list || [])
          .filter((u) => !u.is_you)
          .map((u) => ({
            user_id: u.user_id,
            name: u.name,
            avatar: u.avatar,
            points: u.points,
          }))
      : results;

  const isAddLoading = query.length === 0 ? leaderboardLoading : searchLoading;

  const [accept] = useAcceptFriendRequestMutation();
  const [reject] = useRejectFriendRequestMutation();
  const [send] = useSendFriendRequestMutation();

  if (!visible) return null;

  return (
    <View
      className={`absolute inset-0 z-50 ${isDark ? "bg-[#0F172A]" : "bg-white"}`}
      style={{ paddingTop: insets.top, paddingBottom: 100 }}
    >
      <View
        className={`px-4 pt-4 pb-3 flex-row items-center border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}
      >
        <Pressable onPress={onClose} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color={isDark ? "#f8fafc" : "#0f172a"} />
        </Pressable>
        <View
          className={`flex-1 mx-3 rounded-full px-3 py-2 flex-row items-center ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
        >
          <Feather name="search" size={16} color="#94a3b8" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor="#94a3b8"
            className={`flex-1 ml-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View
        className={`flex-row px-6 pt-3 border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}
        style={{ gap: 24 }}
      >
        {(["requests", "friends", "add"] as const).map((t) => {
          const isActive = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`pb-3 border-b-2 ${isActive ? "border-blue-500" : "border-transparent"}`}
            >
              <View className="flex-row items-center" style={{ gap: 6 }}>
                {t === "requests" && requests.length > 0 && (
                  <View className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
                <Text
                  className={`text-sm ${
                    isActive
                      ? "font-bold text-blue-500"
                      : `font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`
                  }`}
                >
                  {t === "requests"
                    ? "Requests"
                    : t === "friends"
                      ? `${friends.length} Friends`
                      : "Add Friends"}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {tab === "requests" ? (
        <RequestFlatList
          data={requests}
          keyExtractor={(r: FriendRequest, index) =>
            r.request_id ? `${r.request_id}-${index}` : `req-${index}`
          }
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            reqLoading ? (
              <ActivityIndicator color="#6366f1" />
            ) : (
              <Text className="text-slate-400 text-center mt-12">No pending requests</Text>
            )
          }
          renderItem={({ item }: { item: FriendRequest }) => (
            <View
              className={`flex-row items-center rounded-2xl p-3 mb-2 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}
            >
              <View
                className={`w-10 h-10 rounded-full mr-3 overflow-hidden ${isDark ? "bg-slate-700" : "bg-slate-300"}`}
              >
                <Image
                  source={{ uri: getAvatarUri(item.avatar, item.user_id) }}
                  className="w-full h-full"
                  style={{ resizeMode: "cover" }}
                />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  {item.name}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Feather
                    name="award"
                    size={10}
                    color={isDark ? "#94a3b8" : "#64748b"}
                    style={{ marginRight: 4 }}
                  />
                  <Text className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {item.points ?? 0} Points
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => accept(item.user_id)}
                className="bg-indigo-600 rounded-full px-4 py-2 flex-row items-center mr-2"
              >
                <Feather name="user-check" size={12} color="#fff" style={{ marginRight: 6 }} />
                <Text className="text-white text-xs font-bold">Accept</Text>
              </Pressable>
              <Pressable
                onPress={() => reject(item.user_id)}
                className="w-8 h-8 items-center justify-center"
              >
                <Feather name="x" size={16} color={isDark ? "#94a3b8" : "#64748b"} />
              </Pressable>
            </View>
          )}
        />
      ) : tab === "friends" ? (
        <FriendsFlatList
          data={friends}
          keyExtractor={(f: FriendRow, index) =>
            f.user_id ? `${f.user_id}-${index}` : `friend-${index}`
          }
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            friendsLoading ? (
              <ActivityIndicator color="#6366f1" />
            ) : (
              <Text className="text-slate-400 text-center mt-12">No friends yet</Text>
            )
          }
          renderItem={({ item }: { item: FriendRow }) => (
            <View
              className={`flex-row items-center rounded-2xl p-3 mb-2 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}
            >
              <View
                className={`w-10 h-10 rounded-full mr-3 overflow-hidden ${isDark ? "bg-slate-700" : "bg-slate-300"}`}
              >
                <Image
                  source={{ uri: getAvatarUri(item.avatar, item.user_id) }}
                  className="w-full h-full"
                  style={{ resizeMode: "cover" }}
                />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  {item.name}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Feather
                    name="award"
                    size={10}
                    color={isDark ? "#94a3b8" : "#64748b"}
                    style={{ marginRight: 4 }}
                  />
                  <Text className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {item.points ?? 0} Points
                  </Text>
                </View>
              </View>
              <Pressable
                className="bg-indigo-600 rounded-full px-4 py-2 mr-2"
                onPress={() => Alert.alert("Coming Soon", "Friend profiles are not available yet.")}
              >
                <Text className="text-white text-xs font-bold">View Profile</Text>
              </Pressable>
              <Pressable className="w-8 h-8 items-center justify-center">
                <Feather name="x" size={16} color={isDark ? "#94a3b8" : "#64748b"} />
              </Pressable>
            </View>
          )}
        />
      ) : (
        <SearchFlatList
          data={displayResults}
          keyExtractor={(r: SearchResult, index) =>
            r.user_id ? `${r.user_id}-${index}` : `search-${index}`
          }
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            isAddLoading ? (
              <ActivityIndicator color="#6366f1" />
            ) : (
              <Text className="text-slate-400 text-center mt-12">
                {query.length === 0 ? "No suggested friends" : "No matches"}
              </Text>
            )
          }
          renderItem={({ item }: { item: SearchResult }) => (
            <View
              className={`flex-row items-center rounded-2xl p-3 mb-2 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}
            >
              <View
                className={`w-10 h-10 rounded-full mr-3 overflow-hidden ${isDark ? "bg-slate-700" : "bg-slate-300"}`}
              >
                <Image
                  source={{ uri: getAvatarUri(item.avatar, item.user_id) }}
                  className="w-full h-full"
                  style={{ resizeMode: "cover" }}
                />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  {item.name}
                </Text>
                {item.points !== undefined && (
                  <View className="flex-row items-center mt-0.5">
                    <Feather
                      name="award"
                      size={10}
                      color={isDark ? "#94a3b8" : "#64748b"}
                      style={{ marginRight: 4 }}
                    />
                    <Text className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {item.points} Points
                    </Text>
                  </View>
                )}
              </View>
              <Pressable
                onPress={() => send({ user_id: item.user_id })}
                className="bg-indigo-600 rounded-full px-4 py-2 flex-row items-center"
              >
                <Feather name="user-plus" size={12} color="#fff" style={{ marginRight: 6 }} />
                <Text className="text-white text-xs font-bold">Add</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}
