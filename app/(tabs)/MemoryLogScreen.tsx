import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, PrimaryColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { deleteMemory, getMemories, Memory, updateMemory } from '@/store/memory';
import { useUserProfileStore } from '@/store/userProfileStore';
import { logMemoryDeleted } from '@/utils/analytics';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface MemoryWithTags extends Memory {
  emotion?: string;
  topic?: string;
}

export default function MemoryLogScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile } = useUserProfileStore();
  
  const [memories, setMemories] = useState<MemoryWithTags[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<MemoryWithTags[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [editingMemory, setEditingMemory] = useState<MemoryWithTags | null>(null);
  const [editText, setEditText] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'happy' | 'sad' | 'neutral' | 'important'>('all');

  useEffect(() => {
    loadMemories();
  }, []);

  useEffect(() => {
    filterMemories();
  }, [searchText, selectedFilter, memories]);

  const loadMemories = async () => {
    try {
      setIsLoading(true);
      const loadedMemories = await getMemories();
      
      // Add tags to memories based on content analysis
      const memoriesWithTags = loadedMemories.map(memory => ({
        ...memory,
        emotion: detectEmotion(memory.content),
        topic: detectTopic(memory.content),
      }));
      
      setMemories(memoriesWithTags);
    } catch (error) {
      console.error('Error loading memories:', error);
      Alert.alert('Error', 'Failed to load memories');
    } finally {
      setIsLoading(false);
    }
  };

  const detectEmotion = (content: string): string => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('happy') || lowerContent.includes('great') || lowerContent.includes('love')) {
      return 'happy';
    }
    if (lowerContent.includes('sad') || lowerContent.includes('upset') || lowerContent.includes('depressed')) {
      return 'sad';
    }
    if (lowerContent.includes('angry') || lowerContent.includes('frustrated')) {
      return 'angry';
    }
    if (lowerContent.includes('anxious') || lowerContent.includes('worried')) {
      return 'anxious';
    }
    
    return 'neutral';
  };

  const detectTopic = (content: string): string => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('work') || lowerContent.includes('job') || lowerContent.includes('career')) {
      return 'work';
    }
    if (lowerContent.includes('relationship') || lowerContent.includes('friend') || lowerContent.includes('family')) {
      return 'relationships';
    }
    if (lowerContent.includes('health') || lowerContent.includes('exercise') || lowerContent.includes('sleep')) {
      return 'health';
    }
    if (lowerContent.includes('goal') || lowerContent.includes('plan') || lowerContent.includes('dream')) {
      return 'goals';
    }
    
    return 'general';
  };

  const filterMemories = () => {
    let filtered = memories;

    // Filter by search text
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(m =>
        m.content.toLowerCase().includes(query) ||
        m.emotion?.toLowerCase().includes(query) ||
        m.topic?.toLowerCase().includes(query)
      );
    }

    // Filter by emotion
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'important') {
        filtered = filtered.filter(m => m.salience > 0.7);
      } else {
        filtered = filtered.filter(m => m.emotion === selectedFilter);
      }
    }

    setFilteredMemories(filtered);
  };

  const handleEditMemory = (memory: MemoryWithTags) => {
    setEditingMemory(memory);
    setEditText(memory.content);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMemory || !editText.trim()) {
      Alert.alert('Error', 'Memory content cannot be empty');
      return;
    }

    try {
      await updateMemory(editingMemory.id, editText);
      setShowEditModal(false);
      setEditingMemory(null);
      await loadMemories();
      Alert.alert('Success', 'Memory updated');
    } catch (error) {
      console.error('Error updating memory:', error);
      Alert.alert('Error', 'Failed to update memory');
    }
  };

  const handleDeleteMemory = (memory: MemoryWithTags) => {
    Alert.alert(
      'Delete Memory',
      'Are you sure you want to forget this memory? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Forget',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMemory(memory.id);
              logMemoryDeleted(userProfile?.displayName || 'unknown', 1);
              await loadMemories();
              Alert.alert('Success', 'Memory forgotten');
            } catch (error) {
              console.error('Error deleting memory:', error);
              Alert.alert('Error', 'Failed to delete memory');
            }
          },
        },
      ]
    );
  };

  const getEmotionColor = (emotion: string): string => {
    switch (emotion) {
      case 'happy':
        return '#FFD700';
      case 'sad':
        return '#4169E1';
      case 'angry':
        return '#FF6347';
      case 'anxious':
        return '#FF8C00';
      default:
        return colors.tint;
    }
  };

  const getEmotionEmoji = (emotion: string): string => {
    switch (emotion) {
      case 'happy':
        return '😊';
      case 'sad':
        return '😔';
      case 'angry':
        return '😠';
      case 'anxious':
        return '😰';
      default:
        return '😌';
    }
  };

  // ----- THIS IS THE CORRECTED FUNCTION -----
  const formatDate = (date: Date): string => {
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} ${timeStr}`;
  };
  // ------------------------------------------

  const FilterButton = ({ label, value }: { label: string; value: typeof selectedFilter }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: selectedFilter === value ? colors.tint : colors.surface,
          borderColor: selectedFilter === value ? colors.tint : (colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB'),
        },
      ]}
      onPress={() => setSelectedFilter(value)}
    >
      <ThemedText
        style={{
          color: selectedFilter === value ? '#fff' : colors.text,
          fontSize: 12,
          fontWeight: '600',
        }}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  const MemoryCard = ({ memory }: { memory: MemoryWithTags }) => (
    <ThemedView
      style={[
        styles.memoryCard,
        {
          backgroundColor: colors.surface,
          borderColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB',
        },
      ]}
    >
      <View style={styles.memoryHeader}>
        <View style={styles.memoryMeta}>
          <ThemedText style={styles.emotionEmoji}>{getEmotionEmoji(memory.emotion || 'neutral')}</ThemedText>
          <View style={styles.memoryInfo}>
            {/* This call will now work correctly */}
            <ThemedText style={styles.memoryDate}>{formatDate(memory.timestamp)}</ThemedText>
            <View style={styles.tagContainer}>
              <View
                style={[
                  styles.tag,
                  { backgroundColor: getEmotionColor(memory.emotion || 'neutral') + '30' },
                ]}
              >
                <ThemedText style={[styles.tagText, { color: getEmotionColor(memory.emotion || 'neutral') }]}>
                  {memory.emotion || 'neutral'}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.tag,
                  { backgroundColor: colors.tint + '30' },
                ]}
              >
                <ThemedText style={[styles.tagText, { color: colors.tint }]}>
                  {memory.topic || 'general'}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.tag,
                  { backgroundColor: colors.tint + '30' },
                ]}
              >
                <ThemedText style={[styles.tagText, { color: colors.tint }]}>
                  {Math.round(memory.salience * 100)}%
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.memoryActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditMemory(memory)}
          >
            <IconSymbol name="pencil" size={18} color={colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteMemory(memory)}
          >
            <IconSymbol name="trash" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ThemedText style={styles.memoryContent} numberOfLines={3}>
        {memory.content}
      </ThemedText>
    </ThemedView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ThemedView
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB',
          },
        ]}
      >
        <ThemedText type="title" style={styles.headerTitle}>
          Memory Log
        </ThemedText>
        <ThemedText style={styles.memoryCount}>
          {filteredMemories.length} of {memories.length} memories
        </ThemedText>
      </ThemedView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={18} color={PrimaryColors.textSecondary} />
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
            },
          ]}
          placeholder="Search memories..."
          placeholderTextColor={PrimaryColors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <IconSymbol name="xmark.circle.fill" size={18} color={PrimaryColors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        <FilterButton label="All" value="all" />
        <FilterButton label="😊 Happy" value="happy" />
        <FilterButton label="😔 Sad" value="sad" />
        <FilterButton label="😌 Neutral" value="neutral" />
        <FilterButton label="⭐ Important" value="important" />
      </ScrollView>

      {/* Memories List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : filteredMemories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="brain.head.profile" size={48} color={PrimaryColors.textSecondary} />
          <ThemedText style={styles.emptyText}>
            {searchText ? 'No memories match your search' : 'No memories yet'}
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Chat with Ally to create memories
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredMemories}
          renderItem={({ item }) => <MemoryCard memory={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          style={{ flex: 1 }}
        />
      )}

      {/* Edit Memory Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="title">Edit Memory</ThemedText>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={PrimaryColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.editInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                  color: colors.text,
                },
              ]}
              value={editText}
              onChangeText={setEditText}
              multiline
              numberOfLines={6}
              placeholder="Edit memory..."
              placeholderTextColor={PrimaryColors.textSecondary}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB' },
                ]}
                onPress={() => setShowEditModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                onPress={handleSaveEdit}
              >
                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  memoryCount: {
    fontSize: 14,
    opacity: 0.6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  filterScroll: {
    maxHeight: 50,
    flexGrow: 0, // Ensure ScrollView doesn't try to take up all space
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  memoryCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  memoryMeta: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  emotionEmoji: {
    fontSize: 32,
  },
  memoryInfo: {
    flex: 1,
  },
  memoryDate: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 6,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  memoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  memoryContent: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    fontSize: 14,
    minHeight: 120,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});