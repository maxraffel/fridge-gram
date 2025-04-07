import React, { useState, useEffect } from "react";
import { Text, View, Button, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../components/AuthProvider";
import { GoogleLogin } from "@/components/GoogleLogin";
import * as DocumentPicker from "expo-document-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  getFirestore,
  doc,
  setDoc,
  arrayUnion,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { firebase, auth } from "../firebaseConfig";

export default function Index() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Welcome to FridgeGram
      </Text>
      {user ? (
        <Text>Redirecting to dashboard...</Text>
      ) : (
        <>
          <Text style={{ marginBottom: 16 }}>Please sign in to continue</Text>
          <GoogleLogin />
        </>
      )}
    </View>
  );
}
/*
  const { user } = useAuth();
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      {user && useEffect(() => {
        
      }, [user, router])}
      
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Welcome to FridgeGram</Text>
        <Button title="Upload Your Fridge!" onPress={handleUpload} />
        {user ? (
          <>
            <Text>Hello, {user.displayName || user.email}!</Text>
            <Button title="Logout?😢" onPress={handleLogout} />
            <Text>Your Uploaded Images:</Text>
            {images.length > 0 ? (
              images.map((img, index) => (
                <View key={index} style={{ alignItems: "center", margin: 10 }}>
                  <Text>{img.fileName}</Text>
                  <View style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.2)", borderRadius: 10 }}>
                    <Image
                      source={{ uri: img.imageUrl }}
                      style={{ width: 200, height: 200, margin: 10, }}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text>No images uploaded yet.</Text>
            )}
          </>
        ) : (
          <>
            <Text>Please sign in</Text>
            <GoogleLogin />
          </>
        )}
      </ScrollView>
    </View>
  )

  
  const [images, setImages] = useState<Array<{ uuid: string; imageUrl: string; fileName: string; uploadedAt: Timestamp; rating: number; numRatings: number }>>([]);
  
  const db = getFirestore(firebase);

  // Listen for changes to the user's document
  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setImages(docSnap.data().images);
          console.log("Current images: ", docSnap.data().images);
        }
      });
      return unsubscribe;
    } else {
      setImages([]);
    }
  }, [user, db]);

  const handleUpload = async () => {
    if (!user) {
      console.error("User must be signed in to upload an image.");
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets ? result.assets[0] : null;
      if (!asset) return;
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const storage = getStorage(firebase);
      const timestamp = Date.now();
      const fileRef = ref(storage, `${user.uid}/${timestamp}_${asset.name}`);
      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);
      
      console.log("Picture uploaded successfully:", downloadURL);

      await setDoc(
        doc(db, "users", user.uid),
        {
          images: arrayUnion({
            uuid: timestamp.toString() + "_" + asset.name,
            imageUrl: downloadURL,
            fileName: asset.name,
            uploadedAt: Timestamp.now(),
            rating: 0,
            numRatings: 0,
          }),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Picture upload error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome to FridgeGram</Text>
      <Button title="Upload Your Fridge!" onPress={handleUpload} />
      {user ? (
        <>
          <Text>Hello, {user.displayName || user.email}!</Text>
          <Button title="Logout?😢" onPress={handleLogout} />
          <Text>Your Uploaded Images:</Text>
          {images.length > 0 ? (
            images.map((img, index) => (
              <View key={index} style={{ alignItems: "center", margin: 10 }}>
                <Text>{img.fileName}</Text>
                <View style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.2)", borderRadius: 10 }}>
                  <Image
                    source={{ uri: img.imageUrl }}
                    style={{ width: 200, height: 200, margin: 10, }}
                  />
                </View>
              </View>
            ))
          ) : (
            <Text>No images uploaded yet.</Text>
          )}
        </>
      ) : (
        <>
          <Text>Please sign in</Text>
          <GoogleLogin />
        </>
      )}
    </ScrollView>
  );
}*/
