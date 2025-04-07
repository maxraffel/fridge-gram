import { Timestamp } from "firebase/firestore";
import {
  collection,
  doc,
  query,
  getDocs,
  runTransaction,
  where,
  getDoc
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";

/**
 * Adds a rating to a fridge and updates the average rating in the fridge document
 * 
 * @param fridgeId - The ID of the fridge being rated
 * @param userId - The ID of the user adding the rating
 * @param ratingValue - The rating value (0-12)
 * @returns Promise with the new average rating and count
 */
export async function addRating(fridgeId: string, userId: string, ratingValue: number): Promise<{
  success: boolean;
  averageRating?: number;
  ratingsCount?: number;
  error?: string;
}> {
  try {
    // Validate the rating value
    if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 12) {
      return {
        success: false,
        error: "Rating must be a number between 0 and 12"
      };
    }

    // Check if user already rated this fridge to avoid duplicates
    const userRatingCheck = await checkUserRating(fridgeId, userId);
    if (userRatingCheck.hasRated) {
      return {
        success: false,
        error: "You have already rated this fridge"
      };
    }

    // Use a transaction to ensure atomic updates
    const result = await runTransaction(db, async (transaction) => {
      // First, get the current fridge document to check if it exists
      const fridgeRef = doc(db, "fridges", fridgeId);
      const fridgeDoc = await transaction.get(fridgeRef);
      
      if (!fridgeDoc.exists()) {
        throw new Error("Fridge document does not exist");
      }
      
      // Get current ratings data from the fridge document
      const fridgeData = fridgeDoc.data();
      const currentAverage = typeof fridgeData.averageRating === 'number' && !isNaN(fridgeData.averageRating) 
        ? fridgeData.averageRating 
        : 0;
      const currentCount = typeof fridgeData.ratingsCount === 'number' && !isNaN(fridgeData.ratingsCount) 
        ? fridgeData.ratingsCount 
        : 0;
      
      // Add new rating document
      const ratingsRef = collection(db, "fridges", fridgeId, "ratings");
      const newRatingRef = doc(ratingsRef);
      
      transaction.set(newRatingRef, {
        id: newRatingRef.id,
        rating: ratingValue,
        createdAt: Timestamp.now(),
        userId: userId,
      });
      
      // Calculate new rating using the mathematical formula that doesn't require querying all ratings:
      // newAverage = (currentAverage * currentCount + newRating) / (currentCount + 1)
      const newRatingsCount = currentCount + 1;
      let newAverageRating = 0;
      
      if (newRatingsCount > 0) {
        newAverageRating = (currentAverage * currentCount + ratingValue) / newRatingsCount;
        // Round to 2 decimal places for cleaner display
        newAverageRating = Math.round(newAverageRating * 100) / 100;
      }
      
      console.log(`Updating fridge ${fridgeId} with average: ${newAverageRating}, count: ${newRatingsCount}`);
      console.log(`Previous values: average=${currentAverage}, count=${currentCount}, adding rating: ${ratingValue}`);
      
      // Update the fridge document with new average and count
      transaction.update(fridgeRef, {
        averageRating: newAverageRating,
        ratingsCount: newRatingsCount
      });
      
      return {
        averageRating: newAverageRating,
        ratingsCount: newRatingsCount
      };
    });
    
    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error("Error adding rating:", error);
    return {
      success: false,
      error: typeof error === 'object' && error !== null ? 
        (error as Error).message : 'An unknown error occurred'
    };
  }
}

/**
 * Checks if a user has already rated a fridge
 * 
 * @param fridgeId - The ID of the fridge
 * @param userId - The ID of the user
 * @returns Promise with the user's rating if they've already rated
 */
export async function checkUserRating(fridgeId: string, userId: string): Promise<{
  hasRated: boolean;
  rating?: number;
}> {
  try {
    const ratingsRef = collection(db, "fridges", fridgeId, "ratings");
    const q = query(ratingsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const ratingDoc = querySnapshot.docs[0].data();
      return {
        hasRated: true,
        rating: ratingDoc.rating
      };
    }
    
    return { hasRated: false };
  } catch (error) {
    console.error("Error checking user rating:", error);
    return { hasRated: false };
  }
}