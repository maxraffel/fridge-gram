import React, { useEffect, useState } from "react";
import { FlatList, ActivityIndicator, View } from "react-native";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { FridgeCard, Fridge } from "./Feed";

const BATCH_SIZE = 10;

export function FullFeed() {
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [noMoreData, setNoMoreData] = useState<boolean>(false);

  const fetchFridges = async () => {
    if (loading || noMoreData) return;
    setLoading(true);
    try {
      const fridgesRef = collection(db, "fridges");
      let q;
      if (lastDoc) {
        q = query(
          fridgesRef,
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(BATCH_SIZE)
        );
      } else {
        q = query(fridgesRef, orderBy("createdAt", "desc"), limit(BATCH_SIZE));
      }

      const snapshot = await getDocs(q);
      const newFridges: Fridge[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Fridge[];

      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      } else {
        setNoMoreData(true);
      }
      setFridges((prev) => [...prev, ...newFridges]);
    } catch (error) {
      console.error("Error fetching fridges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFridges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    if (!loading && !noMoreData) {
      fetchFridges();
    }
  };

  return (
    <FlatList
      data={fridges}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <FridgeCard fridge={item} />}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loading ? (
          <View style={{ padding: 16 }}>
            <ActivityIndicator size="small" />
          </View>
        ) : null
      }
    />
  );
}

export default FullFeed;