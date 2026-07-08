import '@/global.css';

import { Platform, type ViewStyle } from 'react-native';

/**
 * SilverChimp design system v2.
 * Modern palette with gradients, refined spacing, richer type scale.
 */

const gradients = {
  light: {
    accent: ['#7A5AF8', '#A78BFA'] as const,
    accentStrong: ['#6D28D9', '#7A5AF8'] as const,
    team: ['#F59E0B', '#FCD34D'] as const,
    squat: ['#F97316', '#FB923C'] as const,
    bench: ['#3B82F6', '#60A5FA'] as const,
    deadlift: ['#EF4444', '#F87171'] as const,
    success: ['#059669', '#22C55E'] as const,
    fail: ['#DC2626', '#F87171'] as const,
    silver: ['#6B7280', '#9CA3AF'] as const,
    hero: ['#1F2937', '#374151'] as const,
  },
  dark: {
    accent: ['#A78BFA', '#C4B5FD'] as const,
    accentStrong: ['#7C3AED', '#A78BFA'] as const,
    team: ['#FBBF24', '#FCD34D'] as const,
    squat: ['#FB923C', '#FDBA74'] as const,
    bench: ['#60A5FA', '#7DD3FC'] as const,
    deadlift: ['#F87171', '#FCA5A5'] as const,
    success: ['#22C55E', '#4ADE80'] as const,
    fail: ['#EF4444', '#F87171'] as const,
    silver: ['#9CA3AF', '#D1D5DB'] as const,
    hero: ['#0F172A', '#1E293B'] as const,
  },
} as const;

export const Gradients = gradients;

export const Colors = {
  light: {
    text: '#0F172A',
    textInverse: '#FFFFFF',
    background: '#F8FAFC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E2E8F0',
    textSecondary: '#64748B',
    brand: '#475569',
    brandStrong: '#0F172A',
    accent: '#7A5AF8',
    accentSoft: '#EDE9FE',
    team: '#F59E0B',
    teamSoft: '#FEF3C7',
    squat: '#F97316',
    squatSoft: '#FFEDD5',
    bench: '#3B82F6',
    benchSoft: '#DBEAFE',
    deadlift: '#EF4444',
    deadliftSoft: '#FEE2E2',
    success: '#059669',
    successSoft: '#D1FAE5',
    fail: '#DC2626',
    failSoft: '#FEE2E2',
    hairline: '#E2E8F0',
    hairlineStrong: '#CBD5E1',
    glass: 'rgba(255,255,255,0.7)',
    shadow: '#0F172A',
  },
  dark: {
    text: '#F8FAFC',
    textInverse: '#0F172A',
    background: '#0B0F19',
    backgroundElement: '#161B26',
    backgroundSelected: '#1F2937',
    textSecondary: '#94A3B8',
    brand: '#94A3B8',
    brandStrong: '#F8FAFC',
    accent: '#A78BFA',
    accentSoft: '#2E1F5C',
    team: '#FBBF24',
    teamSoft: '#422006',
    squat: '#FB923C',
    squatSoft: '#431407',
    bench: '#60A5FA',
    benchSoft: '#0C2A4A',
    deadlift: '#F87171',
    deadliftSoft: '#450A0A',
    success: '#22C55E',
    successSoft: '#052E16',
    fail: '#F87171',
    failSoft: '#450A0A',
    hairline: '#1F2937',
    hairlineStrong: '#374151',
    glass: 'rgba(22,27,38,0.7)',
    shadow: '#000000',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const TypeScale = {
  display: { size: 32, weight: '800' as const, line: 38, letter: -0.5 },
  h1: { size: 26, weight: '800' as const, line: 32, letter: -0.3 },
  h2: { size: 20, weight: '700' as const, line: 26, letter: -0.2 },
  h3: { size: 17, weight: '700' as const, line: 22, letter: 0 },
  body: { size: 16, weight: '400' as const, line: 24, letter: 0 },
  bodyStrong: { size: 16, weight: '600' as const, line: 24, letter: 0 },
  caption: { size: 13, weight: '600' as const, line: 18, letter: 0.1 },
  micro: { size: 11, weight: '700' as const, line: 14, letter: 0.4 },
} as const;

export const Shadow: Record<'sm' | 'md' | 'lg', ViewStyle> = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export type GradientKey =
  | 'accent'
  | 'accentStrong'
  | 'team'
  | 'squat'
  | 'bench'
  | 'deadlift'
  | 'success'
  | 'fail'
  | 'silver'
  | 'hero';

export function getGradient(
  key: GradientKey,
  scheme: 'light' | 'dark'
): readonly [string, string] {
  return Gradients[scheme][key];
}
