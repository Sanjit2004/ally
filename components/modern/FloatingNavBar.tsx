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
// FIX 1: Import the correct props type
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// FIX 2: Create a type-safe icon lookup
const TAB_ICONS: Record<string, string> = {
  'chat': 'bubble.left.fill',
  'CallScreen': 'phone.fill',
  'profile': 'person.fill',
};

// FIX 3: Accept props from the Tab.Navigator
export default function FloatingBottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [translateY] = useState(new Animated.Value(0));
  const screenWidth = Dimensions.get('window').width;
  
  // FIX 4: Get active tab directly from navigator state
  const activeIndex = state.index;

  // Handle keyboard visibility
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

  // FIX 5: Use the official navigation logic from React Navigation
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
          {/* FIX 6: Map over 'state.routes' not a hardcoded array */}
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

            return (
              <TouchableOpacity
                key={route.key}
                style={[
                  styles.navItem,
                  isActive && styles.navItemActive,
                ]}
                onPress={() => handleTabPress(route.name, isActive)} // Use correct press handler
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
                      name={iconName} // Use dynamic icon name
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
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 66,
    borderRadius: 34,
    borderWidth: 1,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 44,
    minWidth: 44,
  },
  navItemActive: {
    // Active state styling handled via animated values
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});