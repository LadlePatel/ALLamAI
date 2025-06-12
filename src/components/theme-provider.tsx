
"use client";

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
// Import the type directly from next-themes to ensure compatibility
import type { ThemeProviderProps as NextThemesProviderPropsType } from 'next-themes/dist/types';

// Use the props type from next-themes, but make children mandatory for our wrapper.
type ThemeProviderProps = {
  children: React.ReactNode;
} & NextThemesProviderPropsType;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Note: The custom `useTheme` hook and `ThemeProviderContext` previously in this file
// have been removed as they are redundant. Components should directly use
// `useTheme` from "next-themes" if they need to interact with the theme,
// like ThemeToggle.tsx already does.
