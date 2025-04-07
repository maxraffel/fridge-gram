import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  signOutUser: async () => {},
});

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  // Function to ensure user data exists in Firestore
  const syncUserWithFirestore = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user document with joinDate and initial streak
        await setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          joinDate: Timestamp.now(),
          UserStreak: 0,
          lastLogin: Timestamp.now(),
        });
      } else {
        // Update existing user document
        await setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastLogin: Timestamp.now(),
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error syncing user with Firestore:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Sync user data with Firestore when logged in
        syncUserWithFirestore(firebaseUser);
      }
      
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signOutUser = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);