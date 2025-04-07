import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { useState } from "react"

const ClickDotMiniGame = ({ onComplete, onExit }) => {
  const [clickCount, setClickCount] = useState(0) // Track the number of successful clicks
  const [dotPosition, setDotPosition] = useState(generateRandomPosition()) // Random position for the dot
  const [message, setMessage] = useState("Click the dot 3 times to win!")

  const handleDotClick = () => {
    const newClickCount = clickCount + 1
    setClickCount(newClickCount)

    if (newClickCount >= 3) {
      setMessage("You won!")
      setTimeout(onComplete, 1000) // Call onComplete after a short delay
    } else {
      setMessage(`Good job! ${3 - newClickCount} clicks to go!`)
      setDotPosition(generateRandomPosition()) // Move the dot to a new random position
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity
        style={[styles.dot, { top: dotPosition.top, left: dotPosition.left }]}
        onPress={handleDotClick}
      />
      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <Text style={styles.exitButtonText}>Exit</Text>
      </TouchableOpacity>
    </View>
  )
}

// Helper function to generate a random position for the dot
const generateRandomPosition = () => {
  const { width, height } = Dimensions.get("window") // Get screen dimensions
  const top = Math.random() * (height / 4 - 50) // Subtract dot size to keep it within bounds
  const left = Math.random() * (width / 4 - 50) // Subtract dot size to keep it within bounds
  return { top, left }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  dot: {
    position: "absolute",
    width: 50,
    height: 50,
    backgroundColor: "#2196F3",
    borderRadius: 25,
  },
  exitButton: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "#f44336",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  exitButtonText: {
    color: "white",
    fontSize: 18,
  },
})

export default ClickDotMiniGame