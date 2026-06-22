import React from 'react';
import { Card } from './ui';
import { cn } from '../lib/utils';
import MetricCard from './MetricCard';

const InsightsPanel = ({
  title,
  description,
  metrics = [],
  chart = null,
  emptyMessage = 'No insights available yet.',
  className = '',
}) => {
  const hasMetrics = metrics.length > 0;

  return (
    <Card variant="default" className={cn('space-y-6 p-6', className)}>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description && (
          <p className="text-sm text-body">{description}</p>
        )}
      </div>

      {hasMetrics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.id || metric.label} {...metric} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-body">
          {emptyMessage}
        </div>
      )}

      {chart && <div className="pt-2">{chart}</div>}
    </Card>
  );
};

export default InsightsPanel;
