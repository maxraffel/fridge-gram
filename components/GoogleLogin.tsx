import React from "react";
import { Button, View, Text } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { auth } from "../firebaseConfig";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";

// complete existing auth session handling
WebBrowser.maybeCompleteAuthSession();

export function GoogleLogin() {
  const redirectUri = makeRedirectUri({ scheme: "fridgegram" });

  const [request, response, promptAsync] = Google.useAuthRequest({
    responseType: "id_token",
    clientId:
      "846955502883-ki2bqu42ds5esanaidcap423g82dpino.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID",
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    webClientId:
      "846955502883-ki2bqu42ds5esanaidcap423g82dpino.apps.googleusercontent.com",
    redirectUri,
    scopes: ["profile", "email"],
  });

  const handleLogin = async () => {
    const result = await promptAsync({ showInRecents: true });
    console.log("Auth result:", result);
    if (result.type === "success" && result.params) {
      const { id_token } = result.params;
      if (!id_token) {
        console.error("No idToken returned");
        return;
      }
      const credential = GoogleAuthProvider.credential(id_token);
      try {
        await signInWithCredential(auth, credential);
        console.log("Signed in with Google!");
      } catch (error) {
        console.error("Firebase Sign-In Error:", error);
      }
    } else {
      console.log("Login canceled or failed");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Sign in to FridgeGram</Text>
      <Button disabled={!request} title="Sign in with Google" onPress={handleLogin} />
    </View>
  );
}
