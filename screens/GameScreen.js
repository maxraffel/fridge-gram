"use client"

import { useState, useEffect, useRef } from "react"
import { View, StyleSheet, Text } from "react-native"
import Fridge from "../game/Fridge"
import { generateRandomItem } from "../utils/gameLogic"

const GameScreen = ({ onGameOver }) => {
  const [items, setItems] = useState([])
  const [gameTime, setGameTime] = useState(0)
  const gameTimeRef = useRef(gameTime)
  gameTimeRef.current = gameTime

  useEffect(() => {
    const gameTimer = setInterval(() => {
      setGameTime((prevTime) => prevTime + 1)
    }, 1000)

    const itemSpawner = setInterval(() => {
      setItems((prevItems) => [...prevItems, generateRandomItem()])
    }, 2000)

    return () => {
      clearInterval(gameTimer)
      clearInterval(itemSpawner)
    }
  }, [])

  const handleItemExpire = () => {
    onGameOver(gameTimeRef.current)
  }

  const handleItemComplete = (itemId) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>Time: {gameTime}s</Text>
      <Fridge items={items} onItemExpire={handleItemExpire} onItemComplete={handleItemComplete} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  timer: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    padding: 10,
  },
})

export default GameScreen

