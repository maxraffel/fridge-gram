import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { UserProfile } from "./types";

// Cache for user profiles to avoid redundant queries
export const userProfileCache: Record<string, UserProfile> = {};

/**
 * Fetches a user profile from Firestore or cache
 * @param userId The user ID to fetch the profile for
 * @returns A UserProfile object
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  // Check cache first
  if (userProfileCache[userId]) {
    return userProfileCache[userId];
  }
  
  // Otherwise fetch from Firestore
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      // Cache the result
      userProfileCache[userId] = userData;
      return userData;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
  
  // Return default profile if not found
  return { 
    displayName: "Unknown User",
    photoURL: null,
    joinDate: Timestamp.now(),
    UserStreak: 0
  };
};