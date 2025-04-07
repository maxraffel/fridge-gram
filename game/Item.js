"use client"

import { useState, useEffect } from "react"
import { TouchableOpacity, Image, StyleSheet } from "react-native"
import Timer from "./Timer"
import MiniGame from "./MiniGame"

const Item = ({ item, onExpire, onComplete }) => {
  const [showMiniGame, setShowMiniGame] = useState(false)
  const [timeLeft, setTimeLeft] = useState(item.expirationTime)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer)
          onExpire()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onExpire])

  const handlePress = () => {
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
    return <MiniGame onComplete={handleMiniGameComplete} onExit={handleMiniGameExit} />
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

