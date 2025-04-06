import React from "react";
import { View, Text, Image, ScrollView } from "react-native";

// Define the Fridge type with desired properties
export type Fridge = {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  location?: string;
  capacity?: number;
};

interface FeedProps {
  fridges: Fridge[];
}

// Feed component that displays a series of fridges
export function Feed({ fridges }: FeedProps) {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {fridges.map((fridge) => (
        <View key={fridge.id} style={{ marginBottom: 16, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8 }}>
          {fridge.imageUrl && (
            <Image source={{ uri: fridge.imageUrl }} style={{ width: "100%", height: 200, borderRadius: 8 }} />
          )}
          <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 8 }}>{fridge.name}</Text>
          {fridge.description && <Text style={{ marginTop: 4 }}>{fridge.description}</Text>}
          {fridge.location && <Text style={{ marginTop: 4, color: "#555" }}>Location: {fridge.location}</Text>}
          {fridge.capacity && <Text style={{ marginTop: 4, color: "#555" }}>Capacity: {fridge.capacity}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

export default Feed;
