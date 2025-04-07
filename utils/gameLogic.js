let itemId = 0

const foodItems = [
  { name: "Grapes", imageUrl: require('../assets/images/grapes.png'), time: 5 },
  { name: "Milk", imageUrl: require('../assets/images/milk.png'), time: 10},
  { name: "Cheese", imageUrl: require('../assets/images/cheese.png'), time: 20 },
  { name: "Eggs", imageUrl: require('../assets/images/eggs.png'), time: 10 },
]

export const generateRandomItem = () => {
  const randomFood = foodItems[Math.floor(Math.random() * foodItems.length)]
  return {
    id: itemId++,
    ...randomFood,
    expirationTime: randomFood.time, // Random time between 5-20 seconds
    position: {
      top: Math.random() * 80 + "%",
      left: Math.random() * 80 + "%",
    },
  }
}

