import { StyleProp, ViewStyle, FlatList } from "react-native";
import React from "react";

export type { AppEnvironment } from "@powerup/shared";

export interface SafeFlatListProps<T> {
  data: T[] | readonly T[] | null | undefined;
  keyExtractor: (item: T, index: number) => string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  renderItem: (info: { item: T; index: number }) => React.ReactElement | null;
  className?: string;
  ref?: React.Ref<FlatList<T>> | any;
}
