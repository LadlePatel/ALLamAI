"use client";

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface UseThemeOutput {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'allamai-theme';

export function useTheme(): UseThemeOutput {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'light'; // Default for server rendering
    }
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    // For color-scheme CSS property
    root.style.colorScheme = theme;
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);
  
  // Ensure theme is correctly set on initial client load
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = storedTheme || systemTheme;
    if (initialTheme !== theme) {
       setThemeState(initialTheme);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return { theme, setTheme, toggleTheme };
}
