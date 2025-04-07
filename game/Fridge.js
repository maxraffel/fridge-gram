import { StyleSheet, ImageBackground } from "react-native"
import Item from "./Item"

const Fridge = ({ items, onItemExpire, onItemComplete }) => {
  return (
    <ImageBackground source={require('../assets/images/myfridge.png')} style={styles.container}>
      {items.map((item) => (
        <Item key={item.id} item={item} onExpire={onItemExpire} onComplete={onItemComplete} />
      ))}
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignContent: "flex-start",
    padding: 10,
  },
})

export default Fridge