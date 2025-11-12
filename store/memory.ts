import AsyncStorage from '@react-native-async-storage/async-storage';
import { computeSalience } from '@/utils/salience';

const STORAGE_KEY = '@ally_memories';
const DEFAULT_MAX_MEMORIES = 200;

export interface Memory {
  id: string;
  content: string;
  salience: number;
  timestamp: Date;
}

interface StoredMemory {
  id: string;
  content: string;
  salience: number;
  timestamp: string;
}

/**
 * Get all memories from AsyncStorage, sorted by salience (highest first)
 */
export async function getMemories(): Promise<Memory[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const storedMemories: StoredMemory[] = JSON.parse(stored);
    
    // Convert stored memories to Memory objects
    const memories: Memory[] = storedMemories.map((m) => ({
      id: m.id,
      content: m.content,
      salience: m.salience,
      timestamp: new Date(m.timestamp),
    }));

    // Sort by salience (highest first), then by timestamp (newest first)
    return memories.sort((a, b) => {
      if (b.salience !== a.salience) {
        return b.salience - a.salience;
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  } catch (error) {
    console.error('Error getting memories:', error);
    return [];
  }
}

/**
 * Add a new memory to storage
 * Automatically computes salience and prunes if over max
 */
export async function addMemory(content: string, max: number = DEFAULT_MAX_MEMORIES): Promise<Memory> {
  try {
    // Compute salience for the new memory
    const salience = computeSalience(content);

    const newMemory: Memory = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content: content.trim(),
      salience,
      timestamp: new Date(),
    };

    // Get existing memories
    const existingMemories = await getMemories();
    
    // Add new memory
    const updatedMemories = [...existingMemories, newMemory];
    
    // Prune if over max by dropping lowest salience memories
    let prunedMemories = updatedMemories;
    if (updatedMemories.length > max) {
      // Sort by salience (highest first), then by timestamp (newest first)
      const sorted = [...updatedMemories].sort((a, b) => {
        if (b.salience !== a.salience) {
          return b.salience - a.salience;
        }
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
      
      // Keep only the top 'max' memories
      prunedMemories = sorted.slice(0, max);
      
      console.log(`Pruned ${updatedMemories.length - prunedMemories.length} memories to maintain limit of ${max}`);
    }

    // Save to AsyncStorage
    const storedMemories: StoredMemory[] = prunedMemories.map((m) => ({
      id: m.id,
      content: m.content,
      salience: m.salience,
      timestamp: m.timestamp.toISOString(),
    }));

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedMemories));

    return newMemory;
  } catch (error) {
    console.error('Error adding memory:', error);
    throw error;
  }
}

/**
 * Prune memories to keep only the top N by salience
 * @param memories - Array of memories to prune
 * @param max - Maximum number of memories to keep (default: 200)
 * @returns Pruned array of memories
 */
export async function pruneMemories(
  memories: Memory[] = [],
  max: number = DEFAULT_MAX_MEMORIES
): Promise<Memory[]> {
  try {
    // If no memories provided, get from storage
    let memoriesToPrune = memories.length > 0 ? memories : await getMemories();

    // If under max, no pruning needed
    if (memoriesToPrune.length <= max) {
      return memoriesToPrune;
    }

    // Sort by salience (highest first)
    const sorted = memoriesToPrune.sort((a, b) => {
      if (b.salience !== a.salience) {
        return b.salience - a.salience;
      }
      // If salience is equal, prefer newer memories
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    // Keep top max memories
    const pruned = sorted.slice(0, max);

    // If we modified the list and it was from storage, save it
    if (memories.length === 0 && pruned.length < memoriesToPrune.length) {
      const storedMemories: StoredMemory[] = pruned.map((m) => ({
        id: m.id,
        content: m.content,
        salience: m.salience,
        timestamp: m.timestamp.toISOString(),
      }));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedMemories));
    }

    return pruned;
  } catch (error) {
    console.error('Error pruning memories:', error);
    return memories.length > 0 ? memories : [];
  }
}

/**
 * Delete a memory by ID
 */
export async function deleteMemory(id: string): Promise<void> {
  try {
    const memories = await getMemories();
    const filtered = memories.filter((m) => m.id !== id);

    const storedMemories: StoredMemory[] = filtered.map((m) => ({
      id: m.id,
      content: m.content,
      salience: m.salience,
      timestamp: m.timestamp.toISOString(),
    }));

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedMemories));
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
}

/**
 * Update a memory's content and recompute salience
 */
export async function updateMemory(id: string, newContent: string): Promise<Memory> {
  try {
    const memories = await getMemories();
    const memoryIndex = memories.findIndex((m) => m.id === id);

    if (memoryIndex === -1) {
      throw new Error('Memory not found');
    }

    // Recompute salience for updated content
    const newSalience = computeSalience(newContent);

    const updatedMemory: Memory = {
      ...memories[memoryIndex],
      content: newContent.trim(),
      salience: newSalience,
      timestamp: new Date(), // Update timestamp
    };

    memories[memoryIndex] = updatedMemory;

    // Save updated memories
    const storedMemories: StoredMemory[] = memories.map((m) => ({
      id: m.id,
      content: m.content,
      salience: m.salience,
      timestamp: m.timestamp.toISOString(),
    }));

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedMemories));

    return updatedMemory;
  } catch (error) {
    console.error('Error updating memory:', error);
    throw error;
  }
}

/**
 * Clear all memories
 */
export async function clearMemories(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing memories:', error);
    throw error;
  }
}

