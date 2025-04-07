import React from "react";
import { View, Text, Button, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { useAuth } from "../components/AuthProvider";
import { GoogleLogin } from "../components/GoogleLogin";
import UploadFridgeButton from "../components/UploadFridgeButton";
import FullFeed from "../components/FullFeed";
import { useRouter } from "expo-router";
import { useState } from "react"
import GameScreen from "../screens/GameScreen"
import GameOverScreen from "../screens/GameOverScreen"


export default function Game() {
    const [gameOver, setGameOver] = useState(false)
    const [survivedTime, setSurvivedTime] = useState(0)
  
    const handleGameOver = (time) => {
      setGameOver(true)
      setSurvivedTime(time)
    }
  
    const restartGame = () => {
      setGameOver(false)
      setSurvivedTime(0)
    }
  
    return (
      <View style={styles.container}>
        {gameOver ? (
          <GameOverScreen survivedTime={survivedTime} onRestart={restartGame} />
        ) : (
          <GameScreen onGameOver={handleGameOver} />
        )}
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
  })