import React from "react";
import { Stack, Tabs } from "expo-router";
import { AuthProvider } from "../components/AuthProvider";
import { ThemeProvider } from "../components/ThemeProvider";
import { Ionicons } from '@expo/vector-icons';
import { eventEmitter } from '../utils/eventEmitter';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#F0F5FA', // Changed from white to light blue-gray
              borderTopColor: '#E7EDF3',
              height: 70, // Increased height
              paddingBottom: 12, // More padding at bottom
              paddingTop: 8,
              // Ensure the tab bar doesn't get cut off
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              elevation: 8, // Add some shadow on Android
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            tabBarActiveTintColor: '#247BA0',
            tabBarInactiveTintColor: '#64748B',
          }}
        >
          <Tabs.Screen
            name="dashboard"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
              listeners: {
                tabPress: (e: { preventDefault: () => void }) => {
                  // Always emit the scrollToTop event
                  console.log("Emitting scrollToTop event from dashboard tab");
                  eventEmitter.emit('scrollToTop');
                },
              },
            }}
          />
          <Tabs.Screen
            name="game"
            options={{
              title: "Game",
              tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="game-controller" size={size} color={color} />
              ),
              listeners: {
                tabPress: (e: { preventDefault: () => void }) => {
                  eventEmitter.emit('scrollToTop');
                },
              },
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
              href: "/profile",
              listeners: {
                tabPress: (e: { preventDefault: () => void }) => {
                  eventEmitter.emit('scrollToTop');
                },
              },
            }}
          />
          {/* Hide other screens from tab bar but keep them accessible */}
          <Tabs.Screen
            name="index"
            options={{
              href: null, // Hides the tab
            }}
          />
          <Tabs.Screen
            name="poop"
            options={{
              href: null, // Hides the tab
            }}
          />
          <Tabs.Screen
            name="fridge/[id]"
            options={{
              href: null, // Hides the tab
            }}
          />
        </Tabs>
      </AuthProvider>
    </ThemeProvider>
  );
}
