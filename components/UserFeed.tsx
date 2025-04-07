import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { collection, query, orderBy, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Fridge } from "./Feed";
import Feed from "./Feed";
import { useAuth } from "../context/AuthContext";

export function UserFeed() {
  const { user, loading: authLoading } = useAuth();
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchUserFridges() {
      if (!user) return;
      setLoading(true);
      try {
        const fridgesRef = collection(db, "fridges");
        const q = query(
          fridgesRef,
          where("owner", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const userFridges: Fridge[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Fridge[];
        setFridges(userFridges);
      } catch (error) {
        console.error("Error fetching user fridges:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserFridges();
  }, [user]);

  if (authLoading || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Infinite scrolling is not needed when all user fridges are loaded.
  return (
    <Feed
      fridges={fridges}
      loading={false}
      onEndReached={() => {}}
      ListEmptyComponent={
        <View style={{ alignItems: "center", marginTop: 32 }}>
          <ActivityIndicator size="small" />
        </View>
      }
    />
  );
}

export default UserFeed;