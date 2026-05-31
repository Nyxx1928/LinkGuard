import React from 'react';
import { Check } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

/**
 * ThemeToggle Example
 * 
 * Demonstrates the ThemeToggle component in action.
 * Shows how the theme affects different UI elements.
 */
export default function ThemeToggleExample() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto p-8">
        {/* Header with ThemeToggle */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Theme Toggle Demo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Click the theme toggle button to switch between light and dark modes
            </p>
          </div>
          <ThemeToggle />
        </header>

        {/* Demo Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Light Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                This card demonstrates how content looks in light mode with a clean,
                bright appearance.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Dark Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                In dark mode, the same card automatically adjusts to use darker
                colors that are easier on the eyes in low-light conditions.
              </p>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Persistent Preference</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Your theme preference is saved in localStorage and will be
                remembered when you return to the application.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature List */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Features
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span>Smooth transitions between light and dark modes</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span>localStorage persistence for user preference</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span>Respects system preference on first visit</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span>Accessible with proper ARIA labels</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span>Professional Moon/Sun icons from lucide-react</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
