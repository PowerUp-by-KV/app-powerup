/**
 * DynamicFieldList Component - Add/Remove list entries
 * Displays list of items with delete button
 */

import { View, Pressable, FlatList } from "react-native";
import { Text } from "@/components/Themed";
import { Button } from "./Button";

interface DynamicListItem {
  id: string;
  [key: string]: any;
}

interface DynamicFieldListProps<T extends DynamicListItem> {
  items: T[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onEdit: (item: T) => void;
  renderItem: (item: T) => React.ReactElement;
  emptyMessage?: string;
  addButtonLabel?: string;
}

export function DynamicFieldList<T extends DynamicListItem>({
  items,
  onAdd,
  onRemove,
  onEdit,
  renderItem,
  emptyMessage = "No items yet. Click 'Add' to get started.",
  addButtonLabel = "Add",
}: DynamicFieldListProps<T>) {
  return (
    <View>
      {items.length === 0 ? (
        <View className="items-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8">
          <Text className="mb-4 text-center text-gray-600">{emptyMessage}</Text>
          <Button onPress={onAdd}>{addButtonLabel}</Button>
        </View>
      ) : (
        <View>
          <FlatList
            scrollEnabled={false}
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View key={item.id} className="mb-4">
                <Pressable
                  onPress={() => onEdit(item)}
                  className="mb-2 flex-row items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                >
                  <View className="flex-1">{renderItem(item)}</View>

                  {/* Delete Button */}
                  <Pressable
                    onPress={() => onRemove(item.id)}
                    className="ml-2 items-center justify-center rounded-lg bg-red-50 p-2"
                  >
                    <Text className="text-lg text-red-600">✕</Text>
                  </Pressable>
                </Pressable>
              </View>
            )}
          />

          {/* Add More Button */}
          <Button variant="secondary" onPress={onAdd} size="md">
            {`+ ${addButtonLabel}`}
          </Button>
        </View>
      )}
    </View>
  );
}
