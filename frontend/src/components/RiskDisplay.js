import React from 'react';
import clsx from 'clsx';
import { AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import { Card, Progress } from './ui';
import RiskBadge from './RiskBadge';

const RiskDisplay = ({
  level,
  score = null,
  confidence = null,
  size = 'lg',
  showScore = true,
  showBadge = true,
}) => {
  const riskConfig = {
    LOW: {
      label: 'Low Risk',
      icon: ShieldCheck,
      gradient: 'from-emerald-500/25 via-emerald-500/10 to-emerald-600/30',
      accent: 'text-emerald-200',
      progress: 'bg-risk-safe',
      description: 'Normal residential or mobile connection',
      badge: 'LOW',
    },
    MEDIUM: {
      label: 'Medium Risk',
      icon: AlertTriangle,
      gradient: 'from-amber-500/25 via-amber-500/10 to-amber-600/30',
      accent: 'text-amber-200',
      progress: 'bg-risk-caution',
      description: 'Hosting provider - could be legitimate',
      badge: 'MEDIUM',
    },
    HIGH: {
      label: 'High Risk',
      icon: AlertTriangle,
      gradient: 'from-red-500/25 via-red-500/10 to-red-600/30',
      accent: 'text-red-200',
      progress: 'bg-risk-danger',
      description: 'Proxy or suspicious characteristics',
      badge: 'HIGH',
    },
    UNKNOWN: {
      label: 'Unknown',
      icon: Info,
      gradient: 'from-slate-500/25 via-slate-500/10 to-slate-600/30',
      accent: 'text-slate-200',
      progress: 'bg-neutral-400',
      description: 'Unable to determine risk level',
      badge: 'UNKNOWN',
    },
  };

  const config = riskConfig[level] || riskConfig.UNKNOWN;
  const IconComponent = config.icon;

  const sizeStyles = {
    sm: {
      container: 'p-4',
      iconWrap: 'h-12 w-12',
      icon: 'h-6 w-6',
      label: 'text-base',
      score: 'text-3xl',
      description: 'text-xs',
    },
    md: {
      container: 'p-6',
      iconWrap: 'h-14 w-14',
      icon: 'h-7 w-7',
      label: 'text-lg',
      score: 'text-4xl',
      description: 'text-sm',
    },
    lg: {
      container: 'p-8',
      iconWrap: 'h-16 w-16',
      icon: 'h-8 w-8',
      label: 'text-xl',
      score: 'text-5xl',
      description: 'text-base',
    },
  };

  const styles = sizeStyles[size] || sizeStyles.lg;

  return (
    <Card
      variant="elevated"
      padding="none"
      className={clsx('overflow-hidden bg-gradient-to-br', config.gradient)}
    >
      <div className={clsx('relative', styles.container)}>
        <div className="absolute inset-0 opacity-30 blur-2xl" />

        <div className="relative flex flex-col items-center text-center gap-4">
          <div className="flex w-full items-center justify-between">
            <div
              className={clsx(
                'flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm',
                styles.iconWrap
              )}
            >
              <IconComponent className={clsx(styles.icon, config.accent)} />
            </div>
            {showBadge && <RiskBadge level={config.badge} />}
          </div>

          <div>
            <p className={clsx('font-semibold text-foreground', styles.label)}>
              {config.label}
            </p>
            <p className={clsx('mt-1 text-muted-foreground', styles.description)}>
              {config.description}
            </p>
          </div>

          {showScore && score !== null && (
            <div className="w-full space-y-3">
              <div className={clsx('font-bold text-foreground', styles.score)}>
                {score}
                <span className="text-base text-muted-foreground">/100</span>
              </div>
              <Progress
                value={score}
                className="h-3 bg-white/10"
                indicatorClassName={config.progress}
              />
              {confidence !== null && (
                <p className="text-xs text-muted-foreground">
                  Confidence: {confidence}%
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RiskDisplay;
