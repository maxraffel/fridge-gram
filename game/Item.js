"use client"

import { useState, useEffect, useRef } from "react"
import { TouchableOpacity, Image, StyleSheet } from "react-native"
import Timer from "./Timer"
import MiniGame from "./MiniGame"
import ClickDotMiniGame from "./MiniGame2"

const Item = ({ item, onExpire, onComplete }) => {
  const [showMiniGame, setShowMiniGame] = useState(false)
  const [selectedMiniGame, setSelectedMiniGame] = useState(null) // Track the selected mini-game
  const [timeLeft, setTimeLeft] = useState(item.expirationTime)
  const timerRef = useRef(null) // Use a ref to store the timer for this specific item

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timerRef.current)
          onExpire(item.id) // Pass the item's ID to onExpire
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current) // Clear the timer when the component unmounts
  }, [onExpire, item.id])

  const handlePress = () => {
    // Randomly select between MiniGame and ClickDotMiniGame
    const randomGame = Math.random() < 0.5 ? "MiniGame" : "ClickDotMiniGame"
    setSelectedMiniGame(randomGame)
    setShowMiniGame(true)
  }

  const handleMiniGameComplete = () => {
    setShowMiniGame(false)
    onComplete(item.id)
  }

  const handleMiniGameExit = () => {
    setShowMiniGame(false)
  }

  if (showMiniGame) {
    if (selectedMiniGame === "MiniGame") {
      return <MiniGame onComplete={handleMiniGameComplete} onExit={handleMiniGameExit} />
    } else if (selectedMiniGame === "ClickDotMiniGame") {
      return <ClickDotMiniGame onComplete={handleMiniGameComplete} onExit={handleMiniGameExit} />
    }
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={item.imageUrl} style={styles.image} />
      <Timer timeLeft={timeLeft} totalTime={item.expirationTime} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    margin: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
})

export default Item