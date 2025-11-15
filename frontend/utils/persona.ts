export type PersonaProfileInput = {
  displayName?: string;
  preferredTone?: 'friendly' | 'calm' | 'playful';
  mainGoal?: string;
  sensitiveTopics?: string;
  supportFocus?: string[];
  formality?: number;
  dailyChallenge?: string;
  interests?: string[];
  encouragementStyle?: 'motivational' | 'practical' | 'humorous';
  energyLevel?: number;
};

const fallbackEncouragement: PersonaProfileInput['encouragementStyle'] = 'motivational';

function cleanString(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function normalizeList(values?: string[]): string[] | undefined {
  if (!values) return undefined;
  const filtered = values.map((item) => item.trim()).filter((item) => item.length > 0);
  return filtered.length > 0 ? filtered : undefined;
}

export function generatePersonaPrompt(profile: PersonaProfileInput): string {
  const name = cleanString(profile.displayName) || 'the user';
  const tone = profile.preferredTone || 'friendly';
  const goal = cleanString(profile.mainGoal) || 'not specified';
  const sensitive = cleanString(profile.sensitiveTopics);
  const supportFocus = normalizeList(profile.supportFocus);
  const encouragementStyle = profile.encouragementStyle || fallbackEncouragement;
  const interests = normalizeList(profile.interests)?.join(', ');

  const formality = typeof profile.formality === 'number' ? profile.formality : undefined;
  const energyLevel = typeof profile.energyLevel === 'number' ? profile.energyLevel : undefined;
  const dailyChallenge = cleanString(profile.dailyChallenge);

  const parts: string[] = [];
  parts.push(`The user’s name is ${name}.`);
  parts.push(`They prefer a ${tone} tone.`);
  parts.push(`Their main goal is ${goal}.`);

  if (encouragementStyle) {
    parts.push(`They appreciate ${encouragementStyle} encouragement.`);
  }

  if (formality !== undefined) {
    parts.push(`Their preferred communication formality is ${formality} out of 5.`);
  }

  if (dailyChallenge) {
    parts.push(`Today's challenge: ${dailyChallenge}.`);
  }

  if (interests) {
    parts.push(`They enjoy ${interests}.`);
  }

  if (supportFocus && supportFocus.length > 0) {
    parts.push(`Key support focus areas: ${supportFocus.join(', ')}.`);
  }

  if (energyLevel !== undefined) {
    parts.push(`Current energy level: ${energyLevel}/10.`);
  }

  if (sensitive) {
    parts.push(`Sensitive topics: ${sensitive}.`);
  }

  return parts.join(' ');
}

export function generatePersonaPromptFromLegacy(profile: PersonaProfileInput): string {
  const name = cleanString(profile.displayName) || 'the user';
  const tone = profile.preferredTone || 'friendly';
  const goal = cleanString(profile.mainGoal) || 'their ongoing wellbeing';
  const sensitive = cleanString(profile.sensitiveTopics);

  const parts: string[] = [];
  parts.push(`The user’s name is ${name}.`);
  parts.push(`They prefer a ${tone} tone.`);
  parts.push(`Their main goal is ${goal}.`);

  if (sensitive) {
    parts.push(`Sensitive topics: ${sensitive}.`);
  }

  parts.push('Encourage them with empathy and keep their wellbeing in focus.');

  return parts.join(' ');
}

export function parseCommaSeparatedList(value?: string): string[] | undefined {
  if (!value) return undefined;
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return items.length > 0 ? items : undefined;
}
