import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, FlatList } from "react-native";
import { useAuth } from "./AuthProvider";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { FridgeCard } from "./Feed/FridgeCard";
import { Fridge, UserProfile } from "./Feed/types";
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ProfilePageProps {
  userId?: string; // Optional prop to specify a user ID
}

export function ProfilePage({ userId }: ProfilePageProps) {
  const { user } = useAuth();
  const [userFridges, setUserFridges] = useState<Fridge[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const targetUserId = userId || user?.uid; // Use provided userId or fallback to current user
        if (!targetUserId) return;

        // Fetch user profile data
        const userDoc = await getDoc(doc(db, "users", targetUserId));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }

        // Fetch fridges and calculate average rating
        const fridgesRef = collection(db, "fridges");
        const q = query(fridgesRef, where("owner", "==", targetUserId));
        const querySnapshot = await getDocs(q);

        const fridges: Fridge[] = [];
        let totalRating = 0;
        let totalRatingsCount = 0;

        querySnapshot.forEach((doc) => {
          const fridge = doc.data() as Fridge;
          fridges.push({ ...fridge, id: doc.id });

          if (fridge.averageRating && fridge.ratingsCount) {
            totalRating += fridge.averageRating * fridge.ratingsCount;
            totalRatingsCount += fridge.ratingsCount;
          }
        });

        setUserFridges(fridges);
        setAverageRating(totalRatingsCount > 0 ? totalRating / totalRatingsCount : 0);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId, user]);

  const formatJoinDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user && !userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please sign in to view your profile.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Photo */}
      <Image
        source={{ uri: userProfile?.photoURL || "https://via.placeholder.com/100" }}
        style={styles.profilePhoto}
      />

      {/* User Info */}
      <Text style={styles.userName}>{userProfile?.displayName || "Anonymous"}</Text>
      <Text style={styles.averageRating}>
        Average Rating: {averageRating.toFixed(1)}
      </Text>

      {/* Streak Display */}
      {userProfile?.UserStreak !== undefined && (
        <View style={styles.streakContainer}>
          <MaterialCommunityIcons name="fire" size={20} color="#F3B61F" />
          <Text style={styles.streakText}>
            {userProfile.UserStreak} day{userProfile.UserStreak !== 1 ? 's' : ''} streak
          </Text>
        </View>
      )}

      {/* Join Date Info */}
      <View style={styles.joinDateContainer}>
        {userProfile?.joinDate && (
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="calendar" size={20} color="#F3B61F" />
            <Text style={styles.infoText}>
              Member since {formatJoinDate(userProfile.joinDate)}
            </Text>
          </View>
        )}
      </View>

      {/* User's Feed */}
      <Text style={styles.sectionTitle}>Fridges</Text>
      {userFridges.length > 0 ? (
        <FlatList
          data={userFridges}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FridgeCard fridge={item} />}
          contentContainerStyle={styles.feedContainer}
        />
      ) : (
        <Text style={styles.noFridgesText}>No fridges posted yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  averageRating: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  feedContainer: {
    width: "100%",
  },
  noFridgesText: {
    fontSize: 16,
    color: "#888",
    marginTop: 16,
  },
  message: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 6,
    fontWeight: '500',
  },
  joinDateContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 12,
  },
});