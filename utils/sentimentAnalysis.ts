/**
 * Simple sentiment analysis for detecting user mood from messages
 * Uses keyword matching and heuristics for lightweight sentiment detection
 */

export type Sentiment = 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';

const POSITIVE_KEYWORDS = [
  'great', 'good', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
  'love', 'happy', 'joy', 'excited', 'thrilled', 'blessed', 'grateful',
  'better', 'improved', 'progress', 'success', 'win', 'accomplished',
  'beautiful', 'perfect', 'brilliant', 'superb', 'outstanding',
];

const VERY_POSITIVE_KEYWORDS = [
  'best', 'amazing', 'incredible', 'fantastic', 'wonderful', 'perfect',
  'absolutely love', 'so happy', 'thrilled', 'ecstatic', 'overjoyed',
  'best day', 'couldn\'t be better', 'absolutely wonderful',
];

const NEGATIVE_KEYWORDS = [
  'bad', 'terrible', 'awful', 'horrible', 'hate', 'angry', 'upset',
  'sad', 'depressed', 'anxious', 'worried', 'stressed', 'frustrated',
  'difficult', 'struggle', 'problem', 'issue', 'fail', 'failed',
  'tired', 'exhausted', 'overwhelmed', 'confused',
];

const VERY_NEGATIVE_KEYWORDS = [
  'worst', 'terrible', 'horrible', 'hate', 'despise', 'devastated',
  'suicidal', 'hopeless', 'worthless', 'can\'t take it', 'can\'t go on',
  'completely broken', 'absolutely miserable', 'worst day ever',
];

const QUESTION_KEYWORDS = ['?', 'how', 'what', 'why', 'when', 'where', 'who'];

/**
 * Analyze sentiment of a message
 * @param message - User message text
 * @returns Sentiment classification
 */
export function analyzeSentiment(message: string): Sentiment {
  const lowerMessage = message.toLowerCase();
  
  // Check for very negative first (highest priority)
  if (VERY_NEGATIVE_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
    return 'very_negative';
  }
  
  // Check for very positive
  if (VERY_POSITIVE_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
    return 'very_positive';
  }
  
  // Count positive and negative keywords
  const positiveCount = POSITIVE_KEYWORDS.filter(keyword => 
    lowerMessage.includes(keyword)
  ).length;
  
  const negativeCount = NEGATIVE_KEYWORDS.filter(keyword => 
    lowerMessage.includes(keyword)
  ).length;
  
  // If message is mostly questions, it's neutral
  if (QUESTION_KEYWORDS.filter(kw => lowerMessage.includes(kw)).length > 2) {
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
  
  // Determine sentiment based on keyword counts
  if (positiveCount > negativeCount + 1) {
    return positiveCount >= 2 ? 'positive' : 'neutral';
  }
  
  if (negativeCount > positiveCount + 1) {
    return negativeCount >= 2 ? 'negative' : 'neutral';
  }
  
  return 'neutral';
}

/**
 * Get sentiment score for calculations
 * @param sentiment - Sentiment classification
 * @returns Numeric score (-2 to +2)
 */
export function getSentimentScore(sentiment: Sentiment): number {
  switch (sentiment) {
    case 'very_positive':
      return 2;
    case 'positive':
      return 1;
    case 'neutral':
      return 0;
    case 'negative':
      return -1;
    case 'very_negative':
      return -2;
  }
}

/**
 * Get emoji based on sentiment
 * @param sentiment - Sentiment classification
 * @returns Emoji string
 */
export function getSentimentEmoji(sentiment: Sentiment): string {
  switch (sentiment) {
    case 'very_positive':
      return '🎉';
    case 'positive':
      return '😊';
    case 'neutral':
      return '😌';
    case 'negative':
      return '😔';
    case 'very_negative':
      return '😢';
  }
}

/**
 * Get sentiment label
 * @param sentiment - Sentiment classification
 * @returns Human-readable label
 */
export function getSentimentLabel(sentiment: Sentiment): string {
  switch (sentiment) {
    case 'very_positive':
      return 'Very Positive';
    case 'positive':
      return 'Positive';
    case 'neutral':
      return 'Neutral';
    case 'negative':
      return 'Negative';
    case 'very_negative':
      return 'Very Negative';
  }
}
