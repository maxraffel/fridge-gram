let itemId = 0

const foodItems = [
  { name: "Apple", imageUrl: require('../assets/images/myfridge.png') },
  { name: "Milk", imageUrl: require('../assets/images/myfridge.png') },
  { name: "Cheese", imageUrl: require('../assets/images/myfridge.png') },
  { name: "Yogurt", imageUrl: require('../assets/images/myfridge.png') },
  { name: "Carrot", imageUrl: require('../assets/images/myfridge.png') },
]

export const generateRandomItem = () => {
  const randomFood = foodItems[Math.floor(Math.random() * foodItems.length)]
  return {
    id: itemId++,
    ...randomFood,
    expirationTime: Math.floor(Math.random() * 20) + 10, // Random time between 10-30 seconds
    position: {
      top: Math.random() * 80 + "%",
      left: Math.random() * 80 + "%",
    },
  }
}

