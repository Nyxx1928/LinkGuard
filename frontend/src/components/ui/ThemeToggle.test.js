import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle Component', () => {
  let localStorageMock;

  beforeEach(() => {
    // Clear document classes
    document.documentElement.className = '';
    
    // Mock localStorage
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    
    // Replace global localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the theme toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('initializes with dark theme by default', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<ThemeToggle />);
    const button = await screen.findByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('loads theme from localStorage if available', async () => {
    localStorageMock.getItem.mockReturnValue('dark');
    document.documentElement.classList.remove('dark'); // Ensure clean state
    
    render(<ThemeToggle />);
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('toggles theme from light to dark', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(<ThemeToggle />);
    
    const button = await screen.findByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    fireEvent.click(button);
    await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true));
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    
    // Check localStorage was called (may be async)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('toggles theme from dark to light', async () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(<ThemeToggle />);
    
    const button = await screen.findByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    fireEvent.click(button);
    await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(false));
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    
    // Check localStorage was called (may be async)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('persists theme preference to localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(<ThemeToggle />);
    
    const button = await screen.findByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('applies dark class to document.documentElement when theme is dark', async () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(<ThemeToggle />);
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('removes dark class from document.documentElement when theme is light', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    document.documentElement.classList.add('dark'); // Start with dark class
    
    render(<ThemeToggle />);
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  it('handles localStorage errors gracefully', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage unavailable');
    });
    
    render(<ThemeToggle />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
    
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to load theme preference:',
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
  });

  it('respects system preference when no stored theme', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    
    render(<ThemeToggle />);
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  // Icon rendering is covered indirectly by aria-label and DOM class changes

  it('has proper accessibility attributes', async () => {
    render(<ThemeToggle />);
    const button = await screen.findByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button.getAttribute('aria-label')).toMatch(/Switch to (light|dark) mode/);
  });
});
