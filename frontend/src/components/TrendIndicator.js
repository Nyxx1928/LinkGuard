import React from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

const TrendIndicator = ({ value, direction = 'neutral', label = 'vs last period', className = '' }) => {
  const config = {
    up: {
      icon: TrendingUp,
      color: 'text-risk-safe',
      bg: 'bg-risk-safe/10',
    },
    down: {
      icon: TrendingDown,
      color: 'text-risk-danger',
      bg: 'bg-risk-danger/10',
    },
    neutral: {
      icon: Minus,
      color: 'text-neutral-400',
      bg: 'bg-neutral-500/10',
    },
  };

  const { icon: Icon, color, bg } = config[direction] || config.neutral;

  return (
    <div className={cn('inline-flex items-center gap-2 text-xs font-medium', className)}>
      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5', bg, color)}>
        <Icon className="h-3.5 w-3.5" />
        <span>{value}</span>
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
};

export default TrendIndicator;
