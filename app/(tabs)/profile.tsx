import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, PrimaryColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { deleteMemory, getMemories, Memory, updateMemory } from '@/store/memory';
import { useUserProfileStore } from '@/store/userProfileStore';
import { logMemoryDeleted, logMemoryExported, logPersonaUpdated } from '@/utils/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, Share, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile } = useUserProfileStore();
  const navigation = useNavigation();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [editText, setEditText] = useState('');
  const [editingPersona, setEditingPersona] = useState(false);
  const [personaAge, setPersonaAge] = useState('');
  const [personaTone, setPersonaTone] = useState('');
  const [personaBackstory, setPersonaBackstory] = useState('');

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      setIsLoading(true);
      const loadedMemories = await getMemories();
      setMemories(loadedMemories);
    } catch (error) {
      console.error('Error loading memories:', error);
      Alert.alert('Error', 'Failed to load memories.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory);
    setEditText(memory.content);
  };

  const handleSaveEdit = async () => {
    if (!editingMemory || !editText.trim()) return;
    try {
      await updateMemory(editingMemory.id, editText.trim());
      await loadMemories();
      setEditingMemory(null);
      setEditText('');
      Alert.alert('Success', 'Memory updated successfully.');
    } catch (error) {
      console.error('Error updating memory:', error);
      Alert.alert('Error', 'Failed to update memory.');
    }
  };

  const handleDeleteMemory = (memory: Memory) => {
    Alert.alert('Delete Memory', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMemory(memory.id);
            await loadMemories();
            Alert.alert('Success', 'Memory deleted.');
          } catch (error) {
            console.error('Error deleting memory:', error);
            Alert.alert('Error', 'Failed to delete memory.');
          }
        },
      },
    ]);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleEditProfile = () => {
    setEditingPersona(true);
  };

  const handleSavePersona = async () => {
    try {
      const personaOverride = { age: personaAge.trim(), tone: personaTone.trim(), backstory: personaBackstory.trim() };
      await AsyncStorage.setItem('@ally_persona_override', JSON.stringify(personaOverride));
      logPersonaUpdated(userProfile?.displayName || 'unknown');
      Alert.alert('Success', 'Ally persona updated successfully!');
      setEditingPersona(false);
    } catch (error) {
      console.error('Error saving persona:', error);
      Alert.alert('Error', 'Failed to save persona.');
    }
  };

  const handleExportMemories = async () => {
    try {
      const json = JSON.stringify(memories, null, 2);
      await Share.share({ message: json, title: 'Export Memories' });
      logMemoryExported(userProfile?.displayName || 'unknown', memories.length);
    } catch (error) {
      console.error('Error exporting memories:', error);
      Alert.alert('Error', 'Failed to export memories.');
    }
  };

  const handleDeleteAllMemories = () => {
    Alert.alert('Delete All Memories', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: async () => {
          try {
            for (const memory of memories) {
              await deleteMemory(memory.id);
            }
            await loadMemories();
            logMemoryDeleted(userProfile?.displayName || 'unknown', memories.length);
            Alert.alert('Success', 'All memories deleted.');
          } catch (error) {
            console.error('Error deleting all memories:', error);
            Alert.alert('Error', 'Failed to delete memories.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <ThemedView style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB' }]}>
          <ThemedText type="title" style={styles.headerTitle}>Profile</ThemedText>
        </ThemedView>

        <ThemedView style={[styles.profileSection, { backgroundColor: colors.surface, borderColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB' }]}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <ThemedText style={styles.avatarText}>{userProfile?.displayName?.[0]?.toUpperCase() || 'U'}</ThemedText>
          </View>
          <ThemedText type="defaultSemiBold" style={styles.name}>{userProfile?.displayName || 'User'}</ThemedText>
          <ThemedText style={styles.email}>user@example.com</ThemedText>
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.tint }]} onPress={handleEditProfile}>
            <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Features & Settings Submenu */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Features & Settings</ThemedText>
          {/* ----- NAVIGATION FIX HERE ----- */}
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB' }]} onPress={() => (navigation as any).reset({ index: 0, routes: [{ name: 'history' }] })}>
            <View style={styles.menuItemContent}>
              <IconSymbol name="clock.fill" size={20} color={colors.tint} />
              <View style={styles.menuItemText}>
                <ThemedText style={styles.menuItemTitle}>History</ThemedText>
                <ThemedText style={styles.menuItemSubtitle}>View chat history</ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>

          {/* ----- NAVIGATION FIX HERE ----- */}
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB' }]} onPress={() => (navigation as any).reset({ index: 0, routes: [{ name: 'settings' }] })}>
            <View style={styles.menuItemContent}>
              <IconSymbol name="gearshape.fill" size={20} color={colors.tint} />
              <View style={styles.menuItemText}>
                <ThemedText style={styles.menuItemTitle}>Settings</ThemedText>
                <ThemedText style={styles.menuItemSubtitle}>App preferences</ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>

          {/* ----- NAVIGATION FIX HERE ----- */}
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB' }]} onPress={() => (navigation as any).reset({ index: 0, routes: [{ name: 'AvatarScreen' }] })}>
            <View style={styles.menuItemContent}>
              <IconSymbol name="person.fill" size={20} color={colors.tint} />
              <View style={styles.menuItemText}>
                <ThemedText style={styles.menuItemTitle}>Avatar Chat</ThemedText>
                <ThemedText style={styles.menuItemSubtitle}>Chat with avatar</ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>

          {/* ----- NAVIGATION FIX HERE ----- */}
          <TouchableOpacity style={styles.menuItem} onPress={() => (navigation as any).reset({ index: 0, routes: [{ name: 'MemoryLogScreen' }] })}>
            <View style={styles.menuItemContent}>
              <IconSymbol name="brain.head.profile" size={20} color={colors.tint} />
              <View style={styles.menuItemText}>
                <ThemedText style={styles.menuItemTitle}>Memory Log</ThemedText>
                <ThemedText style={styles.menuItemSubtitle}>View memories</ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>
        </ThemedView>

        {/* Memories Section */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Memories</ThemedText>
            <ThemedText style={styles.memoryCount}>{memories.length} saved</ThemedText>
          </View>
          {/* ----- ADDED MEMORY ACTION BAR BUTTONS (from previous version) ----- */}
          {memories.length > 0 && (
          <View style={styles.memoryActionBar}>
            <TouchableOpacity
              style={[styles.memoryActionBarButton, { backgroundColor: colors.tint + '20' }]}
              onPress={handleExportMemories}
            >
              <IconSymbol name="arrow.down.doc" size={16} color={colors.tint} />
              <ThemedText style={[styles.memoryActionBarText, { color: colors.tint }]}>Export</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.memoryActionBarButton, { backgroundColor: colors.error + '20' }]}
              onPress={handleDeleteAllMemories}
            >
              <IconSymbol name="trash" size={16} color={colors.error} />
              <ThemedText style={[styles.memoryActionBarText, { color: colors.error }]}>Delete All</ThemedText>
            </TouchableOpacity>
          </View>
          )}
          {isLoading ? (
            <ThemedText style={styles.loadingText}>Loading...</ThemedText>
          ) : memories.length === 0 ? (
            <ThemedText style={styles.emptyText}>No memories yet</ThemedText>
          ) : (
            memories.map((memory) => (
              <ThemedView key={memory.id} style={[styles.memoryItem, { backgroundColor: colors.surface, borderColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB' }]}>
                <View style={styles.memoryContent}>
                  <ThemedText style={styles.memoryText} numberOfLines={3}>{memory.content}</ThemedText>
                  <View style={styles.memoryFooter}>
                    <ThemedText style={styles.memoryDate}>{formatDate(memory.timestamp)}</ThemedText>
                    {/* ----- ADDED SALIENCE (from previous version) ----- */}
                    <View style={styles.memorySalience}>
                      <IconSymbol name="star.fill" size={12} color={colors.accent || colors.tint} />
                      <ThemedText style={styles.salienceText}>
                        {(memory.salience * 100).toFixed(0)}%
                      </ThemedText>
                    </View>
                  </View>
                </View>
                <View style={styles.memoryActions}>
                  <TouchableOpacity style={[styles.memoryActionButton, { backgroundColor: colors.tint + '20' }]} onPress={() => handleEditMemory(memory)}>
                    <IconSymbol name="pencil" size={16} color={colors.tint} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.memoryActionButton, { backgroundColor: colors.error + '20' }]} onPress={() => handleDeleteMemory(memory)}>
                    <IconSymbol name="trash" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </ThemedView>
            ))
          )}
        </ThemedView>
      </ScrollView>

      {/* ----- RE-ADDED "EDIT MEMORY" MODAL ----- */}
      <Modal
        visible={editingMemory !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingMemory(null)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, {
            backgroundColor: colors.surface,
          }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>Edit Memory</ThemedText>
              <TouchableOpacity onPress={() => setEditingMemory(null)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={PrimaryColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.modalInput, {
                backgroundColor: colors.background,
                borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                color: colors.text,
                minHeight: 120, // Added minHeight for consistency
                textAlignVertical: 'top' // Added for multiline
              }]}
              value={editText}
              onChangeText={setEditText}
              multiline
              numberOfLines={6}
              placeholder="Memory content..."
              placeholderTextColor={PrimaryColors.textSecondary}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton, {
                  borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                }]}
                onPress={() => {
                  setEditingMemory(null);
                  setEditText('');
                }}
              >
                <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                onPress={handleSaveEdit}
              >
                <ThemedText style={styles.modalButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Edit Persona Modal */}
      <Modal visible={editingPersona} transparent animationType="slide" onRequestClose={() => setEditingPersona(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>Edit Persona</ThemedText>
              <TouchableOpacity onPress={() => setEditingPersona(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={PrimaryColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB', color: colors.text }]} value={personaAge} onChangeText={setPersonaAge} placeholder="Age" placeholderTextColor={PrimaryColors.textSecondary} />
            <TextInput style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB', color: colors.text }]} value={personaTone} onChangeText={setPersonaTone} placeholder="Tone" placeholderTextColor={PrimaryColors.textSecondary} />
            <TextInput style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB', color: colors.text, minHeight: 100, textAlignVertical: 'top' }]} value={personaBackstory} onChangeText={setPersonaBackstory} placeholder="Backstory" placeholderTextColor={PrimaryColors.textSecondary} multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton, {
                    borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                  }]}
                  onPress={() => setEditingPersona(false)}
                >
                  <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.tint }]} onPress={handleSavePersona}>
                <ThemedText style={styles.modalButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ----- UPDATED STYLES (merged from previous versions) -----
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  headerTitle: { fontSize: 24, fontWeight: '600' },
  profileSection: { alignItems: 'center', paddingVertical: 32, marginHorizontal: 20, marginTop: 20, marginBottom: 8, borderRadius: 24, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  avatar: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 40, fontWeight: '600', color: '#ffffff' },
  name: { fontSize: 24, marginBottom: 8 },
  email: { fontSize: 16, opacity: 0.7, marginBottom: 20 },
  editButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  editButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  section: { marginTop: 24, paddingHorizontal: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, opacity: 0.7 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  memoryCount: { fontSize: 14, opacity: 0.6 },
  loadingText: { fontSize: 14, opacity: 0.6, padding: 20, textAlign: 'center' },
  emptyText: { fontSize: 14, opacity: 0.5, padding: 20, textAlign: 'center' },
  memoryItem: { flexDirection: 'row', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  memoryContent: { flex: 1, marginRight: 12 },
  memoryText: { fontSize: 15, lineHeight: 20, marginBottom: 8 },
  memoryFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memoryDate: { fontSize: 12, opacity: 0.6 },
  memorySalience: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  salienceText: { fontSize: 12, opacity: 0.7 },
  memoryActions: { flexDirection: 'column', gap: 8, justifyContent: 'flex-start' },
  memoryActionButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  memoryActionBar: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  memoryActionBarButton: { flex: 1, flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  memoryActionBarText: { fontSize: 14, fontWeight: '600' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  menuItemContent: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  menuItemText: { flex: 1 },
  menuItemTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  menuItemSubtitle: { fontSize: 13, opacity: 0.6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '700' },
  modalInput: { borderWidth: 1.5, borderRadius: 16, padding: 16, fontSize: 16, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalCancelButton: { borderWidth: 1.5, backgroundColor: 'transparent' },
  modalCancelText: { fontSize: 16, fontWeight: '600' },
  modalButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});