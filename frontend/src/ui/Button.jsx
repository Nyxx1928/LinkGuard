import React from 'react';
import { cn } from './utils';

export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const base = 'inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50';
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-soft rounded-sm px-lg py-md font-button-md',
    outline: 'bg-canvas text-ink border border-hairline hover:border-hairline-soft rounded-sm px-lg py-md font-button-md',
    ghost: 'bg-transparent text-primary-soft hover:text-primary rounded-sm px-lg py-md font-button-md',
    pill: 'bg-canvas text-ink border border-hairline rounded-pill px-md py-xs font-body-sm',
  };

  return (
    <button className={cn(base, variants[variant] || variants.primary, className)} {...props}>
      {children}
    </button>
  );
}
