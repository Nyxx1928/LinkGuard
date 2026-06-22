import React from 'react';
import { cn } from './utils';

export default function CodeInlineChip({ children, className = '' }) {
  return (
    <span className={cn('inline-block bg-canvas-soft text-canvas-text-soft rounded-xs px-sm py-xxs font-code', className)}>
      {children}
    </span>
  );
}
