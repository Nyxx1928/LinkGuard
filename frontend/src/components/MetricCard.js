import React from 'react';
import { Card } from './ui';
import { cn } from '../lib/utils';
import TrendIndicator from './TrendIndicator';

const MetricCard = ({
  icon: Icon,
  label,
  value,
  trend,
  className = '',
}) => {
  return (
    <Card variant="default" className={cn('space-y-4 p-4', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-body">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend && (
        <TrendIndicator
          value={trend.value}
          direction={trend.direction}
          label={trend.label}
        />
      )}
    </Card>
  );
};

export default MetricCard;
