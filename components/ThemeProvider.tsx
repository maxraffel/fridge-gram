import React, { createContext, useContext, ReactNode } from 'react';
import { StyleSheet } from 'react-native';

// Define our color palette
export const fridgeGramColors = {
  primary: '#247BA0',        // Cool blue (unchanged)
  secondary: '#A0D1E6',      // Light blue (unchanged)
  accent: '#F3B61F',         // Fridge light yellow (unchanged)
  accentLight: '#FFEFC3',    // Light yellow (unchanged)
  background: '#EAF4FC',     // Light grayish blue for a softer background
  cardBackground: '#FFFFFF', // White for cards to maintain contrast
  steel: '#D9E2EC',          // Softer steel color
  steelDark: '#BCCCDC',      // Darker steel
  text: '#102A43',           // Dark navy for better contrast
  textLight: '#486581',      // Muted blue-gray for secondary text
  success: '#2D6A4F',        // Rich green for success
  error: '#D90429',          // Bright red for errors
  white: '#FFFFFF',          // White (unchanged)
  black: '#000000',          // Black (unchanged)
  shadow: 'rgba(0, 0, 0, 0.1)', // Slightly darker shadow for better depth
  iceBlue: '#DFF6FF',        // Softer ice blue
  frost: '#EAF4FC',          // Frosty blue for subtle effects
};

// Define font styles
export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// Define shadows
export const shadows = {
  small: {
    shadowColor: fridgeGramColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: fridgeGramColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: fridgeGramColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  }),
};

// Define common styles
export const commonStyles = StyleSheet.create({
  card: {
    backgroundColor: fridgeGramColors.cardBackground, // Use new card background
    borderRadius: 16,
    padding: 16,
    ...shadows.medium,
  },
  container: {
    flex: 1,
    backgroundColor: fridgeGramColors.background, // Use new background color
    padding: 16,
  },
  heading: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold as any,
    color: fridgeGramColors.text, // Use updated text color
    marginBottom: 16,
  },
  subheading: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold as any,
    color: fridgeGramColors.textLight, // Use updated light text color
    marginBottom: 12,
  },
  paragraph: {
    fontSize: typography.fontSizes.md,
    color: fridgeGramColors.textLight, // Use updated light text color
    marginBottom: 16,
    lineHeight: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: fridgeGramColors.primary,
    ...shadows.colored(fridgeGramColors.primary),
  },
  buttonSecondary: {
    backgroundColor: fridgeGramColors.secondary,
    borderWidth: 1,
    borderColor: fridgeGramColors.steelDark,
  },
  buttonText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold as any,
  },
  buttonTextPrimary: {
    color: fridgeGramColors.white,
  },
  buttonTextSecondary: {
    color: fridgeGramColors.text,
  },
  input: {
    backgroundColor: fridgeGramColors.white,
    borderWidth: 1,
    borderColor: fridgeGramColors.steel,
    borderRadius: 12,
    padding: 16,
    fontSize: typography.fontSizes.md,
    color: fridgeGramColors.text,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: fridgeGramColors.steel,
  },
  divider: {
    height: 1,
    backgroundColor: fridgeGramColors.steel,
    marginVertical: 16,
  },
  frostEffect: {
    backgroundColor: fridgeGramColors.frost, // Use new frost color
    borderRadius: 16,
    borderWidth: 1,
    borderColor: fridgeGramColors.steel,
  },
});

// Theme context
type ThemeContextType = {
  colors: typeof fridgeGramColors;
  typography: typeof typography;
  shadows: typeof shadows;
  styles: typeof commonStyles;
};

const ThemeContext = createContext<ThemeContextType>({
  colors: fridgeGramColors,
  typography,
  shadows,
  styles: commonStyles,
});

export const ThemeProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{
      colors: fridgeGramColors,
      typography,
      shadows,
      styles: commonStyles,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);