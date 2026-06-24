import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  secondary: string;
  tabBg: string;
  tabBorder: string;
  tabBlur: 'light' | 'dark';
};

const LightColors: ThemeColors = {
  background: "#FFFFFF",
  card: "#F8FAFC",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  primary: "#33BFFF",
  secondary: "#004be3",
  tabBg: "rgba(255, 255, 255, 0.85)",
  tabBorder: "rgba(15, 23, 42, 0.08)",
  tabBlur: "light",
};

const DarkColors: ThemeColors = {
  background: "#0F172A",
  card: "#1E293B",
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  border: "#334155",
  primary: "#33BFFF",
  secondary: "#38BDF8",
  tabBg: "rgba(15, 23, 42, 0.85)",
  tabBorder: "rgba(255, 255, 255, 0.12)",
  tabBlur: "dark",
};

type ThemeContextType = {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, _setThemeMode] = useState<ThemeMode>('system');

  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const stored = await AsyncStorage.getItem('@theme_mode');
        if (stored) {
          _setThemeMode(stored as ThemeMode);
        }
      } catch (e) {
        console.error("Failed to load theme preference:", e);
      }
    };
    loadThemeMode();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      _setThemeMode(mode);
      await AsyncStorage.setItem('@theme_mode', mode);
    } catch (e) {
      console.error("Failed to save theme preference:", e);
    }
  };

  const isDark = themeMode === 'system' 
    ? systemScheme === 'dark' 
    : themeMode === 'dark';

  const colors = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, colors, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
