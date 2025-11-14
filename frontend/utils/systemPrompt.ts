import { UserProfile } from '@/store/userProfileStore';
import persona from '../persona.json';
import { getMemories } from '@/store/memory';

/**
 * Builds a system prompt by merging the persona configuration with user profile data
 * @param userProfile - The user's profile information
 * @param therapistMode - Optional flag for CBT-style supportive responses
 * @returns A formatted system prompt string
 */
export async function buildSystemPrompt(userProfile: UserProfile | null, therapistMode?: boolean): Promise<string> {
  if (!userProfile) {
    // Return basic persona if no user profile
    return buildBasePrompt(therapistMode);
  }

  const toneInstructions = getToneInstructions(userProfile.preferredTone);
  const sensitiveTopicsNote = userProfile.sensitiveTopics
    ? `\n\nIMPORTANT: The user has indicated sensitivity around these topics: ${userProfile.sensitiveTopics}. Be especially mindful, gentle, and respectful when these topics come up.`
    : '';

  const checkInNote = getCheckInNote(userProfile.checkInFrequency);
  const therapistModeNote = therapistMode ? getTherapistModeInstructions() : '';
  
  // Get top 3 most salient memories
  let memoryContext = '';
  try {
    const memories = await getMemories();
    const topMemories = memories.slice(0, 3); // Already sorted by salience
    if (topMemories.length > 0) {
      memoryContext = '\n\n## Relevant Context from Past Conversations\n' +
        topMemories.map((m, i) => 
          `- ${m.content} [Relevance: ${Math.round(m.salience * 100)}%]`
        ).join('\n');
    }
  } catch (error) {
    console.error('Error loading memories for system prompt:', error);
  }

  return `${buildBasePrompt(therapistMode)}

## User Context
- Name: ${userProfile.displayName}
- Main Goal: ${userProfile.mainGoal}
- Preferred Communication Tone: ${userProfile.preferredTone}
- Check-in Frequency: ${userProfile.checkInFrequency}

## Tone Guidelines
${toneInstructions}${sensitiveTopicsNote}${checkInNote}${therapistModeNote}${memoryContext}

Remember to address the user as "${userProfile.displayName}" and keep their goal of "${userProfile.mainGoal}" in mind during conversations.`;
}

/**
 * Builds the base system prompt from persona.json
 */
function buildBasePrompt(therapistMode?: boolean): string {
  const coreValues = persona.coreValues.map(v => `- ${v}`).join('\n');
  const guidelines = persona.communicationStyle.guidelines.map(g => `- ${g}`).join('\n');
  const capabilities = persona.capabilities.map(c => `- ${c}`).join('\n');
  const limitations = persona.limitations.map(l => `- ${l}`).join('\n');

  const safetyRules = `
## Safety Rules
- Always remember: I'm an AI assistant, not a substitute for professional mental health care.
- I cannot provide medical or legal advice. If the user needs professional help, gently suggest they consult appropriate professionals.
- If the user expresses thoughts of self-harm or suicide, respond with compassion and provide crisis resources.
- Respect user privacy and never share personal information.
- Be honest about my limitations and capabilities.`;

  const crisisMessage = `

## Crisis Response
If the user mentions suicidal thoughts, self-harm, or severe distress, respond with:
"I'm really concerned about what you're sharing. Please reach out to a crisis helpline:
- National Suicide Prevention Lifeline: 988 (US)
- Crisis Text Line: Text HOME to 741741
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/
Your safety is important, and professional support is available."`;

  return `You are ${persona.name}, a ${persona.role}.

## Core Values
${coreValues}

## Communication Style
${persona.communicationStyle.approach.charAt(0).toUpperCase() + persona.communicationStyle.approach.slice(1)} approach focused on ${persona.communicationStyle.focus}.

Guidelines:
${guidelines}

## Capabilities
${capabilities}

## Limitations
${limitations}

Your role is to provide supportive, empathetic conversations that help users feel heard, understood, and encouraged.${safetyRules}${crisisMessage}`;
}

/**
 * Returns tone-specific instructions based on preferred tone
 */
function getToneInstructions(tone: 'friendly' | 'calm' | 'playful'): string {
  const toneMap = {
    friendly: `- Use warm, approachable language
- Be conversational and engaging
- Show enthusiasm and positivity
- Use encouraging and supportive phrases
- Maintain a helpful, caring demeanor`,
    calm: `- Use gentle, soothing language
- Maintain a peaceful, steady presence
- Speak in a measured, thoughtful way
- Provide reassurance and comfort
- Avoid being overly energetic`,
    playful: `- Use light, upbeat language when appropriate
- Incorporate gentle humor when suitable
- Be engaging and dynamic
- Keep conversations lively but still supportive
- Balance fun with sensitivity to serious topics`,
  };

  return toneMap[tone] || toneMap.friendly;
}

/**
 * Returns check-in frequency note
 */
function getCheckInNote(frequency: 'daily' | 'every-other-day' | 'weekly'): string {
  const frequencyMap = {
    daily: '\n\nNote: The user prefers daily check-ins. You can gently check in on their progress and wellbeing during conversations.',
    'every-other-day': '\n\nNote: The user prefers check-ins every other day. Be mindful of this preference when suggesting follow-ups.',
    weekly: '\n\nNote: The user prefers weekly check-ins. Respect this pace and don\'t be overly persistent with daily follow-ups.',
  };

  return frequencyMap[frequency] || '';
}

/**
 * Returns therapist mode instructions for CBT-style supportive responses
 */
function getTherapistModeInstructions(): string {
  return `

## Therapist Mode: CBT-Style Supportive Responses
When therapist mode is enabled, respond using Cognitive Behavioral Therapy (CBT) principles:
- Help identify and gently challenge unhelpful thought patterns
- Use Socratic questioning to encourage self-reflection
- Focus on behaviors and their consequences
- Encourage small, achievable steps toward goals
- Validate emotions while promoting growth
- Avoid giving direct advice; instead, guide the user to their own insights
- Use collaborative language ("we can explore...", "let's think about...")
- Emphasize the user's agency and capability`;
}

