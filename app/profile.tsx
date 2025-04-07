import React from "react";
import { ProfilePage } from "../components/ProfilePage";
import { useLocalSearchParams } from 'expo-router';

export default function Profile() {
  const { userId } = useLocalSearchParams();
  return <ProfilePage userId={userId as string} />;
}