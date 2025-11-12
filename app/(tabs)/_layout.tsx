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
      tabBar={props => <FloatingBottomNav {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
        
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
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
      
      {/* <Tabs.Screen
        name="history"
        options={{ href: null, title: 'History' }}
      /> */}
      <Tabs.Screen
        name="settings"
        options={{ href: null, title: 'Settings' }}
      />
    </Tabs>
  );
}