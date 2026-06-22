import React from 'react';
import clsx from 'clsx';
import { AlertCircle, AlertTriangle, Info, RotateCcw } from 'lucide-react';
import { Button, Card } from './ui';

/**
 * ErrorDisplay - Friendly error message component with clear next steps
 * 
 * Displays user-friendly error messages with appropriate styling, icons,
 * and actionable next steps. Designed to guide users toward resolution
 * without causing alarm.
 * 
 * Error Types:
 * - validation: Invalid input format
 * - network: Connection or network issues
 * - rateLimit: Too many requests
 * - notFound: Target couldn't be resolved
 * - server: Backend or server errors
 */
const ErrorDisplay = ({
  type = 'server',
  title = null,
  message = null,
  details = null,
  actions = [],
  onRetry = null,
  onDismiss = null,
  size = 'md',
  className = '',
}) => {
  // Error type configurations
  const errorConfig = {
    validation: {
      icon: AlertCircle,
      defaultTitle: 'Invalid Input Format',
      defaultMessage: 'The format does not match any supported type.',
      variant: 'error',
    },
    network: {
      icon: AlertTriangle,
      defaultTitle: 'Connection Issue',
      defaultMessage: 'We could not reach the server. Please check your connection.',
      variant: 'error',
    },
    rateLimit: {
      icon: AlertTriangle,
      defaultTitle: 'Too Many Requests',
      defaultMessage: 'You have made too many requests. Please wait and try again.',
      variant: 'warning',
    },
    notFound: {
      icon: Info,
      defaultTitle: 'Target Not Found',
      defaultMessage: 'We could not locate the target you entered.',
      variant: 'info',
    },
    server: {
      icon: AlertCircle,
      defaultTitle: 'Something Went Wrong',
      defaultMessage: 'An unexpected error occurred. Please try again shortly.',
      variant: 'error',
    },
  };

  const variantStyles = {
    error: {
      border: 'border-risk-danger/40',
      iconBg: 'bg-risk-danger/10',
      iconText: 'text-risk-danger',
      title: 'text-white',
      body: 'text-body',
      details: 'text-risk-danger',
    },
    warning: {
      border: 'border-risk-caution/40',
      iconBg: 'bg-risk-caution/10',
      iconText: 'text-risk-caution',
      title: 'text-white',
      body: 'text-body',
      details: 'text-risk-caution',
    },
    info: {
      border: 'border-primary/40',
      iconBg: 'bg-brand-500/10',
      iconText: 'text-primary',
      title: 'text-foreground',
      body: 'text-muted-foreground',
      details: 'text-primary',
    },
  };

  const config = errorConfig[type] || errorConfig.server;
  const variant = variantStyles[config.variant] || variantStyles.error;

  const sizeStyles = {
    sm: {
      container: 'p-4',
      icon: 'w-10 h-10',
      title: 'text-base',
      message: 'text-sm',
      details: 'text-xs',
    },
    md: {
      container: 'p-6',
      icon: 'w-12 h-12',
      title: 'text-lg',
      message: 'text-base',
      details: 'text-sm',
    },
    lg: {
      container: 'p-8',
      icon: 'w-14 h-14',
      title: 'text-xl',
      message: 'text-lg',
      details: 'text-base',
    },
  };

  const styles = sizeStyles[size] || sizeStyles.md;

  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  return (
    <Card
      variant="default"
      className={clsx('border', variant.border, styles.container, className)}
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={clsx(
            'rounded-full flex items-center justify-center mb-4',
            variant.iconBg,
            variant.iconText,
            styles.icon
          )}
        >
          <config.icon className="h-6 w-6" />
        </div>

        <h3 className={clsx('font-semibold mb-2', variant.title, styles.title)}>
          {displayTitle}
        </h3>

        <p className={clsx('mb-4', variant.body, styles.message)}>
          {displayMessage}
        </p>

        {details && (
          <div
            className={clsx(
              'w-full rounded-lg border border-white/10 bg-white/5 p-3 mb-4',
              variant.details,
              styles.details
            )}
          >
            {Array.isArray(details) ? (
              <ul className="list-disc list-inside text-left space-y-1">
                {details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            ) : (
              <p className="text-left">{details}</p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          {onRetry && (
            <Button
              variant="primary"
              size={size === 'lg' ? 'md' : 'sm'}
              onClick={onRetry}
              icon={<RotateCcw className="h-4 w-4" />}
            >
              Try Again
            </Button>
          )}

          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size={size === 'lg' ? 'md' : 'sm'}
              onClick={action.onClick}
              icon={action.icon}
            >
              {action.label}
            </Button>
          ))}

          {onDismiss && (
            <Button
              variant="ghost"
              size={size === 'lg' ? 'md' : 'sm'}
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ErrorDisplay;
