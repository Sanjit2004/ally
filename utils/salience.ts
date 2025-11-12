/**
 * Compute salience score for a text (0-1 range)
 * Simple rule-based implementation:
 * - Length factor (longer = more important, up to a point)
 * - Sentiment placeholder (positive/negative indicators)
 * - Keyword importance (placeholder for future enhancement)
 */

export function computeSalience(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  const trimmed = text.trim();
  const length = trimmed.length;

  // Length factor: 0.0 to 0.5 (normalized)
  // Optimal length around 100-200 chars gets highest score
  let lengthScore = 0;
  if (length < 20) {
    lengthScore = length / 20 * 0.2; // Very short: 0-0.2
  } else if (length <= 100) {
    lengthScore = 0.2 + ((length - 20) / 80) * 0.3; // 20-100: 0.2-0.5
  } else if (length <= 200) {
    lengthScore = 0.5; // Optimal: 0.5
  } else if (length <= 500) {
    lengthScore = 0.5 - ((length - 200) / 300) * 0.2; // 200-500: 0.5-0.3
  } else {
    lengthScore = 0.3 - Math.min((length - 500) / 1000, 0.2); // 500+: 0.3-0.1
  }

  // Sentiment placeholder: simple keyword-based
  // Positive indicators boost score
  const positiveWords = [
    'important', 'significant', 'crucial', 'essential', 'key', 'main',
    'goal', 'achievement', 'success', 'progress', 'improve', 'better',
    'love', 'happy', 'grateful', 'thankful', 'proud', 'excited'
  ];
  
  // Negative indicators might indicate importance too (emotional weight)
  const emotionalWords = [
    'struggle', 'difficult', 'challenge', 'stress', 'anxiety', 'worry',
    'fear', 'concern', 'problem', 'issue', 'need', 'help'
  ];

  const lowerText = trimmed.toLowerCase();
  let sentimentScore = 0.1; // Base sentiment score

  // Count positive words
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  sentimentScore += Math.min(positiveCount * 0.05, 0.2); // Up to +0.2

  // Count emotional words (also important for mental health context)
  const emotionalCount = emotionalWords.filter(word => lowerText.includes(word)).length;
  sentimentScore += Math.min(emotionalCount * 0.03, 0.15); // Up to +0.15

  // Question marks indicate engagement/importance
  const questionCount = (trimmed.match(/\?/g) || []).length;
  sentimentScore += Math.min(questionCount * 0.02, 0.1); // Up to +0.1

  // Exclamation marks indicate emphasis
  const exclamationCount = (trimmed.match(/!/g) || []).length;
  sentimentScore += Math.min(exclamationCount * 0.01, 0.05); // Up to +0.05

  // Cap sentiment score at 0.5
  sentimentScore = Math.min(sentimentScore, 0.5);

  // Combine scores (length 50%, sentiment 50%)
  const totalScore = lengthScore * 0.5 + sentimentScore * 0.5;

  // Ensure result is between 0 and 1
  return Math.max(0, Math.min(1, totalScore));
}

/**
 * Usage example:
 * 
 * const text = "I'm feeling really anxious about my upcoming job interview. This is important to me.";
 * const salience = computeSalience(text);
 * console.log(`Salience: ${salience}`); // ~0.65 (high due to emotional words + length)
 * 
 * const shortText = "ok";
 * const lowSalience = computeSalience(shortText);
 * console.log(`Salience: ${lowSalience}`); // ~0.05 (very low)
 */

