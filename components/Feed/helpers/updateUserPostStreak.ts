import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/**
 * Updates a user's posting streak when they make a new post
 * @param userId The ID of the user making the post
 * @returns The updated streak count
 */
export const updateUserPostStreak = async (userId: string): Promise<number> => {
  const userRef = doc(db, 'users', userId);
  
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return 0;

    const userData = userDoc.data();
    const lastPostDate = userData.lastPostDate?.toDate() || null;
    const currentStreak = userData.UserStreak || 0;
    const now = new Date();
    
    // Reset time to midnight for accurate day comparison
    now.setHours(0, 0, 0, 0);
    
    let newStreak = currentStreak;
    
    if (!lastPostDate) {
      // First post ever
      newStreak = 1;
    } else {
      const lastPost = new Date(lastPostDate);
      lastPost.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((now.getTime() - lastPost.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Posted already today, maintain current streak
        newStreak = currentStreak;
      } else if (diffDays === 1) {
        // Posted yesterday, increment streak
        newStreak = currentStreak + 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }
    }
    
    // Update user document with new streak and last post date
    await updateDoc(userRef, {
      UserStreak: newStreak,
      lastPostDate: Timestamp.now()
    });
    
    return newStreak;
  } catch (error) {
    console.error('Error updating user streak:', error);
    return 0;
  }
};