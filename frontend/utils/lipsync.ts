import type { UserMood } from '@/store/userProfileStore';

export type VisemeShape =
  | 'rest'
  | 'open'
  | 'wide'
  | 'narrow'
  | 'closed'
  | 'teeth';

export interface VisemeCommand {
  shape: VisemeShape;
  amount: number;
  duration: number;
}

const LETTER_VISEME_MAP: { shape: VisemeShape; pattern: RegExp; amount: number }[] = [
  { shape: 'open', pattern: /[aáàâäåăāeéèêëē]/i, amount: 0.9 },
  { shape: 'wide', pattern: /[iíìîïīy]/i, amount: 0.85 },
  { shape: 'narrow', pattern: /[oóòôöōuúùûüūw]/i, amount: 0.85 },
  { shape: 'teeth', pattern: /[fv]/i, amount: 0.8 },
  { shape: 'closed', pattern: /[mbp]/i, amount: 0.75 },
];

export const REST_VISEME: VisemeCommand = {
  shape: 'rest',
  amount: 0,
  duration: 150,
};

export function guessVisemeFromText(text: string, charIndex: number): VisemeCommand | null {
  if (!text || charIndex == null || charIndex < 0 || charIndex >= text.length) {
    return null;
  }

  const letter = text.charAt(charIndex);
  if (!letter.trim()) {
    return null;
  }

  const match = LETTER_VISEME_MAP.find((entry) => entry.pattern.test(letter));
  if (!match) {
    return {
      shape: 'rest',
      amount: 0,
      duration: REST_VISEME.duration,
    };
  }

  return {
    shape: match.shape,
    amount: match.amount,
    duration: 160,
  };
}

export function moodToReactionIntensity(mood: UserMood | undefined): number {
  switch (mood) {
    case 'focused':
      return 0.7;
    case 'curious':
      return 1.0;
    case 'supportive':
      return 0.9;
    default:
      return 0.8;
  }
}
