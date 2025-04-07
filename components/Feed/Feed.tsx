import React from "react";
import { FlatList, ActivityIndicator, View } from "react-native";
import { FridgeCard } from "./FridgeCard";
import { styles } from "./styles";
import { FeedListProps } from "./types";

export function Feed({ fridges, loading, onEndReached, ListEmptyComponent }: FeedListProps) {
  return (
    <FlatList
      data={fridges}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <FridgeCard fridge={item} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loading ? (
          <View style={{ padding: 16 }}>
            <ActivityIndicator size="small" />
          </View>
        ) : null
      }
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}