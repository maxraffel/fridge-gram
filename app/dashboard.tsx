import React from "react";
import { View, Text, Button, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { useAuth } from "../components/AuthProvider";
import { GoogleLogin } from "../components/GoogleLogin";
import UploadFridgeButton from "../components/UploadFridgeButton";
import FullFeed from "../components/FullFeed";
import { useRouter } from "expo-router";


export default function Dashboard() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {user ? (
          <>
            <View style={styles.profileSection}>
              {/* Make the profile picture a button */}
              <TouchableOpacity onPress={() => router.push("/profile")}>
                <Image
                  source={{ uri: user.photoURL || "https://via.placeholder.com/50" }}
                  style={styles.profilePicture}
                />
              </TouchableOpacity>
              <Text style={styles.greetingText}>
                Hello, {user.displayName || user.email}
              </Text>
            </View>
            <Button title="Logout" onPress={signOutUser} />
          </>
        ) : (
          <GoogleLogin />
        )}
      </View>

      <View style={styles.content}>
        {user && (
          <View style={styles.uploadSection}>
            <UploadFridgeButton />
          </View>
        )}
        {user && <Text style={styles.sectionTitle}>Recent Posts</Text>}
        <FullFeed />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Align profile section and logout button
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  logoutButton: {
    alignSelf: "flex-end", // Ensure the button is at the top right
  },
  content: {
    flex: 1,
  },
  uploadSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
});