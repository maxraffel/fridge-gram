import { Timestamp } from "firebase/firestore";

// Fridge type - only store user UID
export type Fridge = {
  id: string;
  owner: string;  // Just the UID
  imageUrl: string;
  description: string;
  averageRating: number;
  ratingsCount: number;
  createdAt: Timestamp;
};

// User type for fetching from users collection
export type UserProfile = {
  displayName: string;
  photoURL: string | null;
  joinDate: Timestamp;
  UserStreak: number;
};

// Comment type - only store user UID
export type Comment = {
  id: string;
  text: string;
  createdAt: Timestamp;
  userId: string;  // Just the UID
};

// Rating type definition
export type Rating = {
  id: string;
  userId: string;
  rating: number;
  createdAt: Timestamp;
};

// Props for the Feed component
export interface FeedListProps {
  fridges: Fridge[];
  loading: boolean;
  onEndReached: () => void;
  ListEmptyComponent?: React.ReactElement;
}