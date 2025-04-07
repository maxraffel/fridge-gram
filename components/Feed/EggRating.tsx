import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Text, 
  Animated 
} from 'react-native';
import { filledEggBase64, emptyEggBase64 } from '../../assets/eggPlaceholders';

interface EggRatingProps {
  rating: number;
  maxRating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
  size?: number;
  allowHalfEgg?: boolean;
}

export const EggRating = ({ 
  rating, 
  maxRating = 12, 
  onRatingChange, 
  disabled = false,
  size = 24,
  allowHalfEgg = true
}: EggRatingProps) => {
  // Use animated values for egg press effect
  const getAnimatedEgg = () => new Animated.Value(1);
  const eggScales = Array(maxRating).fill(0).map(() => getAnimatedEgg());
  
  const handlePress = (index: number, isHalf: boolean = false) => {
    if (disabled) return;
    
    // Calculate new rating based on index and whether half-egg was clicked
    const newRating = index + (isHalf ? 0.5 : 1);
    
    // Animate the pressed egg
    Animated.sequence([
      Animated.timing(eggScales[Math.floor(index)], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(eggScales[Math.floor(index)], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
    
    onRatingChange(newRating);
  };

  const currentRating = rating || 0;
  const noRatingChosen = rating === 0 || rating === undefined;
  const rowSize = 6;
  const rows = Math.ceil(maxRating / rowSize);

  // Simplified egg state determination
  const getEggState = (index: number) => {
    if (index < Math.floor(currentRating)) return 'filled';
    if (index === Math.floor(currentRating) && currentRating % 1 !== 0) return 'half';
    return 'empty';
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.eggCarton}>
        {[...Array(rows)].map((_, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.eggRow}>
            {[...Array(Math.min(rowSize, maxRating - rowIndex * rowSize))].map((_, eggIndex) => {
              const eggArrayIndex = rowIndex * rowSize + eggIndex;
              const eggState = getEggState(eggArrayIndex);

              return (
                <TouchableOpacity
                  key={`egg-${eggArrayIndex}`}
                  onPress={() => handlePress(eggArrayIndex, false)}
                  onLongPress={() => allowHalfEgg && handlePress(eggArrayIndex, true)}
                  disabled={disabled}
                  activeOpacity={disabled ? 1 : 0.7}
                  style={styles.touchableEgg}
                >
                  <Animated.View
                    style={[
                      styles.eggContainer, 
                      { 
                        width: size, 
                        height: size * 1.3,
                        transform: [{ scale: eggScales[eggArrayIndex] }] 
                      }
                    ]}
                  >
                    {/* Background glow for any active egg */}
                    {(eggState === 'filled' || eggState === 'half') && 
                      <View style={[styles.glow, { width: size * 1.5, height: size * 1.5 }]} />
                    }
                    
                    {/* For half eggs, use filled egg as base with right half masked */}
                    {eggState === 'half' ? (
                      <View style={styles.halfEggContainer}>
                        {/* Base filled egg */}
                        <Image
                          source={{ uri: filledEggBase64 }}
                          style={[styles.egg, { width: size, height: size * 1.3 }]}
                          resizeMode="contain"
                        />
                        
                        {/* Right half mask (empty egg right half) */}
                        <View style={styles.rightHalfMask}>
                          <Image
                            source={{ uri: emptyEggBase64 }}
                            style={[styles.egg, { width: size, height: size * 1.3 }]}
                            resizeMode="contain"
                          />
                        </View>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: eggState === 'filled' ? filledEggBase64 : emptyEggBase64 }}
                        style={[styles.egg, { width: size, height: size * 1.3 }]}
                        resizeMode="contain"
                      />
                    )}
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
      
      <Text style={[
        styles.ratingText,
        disabled ? styles.ratingTextDisabled : {},
        currentRating > 0 ? styles.ratingTextSelected : {}
      ]}>
        {noRatingChosen ? 'Select eggs to rate' : 
          `${currentRating % 1 === 0 ? currentRating : currentRating.toFixed(1)} eggs`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  eggCarton: {
    width: 'auto',
    alignItems: 'center',
    backgroundColor: '#E0F7FF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#C7D2DD',
  },
  eggRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  touchableEgg: {
    padding: 2,
  },
  eggContainer: {
    padding: 4,
    marginHorizontal: 4,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // New implementation for half eggs using filled egg base
  halfEggContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightHalfMask: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    right: 0,
    overflow: 'hidden',
    alignItems: 'flex-end', // Align to right edge
  },
  egg: {
    width: 24,
    height: 32,
  },
  glow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderRadius: 999,
    backgroundColor: 'rgba(243, 182, 31, 0.3)',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    zIndex: -1,
  },
  ratingText: {
    marginTop: 12,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#64748B',
    textAlign: 'center',
  },
  ratingTextDisabled: {
    color: '#94A3B8',
  },
  ratingTextSelected: {
    fontWeight: '600',
    color: '#334155',
    fontStyle: 'normal',
  },
});