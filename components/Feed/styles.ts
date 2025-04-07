import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  fridgeCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  ownerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  ownerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  ownerName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  fridgeImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  fridgeDescription: {
    marginTop: 4,
    marginBottom: 8,
  },
  ratingInfo: {
    marginTop: 4,
    color: "#555",
  },
  ratingSection: {
    marginTop: 16,
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  userRatingInfo: {
    alignItems: "center",
    padding: 8,
  },
  ratingInfoText: {
    fontSize: 15,
  },
  userRatingValue: {
    fontWeight: "bold",
    color: "#4CAF50",
  },
  ratingInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  commentsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  commentContainer: {
    marginBottom: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 4,
    backgroundColor: "#fafafa",
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  userName: {
    fontWeight: "bold",
  },
  commentText: {
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 12,
    color: "#555",
  },
  commentInputContainer: {
    marginBottom: 12,
    paddingBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    minHeight: 60,
  },
  toggleCommentsButton: {
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 4,
    alignItems: "center",
    marginTop: 8,
  },
  showMoreText: {
    color: "#007BFF",
  },
  noCommentsText: {
    fontStyle: "italic",
    color: "#777",
    textAlign: "center",
    padding: 8,
  },
  feedbackMessage: {
    marginTop: 8,
    color: "#4CAF50",
    textAlign: "center",
    padding: 4,
  },
  ratingInstructions: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  averageRatingContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  ratingNotice: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
    textAlign: 'center',
  },
});