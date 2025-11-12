/**
 * Modern Theme System for Ally
 * Contemporary design inspired by Discord, Figma, and modern SaaS
 * Clean, professional, with vibrant accents
 */

export const ModernTheme = {
  // Color Palette - Contemporary and professional
  colors: {
    // Primary - Vibrant purple/blue (modern tech aesthetic)
    primary: {
      light: '#F0E6FF', // Very light purple
      main: '#7C3AED', // Vibrant purple
      dark: '#6D28D9', // Deep purple
      darker: '#5B21B6', // Very deep purple
    },
    secondary: {
      light: '#E0F2FE', // Light sky blue
      main: '#0EA5E9', // Vibrant cyan
      dark: '#0284C7', // Deep cyan
    },
    accent: {
      light: '#FEF3C7', // Light amber
      main: '#F59E0B', // Vibrant amber
      dark: '#D97706', // Deep amber
    },

    // Mood-based colors - Vibrant and modern
    mood: {
      happy: {
        light: '#FEF3C7',
        main: '#FBBF24',
        dark: '#F59E0B',
      },
      energetic: {
        light: '#FEE2E2',
        main: '#EF4444',
        dark: '#DC2626',
      },
      neutral: {
        light: '#DBEAFE',
        main: '#3B82F6',
        dark: '#1D4ED8',
      },
      calm: {
        light: '#D1FAE5',
        main: '#10B981',
        dark: '#059669',
      },
      sad: {
        light: '#E9D5FF',
        main: '#A855F7',
        dark: '#9333EA',
      },
    },

    // Neutral palette - Clean and professional
    neutral: {
      white: '#FFFFFF',
      off_white: '#F9FAFB', // Very light gray
      light_gray: '#F3F4F6', // Light gray
      medium_gray: '#E5E7EB', // Medium gray
      dark_gray: '#9CA3AF', // Dark gray
      charcoal: '#374151', // Charcoal
      black: '#111827', // Near black
    },

    // Semantic colors - Modern palette
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Dark mode - Modern dark theme
    dark: {
      bg: '#0F172A', // Very dark blue-black
      surface: '#1E293B', // Dark slate
      surface_light: '#334155', // Lighter slate
      text: '#F1F5F9', // Off white
      text_secondary: '#94A3B8', // Gray
    },
  },

  // Gradients - Modern and vibrant
  gradients: {
    primary: 'linear-gradient(135deg, #F0E6FF 0%, #E0F2FE 100%)',
    secondary: 'linear-gradient(135deg, #E0F2FE 0%, #FEF3C7 100%)',
    warm: 'linear-gradient(135deg, #FEF3C7 0%, #FEE2E2 100%)',
    cool: 'linear-gradient(135deg, #DBEAFE 0%, #D1FAE5 100%)',
    vibrant: 'linear-gradient(135deg, #FBBF24 0%, #10B981 100%)',
    dark: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',

    // Mood-based gradients - Vibrant
    happy: 'linear-gradient(135deg, #FEF3C7 0%, #FBBF24 100%)',
    energetic: 'linear-gradient(135deg, #FEE2E2 0%, #EF4444 100%)',
    neutral: 'linear-gradient(135deg, #DBEAFE 0%, #3B82F6 100%)',
    calm: 'linear-gradient(135deg, #D1FAE5 0%, #10B981 100%)',
    sad: 'linear-gradient(135deg, #E9D5FF 0%, #A855F7 100%)',
  },

  // Typography
  typography: {
    // Headers
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },

    // Body
    body_lg: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    body_md: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    body_sm: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 18,
    },

    // Labels
    label_lg: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
    label_md: {
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 16,
    },
    label_sm: {
      fontSize: 11,
      fontWeight: '600',
      lineHeight: 14,
    },

    // Special
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      opacity: 0.7,
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  // Border Radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  // Shadows - Modern and clean
  shadows: {
    // Subtle shadows - Modern minimal
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
    },

    // Glow effects - Vibrant accent colors
    glow_sm: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 3,
    },
    glow_md: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 5,
    },
    glow_lg: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 14,
      elevation: 7,
    },
  },

  // Glassmorphism
  glass: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    dark: {
      backgroundColor: 'rgba(42, 42, 53, 0.7)',
      backdropFilter: 'blur(10px)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
  },

  // Animation timings
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
  },

  // Transitions
  transitions: {
    smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

// Helper function to get mood gradient
export const getMoodGradient = (mood: string): string => {
  switch (mood) {
    case 'happy':
      return ModernTheme.gradients.happy;
    case 'energetic':
      return ModernTheme.gradients.energetic;
    case 'neutral':
      return ModernTheme.gradients.neutral;
    case 'calm':
      return ModernTheme.gradients.calm;
    case 'sad':
      return ModernTheme.gradients.sad;
    default:
      return ModernTheme.gradients.primary;
  }
};

// Helper function to get mood color
export const getMoodColorSet = (mood: string) => {
  return ModernTheme.colors.mood[mood as keyof typeof ModernTheme.colors.mood] ||
    ModernTheme.colors.mood.neutral;
};

export default ModernTheme;
