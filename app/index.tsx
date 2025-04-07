import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "../components/AuthProvider";
import { GoogleLogin } from "../components/GoogleLogin";

export default function Index() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user && pathname !== "/dashboard") {
      router.replace("/dashboard");
    }
  }, [user, pathname, router]);

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
