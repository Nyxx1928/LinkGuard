import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { cn } from '../lib/utils';

const defaultData = [
  { name: 'Safe', value: 42, fill: '#7dd3fc' },
  { name: 'Caution', value: 26, fill: '#0ea5e9' },
  { name: 'Danger', value: 18, fill: '#0369a1' },
  { name: 'Unknown', value: 14, fill: '#6b7280' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const value = payload[0]?.value;

  return (
    <div className="bg-surface px-3 py-2 text-xs text-white border hairline rounded-md">
      <p className="text-body">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
};

const RiskChart = ({ data = defaultData, className = '' }) => {
  const chartData = data && data.length ? data : defaultData;

  const summary = chartData
    .map((entry) => `${entry.name}: ${entry.value}`)
    .join(', ');

  return (
    <div
      className={cn('h-60 w-full', className)}
      role="img"
      aria-label="Risk distribution chart"
      aria-describedby="risk-chart-summary"
    >
      <p id="risk-chart-summary" className="sr-only">
        {summary}
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill || '#38bdf8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskChart;
