import React, { createContext, useState, useEffect, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeMode = 'dark' | 'light';

interface ThemeContextProps {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as ThemeMode;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const LIGHT = {
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5',
    },
    text: {
      primary: '#000000',
    },
    secondary: {
      main: '#1976d2', // Example secondary color for light theme
    },
    action: {
      selected: 'rgba(0, 0, 0, 0.1)', // Selected color for light theme
    },
  } as const;

  const DARK = {
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#E0E0E0',
    },
    secondary: {
      main: '#bb86fc',
    },
    action: {
      selected: 'rgba(255, 255, 255, 0.2)', // Selected color for dark theme
    },
  } as const;

  const muiTheme = createTheme({
    palette: {
      mode: theme,
      ...(theme === 'dark'
        ? DARK
        : LIGHT),
    },
  });

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};