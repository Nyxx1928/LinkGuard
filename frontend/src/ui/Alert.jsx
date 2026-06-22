import React from 'react';
import { cn } from './utils';

export default function Alert({ children, type = 'info', className = '' }) {
  const styles = {
    info: 'bg-blue-950 text-blue-200 border border-blue-800',
    error: 'bg-red-950 text-red-200 border border-red-800',
    success: 'bg-emerald-950 text-emerald-200 border border-emerald-800',
    warning: 'bg-yellow-950 text-yellow-200 border border-yellow-800',
  };

  return <div className={cn('p-3 rounded-md', styles[type] || styles.info, className)}>{children}</div>;
}
