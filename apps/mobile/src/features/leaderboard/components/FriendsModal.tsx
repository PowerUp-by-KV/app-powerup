import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import {
  useAcceptFriendRequestMutation,
  useListFriendRequestsQuery,
  useListFriendsQuery,
  useRejectFriendRequestMutation,
  useSearchFriendsQuery,
  useSendFriendRequestMutation,
  type FriendRequest,
  type FriendRow,
  type SearchResult,
} from "@/services/social-api";

interface SafeFlatListProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  contentContainerStyle?: any;
  ListEmptyComponent?: React.ReactNode;
  renderItem: (info: { item: T; index: number }) => React.ReactElement | null;
  className?: string;
}

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
  const [tab, setTab] = useState<Tab>("requests");
  const [query, setQuery] = useState("");

  const { data: requests = [], isLoading: reqLoading } = useListFriendRequestsQuery(undefined, {
    skip: !visible,
  });
  const { data: friends = [], isLoading: friendsLoading } = useListFriendsQuery(undefined, {
    skip: !visible,
  });
  const { data: results = [], isLoading: searchLoading } = useSearchFriendsQuery(query, {
    skip: !visible || tab !== "add" || query.length < 2,
  });

  const [accept] = useAcceptFriendRequestMutation();
  const [reject] = useRejectFriendRequestMutation();
  const [send] = useSendFriendRequestMutation();

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View className="px-4 pt-12 pb-3 flex-row items-center border-b border-slate-100">
          <Pressable onPress={onClose} className="w-9 h-9 items-center justify-center">
            <Feather name="chevron-left" size={22} color="#0f172a" />
          </Pressable>
          <View className="flex-1 mx-3 bg-slate-100 rounded-full px-3 py-2 flex-row items-center">
            <Feather name="search" size={16} color="#94a3b8" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor="#94a3b8"
              className="flex-1 ml-2 text-slate-900"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View className="flex-row px-4 py-3" style={{ gap: 8 }}>
          {(["requests", "friends", "add"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`px-3 py-1.5 rounded-full ${tab === t ? "bg-slate-900" : "bg-slate-100"}`}
            >
              <Text className={`text-xs font-bold ${tab === t ? "text-white" : "text-slate-600"}`}>
                {t === "requests"
                  ? `Requests${requests.length > 0 ? ` (${requests.length})` : ""}`
                  : t === "friends"
                    ? `${friends.length} Friends`
                    : "Add Friends"}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === "requests" ? (
          <RequestFlatList
            data={requests}
            keyExtractor={(r: FriendRequest) => r.request_id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              reqLoading ? (
                <ActivityIndicator color="#6366f1" />
              ) : (
                <Text className="text-slate-400 text-center mt-12">No pending requests</Text>
              )
            }
            renderItem={({ item }: { item: FriendRequest }) => (
              <View className="flex-row items-center bg-slate-50 rounded-2xl p-3 mb-2">
                <View className="w-8 h-8 rounded-full bg-slate-300 mr-3" />
                <View className="flex-1">
                  <Text className="text-slate-900 font-semibold">{item.name}</Text>
                  <Text className="text-slate-500 text-xs">{item.points} pts</Text>
                </View>
                <Pressable
                  onPress={() => accept(item.user_id)}
                  className="bg-slate-900 rounded-full px-3 py-1.5 mr-2"
                >
                  <Text className="text-white text-xs font-bold">Accept</Text>
                </Pressable>
                <Pressable
                  onPress={() => reject(item.user_id)}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Feather name="x" size={18} color="#94a3b8" />
                </Pressable>
              </View>
            )}
          />
        ) : tab === "friends" ? (
          <FriendsFlatList
            data={friends}
            keyExtractor={(f: FriendRow) => f.user_id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              friendsLoading ? (
                <ActivityIndicator color="#6366f1" />
              ) : (
                <Text className="text-slate-400 text-center mt-12">No friends yet</Text>
              )
            }
            renderItem={({ item }: { item: FriendRow }) => (
              <View className="flex-row items-center bg-slate-50 rounded-2xl p-3 mb-2">
                <View className="w-8 h-8 rounded-full bg-slate-300 mr-3" />
                <View className="flex-1">
                  <Text className="text-slate-900 font-semibold">{item.name}</Text>
                  <Text className="text-slate-500 text-xs">{item.points} pts</Text>
                </View>
                <Pressable
                  className="border border-slate-300 rounded-full px-3 py-1.5"
                  onPress={() =>
                    Alert.alert("Coming Soon", "Friend profiles are not available yet.")
                  }
                >
                  <Text className="text-slate-900 text-xs font-bold">View Profile</Text>
                </Pressable>
              </View>
            )}
          />
        ) : (
          <SearchFlatList
            data={results}
            keyExtractor={(r: SearchResult) => r.user_id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              query.length < 2 ? (
                <Text className="text-slate-400 text-center mt-12">Type at least 2 characters</Text>
              ) : searchLoading ? (
                <ActivityIndicator color="#6366f1" />
              ) : (
                <Text className="text-slate-400 text-center mt-12">No matches</Text>
              )
            }
            renderItem={({ item }: { item: SearchResult }) => (
              <View className="flex-row items-center bg-slate-50 rounded-2xl p-3 mb-2">
                <View className="w-8 h-8 rounded-full bg-slate-300 mr-3" />
                <View className="flex-1">
                  <Text className="text-slate-900 font-semibold">{item.name}</Text>
                </View>
                <Pressable
                  onPress={() => send({ user_id: item.user_id })}
                  className="bg-slate-900 rounded-full px-3 py-1.5"
                >
                  <Text className="text-white text-xs font-bold">Add</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </View>
    </Modal>
  );
}
