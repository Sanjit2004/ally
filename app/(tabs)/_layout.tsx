import { Tabs } from 'expo-router';
import React from 'react';

import FloatingBottomNav from '@/components/FloatingBottomNav'; // <-- This was already here (good)
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      // --- FIX 1: Tell Expo Router to use your component as the tab bar ---
      tabBar={props => <FloatingBottomNav {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        // tabBarStyle: { display: 'none' }, // No longer needed
      }}>
        
      {/* Main 3 Tabs (Must match your FloatingBottomNav) */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
      {/* --- FIX 2: Made CallScreen visible by removing href: null --- */}
      <Tabs.Screen
        name="CallScreen"
        options={{
          title: 'Call',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="phone.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      
      {/* Hidden tabs - these are correct */}
      <Tabs.Screen
        name="history"
        options={{ href: null, title: 'History' }}
      />
      <Tabs.Screen
        name="settings"
        options={{ href: null, title: 'Settings' }}
      />
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}