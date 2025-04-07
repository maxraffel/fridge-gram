import React, { useRef, useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { useAuth } from "../components/AuthProvider";
import { GoogleLogin } from "../components/GoogleLogin";
import UploadFridgeButton from "../components/UploadFridgeButton";
import FullFeed from "../components/FullFeed";
import { useRouter } from "expo-router";
import { eventEmitter } from "../utils/eventEmitter";

export default function Dashboard() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScrollToTop = () => {
      console.log("Scroll to top event received");
      if (scrollViewRef.current) {
        console.log("ScrollView ref exists, attempting to scroll to top");
        scrollViewRef.current.scrollTo({ 
          y: 0, 
          animated: true 
        });
      } else {
        console.warn("ScrollView ref doesn't exist");
      }
    };
    
    // Subscribe to the scrollToTop event
    const unsubscribe = eventEmitter.subscribe("scrollToTop", handleScrollToTop);

    // Debug: Log when the component mounts
    console.log("Dashboard component mounted");
    
    return () => {
      console.log("Dashboard component unmounting, cleaning up event listener");
      unsubscribe();
    };
  }, []);

  interface ScrollEvent {
    nativeEvent: {
      contentOffset: {
        y: number;
      };
    };
  }

  const handleScroll = (event: ScrollEvent): void => {
    const currentPosition = event.nativeEvent.contentOffset.y;
    setScrollPosition(currentPosition);
  };

  return (
    <ScrollView 
      ref={scrollViewRef}
      contentContainerStyle={styles.container}
      scrollEventThrottle={16}
      keyboardShouldPersistTaps="handled"
      overScrollMode="always"
      onScroll={handleScroll}
    >
      <View style={styles.header}>
        {user ? (
          <>
            <View style={styles.profileSection}>
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
      
      {/* Debug info (you can remove after fixing) */}
      <Text style={{color: '#ccc', fontSize: 10, textAlign: 'center', marginTop: 10}}>
        Scroll position: {scrollPosition.toFixed(0)}px
      </Text>
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
    justifyContent: "space-between",
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
    alignSelf: "flex-end",
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