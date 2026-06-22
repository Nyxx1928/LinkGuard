import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { Card } from './ui';
import { cn } from '../lib/utils';

const severityConfig = {
  high: {
    label: 'High Risk Signals',
    icon: ShieldAlert,
    accent: 'text-risk-danger',
    border: 'border-risk-danger/40',
    bg: 'bg-risk-danger/10',
  },
  medium: {
    label: 'Moderate Signals',
    icon: AlertTriangle,
    accent: 'text-risk-caution',
    border: 'border-risk-caution/40',
    bg: 'bg-risk-caution/10',
  },
  low: {
    label: 'Low Risk Signals',
    icon: ShieldCheck,
    accent: 'text-risk-safe',
    border: 'border-risk-safe/40',
    bg: 'bg-risk-safe/10',
  },
  info: {
    label: 'Informational Signals',
    icon: Info,
    accent: 'text-primary',
    border: 'border-primary/40',
    bg: 'bg-primary/10',
  },
};

const defaultIconMap = {
  high: ShieldAlert,
  medium: AlertTriangle,
  low: CheckCircle,
  info: Info,
};

const RiskFactors = ({ factors = [], className = '' }) => {
  if (!factors.length) {
    return (
      <Card variant="default" className={cn('text-sm text-body p-4', className)}>
        No risk factors identified for this target yet.
      </Card>
    );
  }

  const grouped = factors.reduce((acc, factor) => {
    const severity = factor.severity || 'info';
    if (!acc[severity]) acc[severity] = [];
    acc[severity].push(factor);
    return acc;
  }, {});

  const orderedSeverities = ['high', 'medium', 'low', 'info'];

  return (
    <div className={cn('space-y-4', className)}>
      {orderedSeverities.map((severity) => {
        const items = grouped[severity];
        if (!items || items.length === 0) return null;

        const config = severityConfig[severity] || severityConfig.info;
        const SectionIcon = config.icon;

        return (
          <Card key={severity} variant="default" className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SectionIcon className={cn('h-4 w-4', config.accent)} />
                <h3 className="text-sm font-semibold text-white">{config.label}</h3>
              </div>
              <span className="text-xs text-body">{items.length} signals</span>
            </div>
            <div className="space-y-2">
              {items.map((factor, index) => {
                const ItemIcon = factor.icon || defaultIconMap[severity] || Info;
                return (
                  <div
                    key={`${factor.label}-${index}`}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border px-3 py-2',
                      config.border,
                      config.bg
                    )}
                  >
                    <ItemIcon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', config.accent)} />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {factor.label}
                      </p>
                      {factor.description && (
                        <p className="text-xs text-body">
                          {factor.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default RiskFactors;
