import logger from "../utils/logger";

export type MemoryEntry = {
  content: string;
  timestamp: number;
  source: "user" | "model";
};

const memoryStore = new Map<string, MemoryEntry[]>();
const MAX_MEMORIES_PER_USER = 50;
const DEFAULT_MEMORY_LIMIT = 3;

const normalizeUserId = (userId: string): string =>
  userId?.toLowerCase().trim() || "anonymous";

export const saveMemory = async (userId: string, entry: MemoryEntry): Promise<void> => {
  const normalizedId = normalizeUserId(userId);
  const memories = memoryStore.get(normalizedId) ?? [];
  const safeEntry = {
    ...entry,
    timestamp: entry.timestamp ?? Date.now()
  };

  memories.push(safeEntry);

  if (memories.length > MAX_MEMORIES_PER_USER) {
    memories.shift();
  }

  memoryStore.set(normalizedId, memories);
  logger.info("Memory saved", { userId: normalizedId, total: memories.length });
};

export const getRelevantMemories = async (
  userId: string,
  message: string,
  limit: number = DEFAULT_MEMORY_LIMIT
): Promise<MemoryEntry[]> => {
  const normalizedId = normalizeUserId(userId);
  const memories = memoryStore.get(normalizedId) ?? [];

  if (memories.length === 0 || !message?.trim()) {
    return memories.slice(-limit);
  }

  const tokens = tokenize(message);

  const scored = memories.map((entry) => ({
    entry,
    score: overlapScore(tokens, tokenize(entry.content))
  }));

  scored.sort((a, b) => {
    if (b.score === a.score) {
      return b.entry.timestamp - a.entry.timestamp;
    }
    return b.score - a.score;
  });

  const selected: MemoryEntry[] = [];
  for (const candidate of scored) {
    if (selected.length >= limit) break;
    if (candidate.score === 0) break;
    selected.push(candidate.entry);
  }

  if (selected.length < limit) {
    const recentFallbacks = memories
      .filter((entry) => !selected.includes(entry))
      .slice(-limit);

    selected.push(...recentFallbacks);
  }

  return selected.slice(0, limit);
};

export const clearMemories = (): void => {
  memoryStore.clear();
};

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 2);

const overlapScore = (targetTokens: string[], memoryTokens: string[]): number => {
  if (targetTokens.length === 0 || memoryTokens.length === 0) {
    return 0;
  }

  const targetSet = new Set(targetTokens);
  const overlap = memoryTokens.filter((token) => targetSet.has(token)).length;

  return overlap;
};
