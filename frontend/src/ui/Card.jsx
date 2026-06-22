import React from 'react';
import { cn } from './utils';

export default function Card({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-canvas text-ink border border-hairline rounded-md p-2xl',
    emphasized: 'bg-canvas text-ink border-2 border-primary rounded-md p-2xl',
  };

  return <div className={cn(variants[variant] || variants.default, className)}>{children}</div>;
}
