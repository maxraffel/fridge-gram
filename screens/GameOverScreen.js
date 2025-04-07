import { View, Text, StyleSheet, TouchableOpacity } from "react-native"

const GameOverScreen = ({ survivedTime, onRestart }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.gameOverText}>Game Over!</Text>
      <Text style={styles.survivedTimeText}>You survived for {survivedTime} seconds</Text>
      <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
        <Text style={styles.restartButtonText}>Play Again</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  survivedTimeText: {
    fontSize: 18,
    marginBottom: 30,
  },
  restartButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  restartButtonText: {
    color: "white",
    fontSize: 18,
  },
})

export default GameOverScreen

