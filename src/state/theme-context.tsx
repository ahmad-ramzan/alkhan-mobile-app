import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { Colors, type ThemeColor } from '@/constants/theme';
import { storage } from '@/services/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_MODE_KEY = 'theme_mode';

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: Record<ThemeColor, string>;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    storage.get(THEME_MODE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') setModeState(saved);
    });
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    storage.set(THEME_MODE_KEY, next);
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const value = useMemo(() => ({ mode, isDark, colors, setMode }), [mode, isDark, colors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within a ThemeProvider');
  return ctx;
}

export function useAppColor(key: ThemeColor) {
  return useAppTheme().colors[key];
}
