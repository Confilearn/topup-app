// TopupAfrica design tokens
export const COLORS = {
  // Backgrounds
  bgPrimary: '#080818',
  bgSecondary: '#0E0E2A',
  bgCard: '#12122A',
  bgCardAlt: '#1A1A35',
  bgInput: '#141430',

  // Purple/Blue brand gradient
  gradientStart: '#7C3AED',
  gradientEnd: '#3B82F6',
  gradientMid: '#5B21B6',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C8',
  textMuted: '#6B6B90',

  // Accent
  purple: '#7C3AED',
  purpleLight: '#9F7AEA',
  blue: '#3B82F6',
  blueLight: '#60A5FA',

  // Status colors
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  pending: '#F59E0B',

  // Border
  border: '#1E1E3F',
  borderLight: '#252550',

  // Service icon colors
  airtime: '#22C55E',
  data: '#3B82F6',
  electricity: '#F59E0B',
  cable: '#7C3AED',
  bills: '#EF4444',
  internet: '#06B6D4',
};

export const GRADIENTS = {
  primary: ['#7C3AED', '#3B82F6'] as const,
  card: ['#1A1A40', '#12122A'] as const,
  wallet: ['#2D1B69', '#1E3A8A'] as const,
  success: ['#065F46', '#064E3B'] as const,
  error: ['#7F1D1D', '#450A0A'] as const,
};

export default {
  light: {
    text: '#FFFFFF',
    background: '#080818',
    tint: '#7C3AED',
    tabIconDefault: '#6B6B90',
    tabIconSelected: '#7C3AED',
  },
  dark: {
    text: '#FFFFFF',
    background: '#080818',
    tint: '#7C3AED',
    tabIconDefault: '#6B6B90',
    tabIconSelected: '#7C3AED',
  },
};
