import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  Animated, 
  StyleSheet,
  Dimensions,
  Platform,
  Modal,
  SafeAreaView,
  StatusBar,
  Share
} from "react-native";
import { Timestamp } from "firebase/firestore";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  where, 
  getDocs
} from "firebase/firestore";
import { useAuth } from "../AuthProvider";
import { db } from "../../firebaseConfig";
import { fetchUserProfile } from "./UserProfileUtils";
import { Fridge, Comment, UserProfile } from "./types";
import { addRating, checkUserRating } from "./helpers/ratingHelpers";
import { EggRating } from "./EggRating";
import { useTheme } from "../ThemeProvider";
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export function FridgeCard({ fridge }: { fridge: Fridge }) {
  const { user } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const [showAllComments, setShowAllComments] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentUserProfiles, setCommentUserProfiles] = useState<Record<string, UserProfile>>({});
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [ownerProfile, setOwnerProfile] = useState<UserProfile>({ 
    displayName: "Loading...", 
    photoURL: null,
    joinDate: Timestamp.now(),
    UserStreak: 0
  });
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  
  // Animation values
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const contentHeight = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate card entrance
    Animated.spring(cardScale, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true
    }).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, []);
  
  // Determine if current user is the owner
  const isOwner = user && user.uid === fridge.owner;
  
  // Fetch the fridge owner's profile
  useEffect(() => {
    const getOwnerProfile = async () => {
      const profile = await fetchUserProfile(fridge.owner);
      setOwnerProfile(profile);
    };
    
    getOwnerProfile();
  }, [fridge.owner]);
  
  // Check if the current user has already rated this fridge
  useEffect(() => {
    if (!user) return;
    
    const getUserRating = async () => {
      try {
        const result = await checkUserRating(fridge.id, user.uid);
        if (result.hasRated) {
          setHasRated(true);
          setUserRating(result.rating || null);
        } else {
          setHasRated(false);
          setUserRating(null);
        }
      } catch (error) {
        console.error("Error checking user rating:", error);
      }
    };
    
    getUserRating();
  }, [user, fridge.id]);

  // Listen for changes in the comments subcollection
  useEffect(() => {
    const commentsRef = collection(db, "fridges", fridge.id, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        // id: doc.id,
        ...doc.data() as Comment
      }));
      
      setComments(fetchedComments);
      
      // Fetch user profiles for all commenters
      const uniqueUserIds = [...new Set(fetchedComments.map(comment => comment.userId))];
      const profiles: Record<string, UserProfile> = {};
      
      await Promise.all(uniqueUserIds.map(async (userId) => {
        profiles[userId] = await fetchUserProfile(userId);
      }));
      
      setCommentUserProfiles(profiles);
    });
    
    return () => unsubscribe();
  }, [fridge.id]);

  const toggleExpandCard = () => {
    setIsExpanded(!isExpanded);
    
    Animated.spring(contentHeight, {
      toValue: isExpanded ? 0 : 1,
      tension: 40,
      friction: 8,
      useNativeDriver: false
    }).start();
  };

  const handleRatingChange = (newRating: number) => {
    setRatingValue(newRating);
    
    // Add subtle animation when rating changes
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 1.02,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
  };

  const submitRating = async () => {
    if (!user) {
      setFeedbackMessage("Please sign in to rate.");
      return;
    }
    
    // Prevent owners from rating their own fridges
    if (isOwner) {
      setFeedbackMessage("You cannot rate your own fridge.");
      setTimeout(() => setFeedbackMessage(""), 3000);
      return;
    }
    
    if (hasRated) {
      setFeedbackMessage(`You've already rated this fridge.`);
      setTimeout(() => setFeedbackMessage(""), 3000);
      return;
    }
    
    if (ratingValue === 0) {
      setFeedbackMessage("Please select at least one egg to rate.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the helper function to add the rating
      const result = await addRating(fridge.id, user.uid, ratingValue);
      
      if (result.success) {
        // Update local state to reflect the user has rated
        setHasRated(true);
        setUserRating(ratingValue);
        setRatingValue(0);
        setFeedbackMessage("Rating submitted successfully!");
        
        // Update the fridge object in the component with new rating data
        fridge.averageRating = result.averageRating || fridge.averageRating;
        fridge.ratingsCount = result.ratingsCount || fridge.ratingsCount;
        
        // Add a nice animation on success
        Animated.sequence([
          Animated.timing(cardScale, {
            toValue: 1.05,
            duration: 200,
            useNativeDriver: true
          }),
          Animated.timing(cardScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
          })
        ]).start();
      } else {
        setFeedbackMessage(`Failed to add rating: ${result.error}`);
      }
      
      // Clear feedback after a few seconds
      setTimeout(() => setFeedbackMessage(""), 3000);
    } catch (error) {
      console.error("Error adding rating:", error);
      setFeedbackMessage("Failed to add rating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitComment = async () => {
    if (!user) {
      setFeedbackMessage("Please sign in to comment.");
      return;
    }
    
    if (commentText.trim() === "") return;
    
    try {
      const commentsRef = collection(db, "fridges", fridge.id, "comments");
      await addDoc(commentsRef, {
        text: commentText,
        createdAt: Timestamp.now(),
        userId: user.uid
      });
      setCommentText("");
      setFeedbackMessage("Comment added.");
      
      // Clear feedback message after a few seconds
      setTimeout(() => setFeedbackMessage(""), 3000);
    } catch (error) {
      console.error("Error adding comment: ", error);
      setFeedbackMessage("Failed to add comment.");
    }
  };

  const toggleImageModal = () => {
    setImageModalVisible(!imageModalVisible);
  };

  const handleShare = async () => {
    try {
      // Create shareable URL for this fridge
      const shareUrl = `localhost:8081/fridge/${fridge.id}`;
      
      await Share.share({
        message: Platform.OS === 'ios' ? '' : `${shareUrl}`,
        url: Platform.OS === 'ios' ? shareUrl : undefined,
        title: 'Check out this fridge on FridgeGram',
      });
    } catch (error) {
      console.error('Error sharing fridge:', error);
    }
  };

  const navigateToFridgeDetail = () => {
    router.push({
      pathname: '/fridge/[id]',
      params: { id: fridge.id }
    });
  };

  const handleProfilePress = () => {
    router.push({
      pathname: '/profile',
      params: { userId: fridge.owner }
    });
  };

  // Determine which comments to display based on showAllComments state
  const visibleComments = showAllComments ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;

  const renderComment = (comment: Comment) => {
    const profile = commentUserProfiles[comment.userId] || { 
      displayName: "Anonymous", 
      photoURL: null 
    };
    
    return (
      <View key={comment.id} style={styles.commentContainer}>
        <View style={styles.commentHeader}>
          <Image 
            source={{ uri: profile.photoURL || "https://via.placeholder.com/24" }} 
            style={styles.userAvatar} 
          />
          <Text style={styles.userName}>{profile.displayName}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        <Text style={styles.commentDate}>
          {comment.createdAt.toDate().toLocaleString()}
        </Text>
      </View>
    );
  };

  // Format date in a friendly way
  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Animated.View 
      style={[
        styles.cardWrapper,
        { transform: [{ scale: cardScale }], opacity: fadeAnim }
      ]}
    >
      {/* Removed onPress handler so clicking the card doesn't navigate */}
      <TouchableOpacity activeOpacity={0.95}>
        <View style={styles.fridgeCard}>
          {/* Owner info section at the top with streak */}
          <View style={styles.ownerSection}>
            <TouchableOpacity 
              style={styles.ownerInfo}
              onPress={handleProfilePress}
              activeOpacity={0.7}
            >
              <Image 
                source={{ uri: ownerProfile.photoURL || "https://via.placeholder.com/32" }} 
                style={styles.ownerAvatar} 
              />
              <View>
                <Text style={styles.ownerName}>{ownerProfile.displayName}</Text>
                <Text style={styles.postDate}>{formatDate(fridge.createdAt)}</Text>
              </View>
            </TouchableOpacity>
            
            {/* Streak badge */}
            {ownerProfile.UserStreak > 1 && (
              <View style={styles.streakContainer}>
                <MaterialCommunityIcons name="fire" size={16} color="#F3B61F" />
                <Text style={styles.streakText}>{ownerProfile.UserStreak}</Text>
              </View>
            )}
          </View>

          {/* Fridge image with frost effect */}
          {fridge.imageUrl ? (
            <View style={styles.imageContainer}>
              <TouchableOpacity 
                activeOpacity={0.9}
                onPress={toggleImageModal}
                style={styles.imageWrapper}
              >
                <Image 
                  source={{ uri: fridge.imageUrl }} 
                  style={styles.fridgeImage}
                  resizeMode="contain"
                />
                <View style={styles.frostOverlay} />
              </TouchableOpacity>
            </View>
          ) : null}
          
          {/* Image Modal */}
          <Modal
            visible={imageModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={toggleImageModal}
          >
            <SafeAreaView style={styles.modalContainer}>
              <StatusBar backgroundColor="rgba(0, 0, 0, 0.9)" barStyle="light-content" />
              <TouchableOpacity 
                style={styles.modalCloseButton} 
                onPress={toggleImageModal}
              >
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalBackground}
                activeOpacity={1}
                onPress={toggleImageModal}
              >
                <Image
                  source={{ uri: fridge.imageUrl }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </SafeAreaView>
          </Modal>
          
          {/* Description */}
          {fridge.description ? (
            <View style={styles.descriptionContainer}>
              <Text style={styles.fridgeDescription}>{fridge.description}</Text>
            </View>
          ) : null}
          
          {/* Show either the rating input or the average rating, not both */}
          {!user || isOwner || hasRated ? (
            // If user is not logged in, is the owner, or has already rated, show only the average rating
            <View style={styles.averageRatingContainer}>
              <View style={styles.ratingHeader}>
                <MaterialCommunityIcons name="egg" size={18} color="#F3B61F" />
                <Text style={styles.ratingInfo}>
                  {fridge.averageRating.toFixed(1)} out of 12 eggs ({fridge.ratingsCount} {fridge.ratingsCount === 1 ? 'rating' : 'ratings'})
                </Text>
              </View>
              
              {fridge.ratingsCount > 0 && (
                <EggRating
                  rating={fridge.averageRating}
                  maxRating={12}
                  onRatingChange={() => {}}
                  disabled={true}
                  size={20}
                />
              )}
              
              {/* Add explanatory text if needed */}
              {user && isOwner && (
                <Text style={styles.ratingNotice}>
                  You cannot rate your own fridge.
                </Text>
              )}
              {user && hasRated && (
                <Text style={styles.ratingNotice}>
                  You rated this fridge {userRating} out of 12 eggs.
                </Text>
              )}
            </View>
          ) : (
            // If user can rate and hasn't rated yet, show only the rating input
            <View style={styles.ratingSection}>
              <View style={styles.ratingHeader}>
                <MaterialCommunityIcons name="egg-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.ratingInstructions}>
                  Rate this fridge (1-12 eggs)
                </Text>
              </View>
              
              <EggRating
                rating={ratingValue}
                maxRating={12}
                onRatingChange={handleRatingChange}
                disabled={isSubmitting}
                size={24}
              />
              
              <TouchableOpacity 
                style={[
                  styles.rateButton,
                  isSubmitting && styles.rateButtonDisabled,
                  ratingValue === 0 && styles.rateButtonDisabled
                ]}
                onPress={submitRating} 
                disabled={isSubmitting || ratingValue === 0}
              >
                <Text style={styles.rateButtonText}>
                  {isSubmitting ? "Submitting..." : "Submit Rating"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Interaction buttons */}
          <View style={styles.interactionBar}>
            <TouchableOpacity 
              style={styles.interactionButton}
              onPress={toggleExpandCard}
            >
              <Ionicons 
                name={comments.length > 0 ? "chatbubble-outline" : "chatbubble"} 
                size={20} 
                color={theme.colors.textLight} 
              />
              <Text style={styles.interactionText}>
                {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.interactionButton} onPress={handleShare}>
              <MaterialCommunityIcons 
                name="share-outline" 
                size={20} 
                color={theme.colors.textLight} 
              />
              <Text style={styles.interactionText}>Share</Text>
            </TouchableOpacity>
          </View>
          
          {/* Expandable content */}
          {isExpanded && (
            <Animated.View 
              style={[
                styles.expandableContent,
                { opacity: contentHeight }
              ]}
              onStartShouldSetResponder={() => true} // Prevent touch propagation to the parent container
            >
              {/* Comments section */}
              <View style={styles.commentsSection}>
                {/* Show comment input field */}
                <View 
                  style={styles.commentInputContainer}
                  onStartShouldSetResponder={() => true} // Ensure touches here are captured
                >
                  <TextInput
                    placeholder="Add a comment..."
                    value={commentText}
                    onChangeText={setCommentText}
                    style={styles.commentInput}
                    multiline
                    placeholderTextColor={theme.colors.textLight}
                  />
                  <TouchableOpacity 
                    style={styles.postButton}
                    onPress={submitComment}
                    disabled={!commentText.trim()}
                  >
                    <Text style={[
                      styles.postButtonText,
                      !commentText.trim() && styles.postButtonTextDisabled
                    ]}>Post</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Display comments */}
                {comments.length > 0 ? (
                  <>
                    {visibleComments.map(renderComment)}
                    
                    {/* Show toggle button only if there are more than 3 comments */}
                    {hasMoreComments && (
                      <TouchableOpacity 
                        style={styles.toggleCommentsButton}
                        onPress={() => setShowAllComments(!showAllComments)}
                      >
                        <Text style={styles.showMoreText}>
                          {showAllComments ? "Show less" : `Show more comments (${comments.length - 3} more)`}
                        </Text>
                        <Ionicons 
                          name={showAllComments ? "chevron-up" : "chevron-down"} 
                          size={16} 
                          color={theme.colors.primary}
                          style={{marginLeft: 4}} 
                        />
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={styles.noCommentsContainer}>
                    <MaterialCommunityIcons 
                      name="comment-text-outline" 
                      size={24} 
                      color={theme.colors.steelDark} 
                    />
                    <Text style={styles.noCommentsText}>No comments yet</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}
          
          {feedbackMessage !== "" && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackMessage}>{feedbackMessage}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
    // Add shadow based on platform
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  fridgeCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  ownerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4, // Add padding for better touch area
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#A0D1E6',
  },
  ownerName: {
    fontWeight: "700",
    fontSize: 16,
    color: '#334155',
  },
  postDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 182, 31, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  streakText: {
    color: '#F3B61F',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: width * 0.5,  // Slightly reduced height for better scaling
    backgroundColor: '#E7EDF3',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  fridgeImage: {
    width: '100%',
    height: '100%',
  },
  frostOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(8px)',  // Note: This works on iOS, but may need additional setup for Android
  },
  descriptionContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  fridgeDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  averageRatingContainer: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F0F4F8',
    alignItems: 'center',
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingInfo: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  ratingNotice: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#64748B',
    textAlign: 'center',
  },
  ratingSection: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F0F4F8',
    alignItems: 'center',
  },
  ratingInstructions: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  rateButton: {
    backgroundColor: '#247BA0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#247BA0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  rateButtonDisabled: {
    backgroundColor: '#C7D2DD',
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  rateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  interactionBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F4F8',
  },
  interactionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  interactionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#64748B',
  },
  expandableContent: {
    borderTopWidth: 1,
    borderTopColor: '#F0F4F8',
  },
  commentsSection: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  commentInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EDF3',
    borderRadius: 16,
    padding: 12,
    fontSize: 14,
    minHeight: 40,
    maxHeight: 100,
    color: '#334155',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  postButton: {
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#247BA0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  postButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  commentContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.04)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  userName: {
    fontWeight: "600",
    fontSize: 14,
    color: '#334155',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
    marginBottom: 8,
  },
  commentDate: {
    fontSize: 12,
    color: '#64748B',
    alignSelf: 'flex-end',
  },
  toggleCommentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(160, 209, 230, 0.1)',
    borderRadius: 8,
    marginTop: 8,
  },
  showMoreText: {
    color: '#247BA0',
    fontSize: 14,
    fontWeight: '500',
  },
  noCommentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  noCommentsText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  feedbackContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackMessage: {
    color: '#10B981',
    fontWeight: '500',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width,
    height: width,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
});