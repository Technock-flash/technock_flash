import React, { createContext, useContext, type ReactNode } from 'react';
import './theme.css';

interface ThemeContextType {
  // Placeholders for future dynamic theme switching (e.g., toggleTheme)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{}}>
      <div className="theme-wrapper" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export default ThemeProvider;