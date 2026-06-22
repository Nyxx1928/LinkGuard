import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * CopyButton - A reusable button that copies text to the clipboard.
 * 
 * This component provides visual feedback when text is copied:
 * - Shows a copy icon normally
 * - Shows a checkmark briefly after copying
 * - Displays a tooltip on hover
 * 
 * Teaching Point: This demonstrates React state management for UI feedback.
 * The component manages its own "copied" state to show temporary feedback,
 * then resets after 2 seconds.
 */
const CopyButton = ({ text, label = 'Copy', compact = false }) => {
  const [copied, setCopied] = useState(false);

  /**
   * Handle the copy action.
   * 
   * Uses the modern Clipboard API (navigator.clipboard.writeText).
   * This is more secure than the old document.execCommand('copy') method.
   * 
   * Teaching Point: The Clipboard API is asynchronous and returns a Promise.
   * We use async/await to handle it cleanly. If it fails (e.g., user denied
   * permission), we catch the error and log it.
   */
  const handleCopy = async () => {
    try {
      // Write text to clipboard
      await navigator.clipboard.writeText(text);
      
      // Show success feedback
      setCopied(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      // In a production app, you might show an error toast here
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        compact
          ? "p-2 text-body hover:text-primary transition-colors"
          : `
        inline-flex items-center px-3 py-1.5 text-sm font-medium
        text-ink bg-surface border hairline rounded-md
        hover:bg-canvas-soft focus:outline-none focus:ring-2
        focus:ring-offset-2 focus:ring-primary
        transition-colors duration-200
        group relative
      `
      }
      title={copied ? 'Copied!' : label}
      aria-label={compact ? (copied ? 'Copied to clipboard' : label) : undefined}
    >
      {compact ? (
        <span className="inline-flex items-center justify-center">
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </span>
      ) : (
        <>
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          
          <span className="ml-1.5">
            {copied ? 'Copied!' : label}
          </span>

          <div
            className="
              absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
              px-2 py-1 bg-canvas text-white text-xs rounded border hairline
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              pointer-events-none whitespace-nowrap z-10
            "
          >
            {copied ? 'Copied to clipboard!' : `Click to copy ${label.toLowerCase()}`}
            <div
              className="
                absolute top-full left-1/2 transform -translate-x-1/2
                border-4 border-transparent border-t-canvas
              "
            />
          </div>
        </>
      )}
    </button>
  );
};

export default CopyButton;

