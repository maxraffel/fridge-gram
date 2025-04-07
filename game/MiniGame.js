import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native"
import { useState, useEffect } from "react"

const MiniGame = ({ onComplete, onExit }) => {
  const wordList = ["APPLE", "GRAPE", "MANGO", "PEACH", "BERRY"] // List of 5 random words
  const [correctWord, setCorrectWord] = useState("") // Correct word to guess
  const [guess, setGuess] = useState("") // Track the user's current guess
  const [attempts, setAttempts] = useState([]) // Track all attempts
  const [message, setMessage] = useState("Guess the 5-letter word!")

  useEffect(() => {
    // Randomly select a word from the list when the component mounts
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)]
    setCorrectWord(randomWord)
  }, [])

  const handleGuess = () => {
    if (guess.length !== 5) {
      setMessage("Your guess must be 5 letters!")
      return
    }

    const upperGuess = guess.toUpperCase()
    setAttempts([...attempts, upperGuess])

    if (upperGuess === correctWord) {
      setMessage("You guessed the word!")
      setTimeout(onComplete, 1000) // Call onComplete after a short delay
    } else {
      setMessage("Try again!")
    }

    setGuess("") // Reset the input field
  }

  const renderAttempt = (attempt) => {
    return attempt.split("").map((letter, index) => {
      const isCorrect = letter === correctWord[index]
      const isInWord = !isCorrect && correctWord.includes(letter)

      return (
        <Text
          key={index}
          style={[
            styles.letter,
            isCorrect ? styles.correct : isInWord ? styles.inWord : styles.incorrect,
          ]}
        >
          {letter}
        </Text>
      )
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wordle Mini-Game</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.attemptsContainer}>
        {attempts.map((attempt, index) => (
          <View key={index} style={styles.attemptRow}>
            {renderAttempt(attempt)}
          </View>
        ))}
      </View>
      <TextInput
        style={styles.input}
        value={guess}
        onChangeText={setGuess}
        placeholder="Enter your guess"
        maxLength={5}
      />
      <TouchableOpacity style={styles.guessButton} onPress={handleGuess}>
        <Text style={styles.guessButtonText}>Submit Guess</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  attemptsContainer: {
    width: "100%",
    marginBottom: 20,
  },
  attemptRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 5,
  },
  letter: {
    width: 40,
    height: 40,
    lineHeight: 40,
    textAlign: "center",
    margin: 2,
    fontSize: 18,
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  correct: {
    backgroundColor: "#4CAF50", // Green for correct letters
    color: "white",
  },
  inWord: {
    backgroundColor: "#FFC107", // Yellow for letters in the word but wrong position
    color: "white",
  },
  incorrect: {
    backgroundColor: "#f44336", // Red for incorrect letters
    color: "white",
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  guessButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  guessButtonText: {
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