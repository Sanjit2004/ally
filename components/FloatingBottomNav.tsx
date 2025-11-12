import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// --- FIX 1: Import the correct props type ---
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// --- FIX 2: Create a lookup for your icons ---
// This replaces the hard-coded NAV_ITEMS
const TAB_ICONS: Record<string, string> = {
  chat: 'bubble.left.fill',
  CallScreen: 'phone.fill',
  profile: 'person.fill',
};

// --- FIX 3: Accept props from the navigator ---
export default function FloatingBottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [translateY] = useState(new Animated.Value(0));
  const screenWidth = Dimensions.get('window').width;
  
  // --- FIX 4: Get active tab index from navigator state ---
  const activeIndex = state.index;

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      Animated.timing(translateY, {
        toValue: 150,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, [translateY]);

  // --- FIX 5: Use the correct navigation logic ---
  const handleTabPress = (routeName: string, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeName,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const navWidth = Math.min(screenWidth * 0.86, 720);
  const navBarColor = colors.surface || '#FFFFFF';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.container,
          {
            width: navWidth,
            transform: [{ translateY }],
          },
        ]}
      >
        <View
          style={[
            styles.navBar,
            {
              backgroundColor: `rgba(${hexToRgb(navBarColor)}, 0.12)`,
              borderColor: colors.secondary,
            },
          ]}
        >
          {/* --- FIX 6: Map over state.routes from props --- */}
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? (options.tabBarLabel as string)
                : options.title !== undefined
                ? options.title
                : route.name;

            const isActive = activeIndex === index;
            const iconName = TAB_ICONS[route.name] || 'circle.fill'; // Get icon from lookup

            // ----- THIS IS THE CORRECTED LINE -----
            // Don't render tabs that are hidden (href: null)
            if ((options as any).href === null) {
              return null;
            }

            return (
              <TouchableOpacity
                key={route.key}
                style={[
                  styles.navItem,
                  isActive && styles.navItemActive,
                ]}
                onPress={() => handleTabPress(route.name, isActive)}
                activeOpacity={0.7}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Animated.View
                  style={[
                    styles.iconContainer,
                    {
                      transform: [
                        { scale: isActive ? 1.05 : 1.0 },
                        { translateY: isActive ? -6 : 0 },
                      ],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconGlow,
                      isActive && {
                        backgroundColor: `${colors.tint}20`,
                      },
                    ]}
                  >
                    <IconSymbol
                      name={iconName}
                      size={24}
                      color={isActive ? colors.tint : colors.text}
                      style={{ opacity: isActive ? 1 : 0.6 }}
                    />
                  </View>
                </Animated.View>
                <ThemedText
                  style={[
                    styles.label,
                    {
                      color: isActive ? colors.tint : colors.text,
                      opacity: isActive ? 1 : 0.6,
                      fontWeight: isActive ? '600' : '400',
                    },
                  ]}
                >
                  {label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}



// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
  }
  return '255, 255, 255';
}



const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    paddingHorizontal: 16,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    height: '100%',
    minWidth: 60,
  },
  navItemActive: {
    // Active state styling handled via animated values
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    marginBottom: 2,
  },
  iconGlow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginTop: Platform.OS === 'ios' ? 2 : 0,
    textAlign: 'center',
  },
});