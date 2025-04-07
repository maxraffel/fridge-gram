import { View, StyleSheet } from "react-native"

const Timer = ({ timeLeft, totalTime }) => {
  const progress = timeLeft / totalTime

  return (
    <View style={styles.container}>
      <View style={[styles.progress, { width: `${progress * 100}%` }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 2,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
})

export default Timer

