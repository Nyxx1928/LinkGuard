import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './button.jsx';

/**
 * ThemeToggle Component
 * 
 * A toggle button that switches between light and dark themes.
 * Persists user preference in localStorage and applies the theme
 * by toggling the 'dark' class on the document root element.
 * 
 * @component
 * @example
 * ```jsx
 * <ThemeToggle />
 * ```
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true);
    
    try {
      const storedTheme = localStorage.getItem('theme');
      
      if (storedTheme) {
        setTheme(storedTheme);
        applyTheme(storedTheme);
      } else {
        // Default to dark mode (app UI is built with dark backgrounds)
        setTheme('dark');
        applyTheme('dark');
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      setTheme('dark');
      applyTheme('dark');
    }
  }, []);

  /**
   * Apply theme by toggling the 'dark' class on document root
   * @param {string} newTheme - 'light' or 'dark'
   */
  const applyTheme = (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="icon"
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="transition-transform duration-200 hover:scale-110"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 transition-all duration-300" />
      ) : (
        <Sun className="h-5 w-5 transition-all duration-300" />
      )}
    </Button>
  );
}

export default ThemeToggle;
