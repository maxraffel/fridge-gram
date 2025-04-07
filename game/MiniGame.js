import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

const MiniGame = ({ onComplete, onExit }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mini-Game</Text>
      <TouchableOpacity style={styles.button} onPress={onComplete}>
        <Text style={styles.buttonText}>Complete Mini-Game</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <Text style={styles.exitButtonText}>Exit</Text>
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
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  exitButton: {
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

export default MiniGame

