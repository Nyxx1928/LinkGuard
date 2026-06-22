import React, { useState } from 'react';
import { cn } from './utils';

export default function CodeMockup({ children, code, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = code || (typeof children === 'string' ? children : '');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div className={cn('group relative bg-canvas text-ink border border-hairline rounded-md p-xl font-code', className)}>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 text-xs text-mute hover:text-ink border border-hairline rounded-xs bg-canvas-soft opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      {children}
    </div>
  );
}
