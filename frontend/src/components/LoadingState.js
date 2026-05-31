import React from 'react';
import clsx from 'clsx';
import { Check, Loader2 } from 'lucide-react';
import { Progress, Skeleton } from './ui';

const LoadingState = ({
  message = 'Loading...',
  steps = [],
  currentStep = 0,
  progress = null,
  estimatedTime = null,
  size = 'md',
  variant = 'spinner',
}) => {
  const sizeStyles = {
    sm: {
      spinner: 'h-8 w-8',
      text: 'text-sm',
      container: 'p-4',
    },
    md: {
      spinner: 'h-10 w-10',
      text: 'text-base',
      container: 'p-6',
    },
    lg: {
      spinner: 'h-12 w-12',
      text: 'text-lg',
      container: 'p-8',
    },
  };

  const styles = sizeStyles[size] || sizeStyles.md;

  return (
    <div className={clsx('glass-card flex flex-col items-center justify-center gap-3', styles.container)}>
      {variant === 'spinner' && (
        <Loader2 className={clsx('animate-spin text-brand-400', styles.spinner)} />
      )}

      {variant === 'skeleton' && (
        <div className="w-full max-w-lg space-y-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {/* Main Message */}
      <p className={clsx('font-medium text-foreground', styles.text)}>
        {message}
      </p>

      {(variant === 'progress' || progress !== null) && (
        <div className="w-full max-w-md">
          <Progress
            value={progress || 0}
            className="h-2 bg-white/10"
            indicatorClassName="bg-brand-500"
          />
          {progress !== null && (
            <p className="text-xs text-muted-foreground text-center mt-1">
              {progress}% complete
            </p>
          )}
        </div>
      )}

      {steps.length > 0 && (
        <div className="w-full max-w-md mt-2 space-y-2">
          {steps.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div
                key={index}
                className={clsx(
                  'flex items-center space-x-3 rounded-lg px-2 py-1.5 transition-smooth',
                  isCurrent && 'bg-white/5',
                  isComplete && 'opacity-70'
                )}
              >
                <div
                  className={clsx(
                    'flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium',
                    isComplete && 'bg-risk-safe text-white',
                    isCurrent && 'bg-brand-500 text-white',
                    isPending && 'bg-white/10 text-muted-foreground'
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                </div>

                <span
                  className={clsx(
                    'text-sm',
                    isCurrent && 'font-medium text-foreground',
                    isComplete && 'text-muted-foreground',
                    isPending && 'text-muted-foreground/70'
                  )}
                >
                  {step}
                </span>

                {isCurrent && (
                  <div className="flex-shrink-0 ml-auto flex gap-1">
                    <span className="h-2 w-2 bg-brand-400 rounded-full animate-bounce" />
                    <span className="h-2 w-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="h-2 w-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {estimatedTime && (
        <p className="text-xs text-muted-foreground mt-2">
          Estimated time: {estimatedTime}
        </p>
      )}
    </div>
  );
};

export default LoadingState;
