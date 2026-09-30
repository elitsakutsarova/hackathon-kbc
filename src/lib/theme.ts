import { StyleSheet, useColorScheme } from 'react-native';

import type { Pastel } from './dreams';
import { useApp } from './store';

// ---------- Tokens (light + dark), same values as the web version ----------
const light = {
  bg: '#F3F7FB',
  surface: '#FFFFFF',
  ink: '#0B2A4A',
  muted: '#4D6480',
  line: '#DDE7F1',
  day: '#EAF1F8',
  primary: '#0070C0',
  primaryInk: '#FFFFFF',
  strongFill: '#0B2A4A', // dark filled circles and buttons
  strongFillInk: '#FFFFFF',
  tabbar: '#0B2A4A',
  tabbarIcon: '#A9C3DC',
  warnBg: '#FFF1DF',
  goodBg: '#DDF3E6',
  shadow: '0px 6px 20px rgba(11, 42, 74, 0.07)',
};

const dark: typeof light = {
  bg: '#0A1624',
  surface: '#132338',
  ink: '#E8F0F8',
  muted: '#A8BCD0',
  line: '#25394F',
  day: '#1B2E45',
  primary: '#5DB6F0',
  primaryInk: '#0A1624',
  strongFill: '#E8F0F8',
  strongFillInk: '#0A1624',
  tabbar: '#020B15',
  tabbarIcon: '#8FA9C2',
  warnBg: '#3A2A16',
  goodBg: '#173524',
  shadow: 'none',
};

// Pastel cards always keep dark text, in light and dark mode.
export const fixed = {
  cardInk: '#0B2A4A',
  cardMuted: '#3E5670',
  sky: '#62BCEB',
  skySoft: '#D6EDFB',
  mint: '#CDEDC4',
  mintStrong: '#1F7A43',
  lilac: '#6158CC',
  lilacSoft: '#E4E2FA',
  peach: '#FFDCCD',
  sun: '#FFD66B',
  warnLine: '#C8680A',
  focus: '#E07A10',
  badge: '#D9480F',
};

export const PASTEL_BACKGROUNDS: Record<Pastel, string> = {
  mint: fixed.mint,
  lilac: fixed.lilacSoft,
  sky: fixed.skySoft,
  peach: fixed.peach,
  sun: '#FFE9A8',
};

export const radius = { xl: 32, lg: 24, md: 16 };

// Poppins ships one file per weight, so each weight is its own font family.
const FONT_FAMILIES = {
  400: 'Poppins_400Regular',
  500: 'Poppins_500Medium',
  600: 'Poppins_600SemiBold',
  700: 'Poppins_700Bold',
  800: 'Poppins_800ExtraBold',
} as const;
export type Weight = keyof typeof FONT_FAMILIES;

export function font(weight: Weight) {
  return { fontFamily: FONT_FAMILIES[weight] };
}

export type Theme = {
  key: string;
  isDark: boolean;
  c: typeof light;
  /** Converts CSS rem to pixels, honouring the "bigger text" setting. */
  rem: (value: number) => number;
};

const themes = new Map<string, Theme>();

export function useTheme(): Theme {
  const isDark = useColorScheme() === 'dark';
  const { state } = useApp();
  const key = (isDark ? 'dark' : 'light') + (state.isLargeText ? '-large' : '');
  let theme = themes.get(key);
  if (!theme) {
    const base = state.isLargeText ? 18.5 : 16;
    theme = { key, isDark, c: isDark ? dark : light, rem: (value) => Math.round(value * base * 10) / 10 };
    themes.set(key, theme);
  }
  return theme;
}

/** Like a CSS file: styles are built once per theme and reused. */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(build: (theme: Theme) => T) {
  const cache = new Map<string, T>();
  return function useStyles() {
    const theme = useTheme();
    let styles = cache.get(theme.key);
    if (!styles) {
      styles = StyleSheet.create(build(theme));
      cache.set(theme.key, styles);
    }
    return styles;
  };
}
