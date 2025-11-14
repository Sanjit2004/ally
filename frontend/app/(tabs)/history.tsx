import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, PrimaryColors } from '@/constants/theme';
import { Link } from 'expo-router';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'General Chat',
      lastMessage: 'That\'s interesting! Tell me more.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      messageCount: 12,
    },
    {
      id: '2',
      title: 'Help Request',
      lastMessage: 'I\'m here to help! Feel free to ask me anything.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      messageCount: 8,
    },
    {
      id: '3',
      title: 'Question About Features',
      lastMessage: 'Hello! Nice to meet you. What would you like to talk about?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      messageCount: 15,
    },
    {
      id: '4',
      title: 'Getting Started',
      lastMessage: 'I\'m doing well, thank you for asking! How are you doing?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      messageCount: 6,
    },
  ]);

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <Link href="/chat" asChild>
      <TouchableOpacity style={styles.conversationItem}>
        <ThemedView style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <ThemedText type="defaultSemiBold" style={styles.conversationTitle}>
              {item.title}
            </ThemedText>
            <ThemedText style={styles.conversationTime}>
              {formatTimestamp(item.timestamp)}
            </ThemedText>
          </View>
          <ThemedText style={styles.conversationMessage} numberOfLines={1}>
            {item.lastMessage}
          </ThemedText>
          <View style={styles.conversationFooter}>
            <ThemedText style={styles.messageCount}>
              {item.messageCount} messages
            </ThemedText>
            <ThemedText style={[styles.arrow, { color: colors.tint }]}>→</ThemedText>
          </View>
        </ThemedView>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={[styles.header, {
        backgroundColor: colors.surface,
        borderBottomColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB',
      }]}>
        <ThemedText type="title" style={styles.headerTitle}>Chat History</ThemedText>
      </ThemedView>

      {conversations.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No conversations yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Start a new conversation in the Chat tab
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  conversationItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  conversationContent: {
    padding: 16,
    backgroundColor: PrimaryColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conversationTitle: {
    fontSize: 16,
    flex: 1,
  },
  conversationTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  conversationMessage: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageCount: {
    fontSize: 12,
    opacity: 0.6,
  },
  arrow: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
  },
});

