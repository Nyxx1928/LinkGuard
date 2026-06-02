import React from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Button, Input, Card } from './ui';

/**
 * AnalysisForm - URL and target input form.
 *
 * @param {Object} props
 * @param {string} props.value - Current input value
 * @param {function} props.onChange - Input change handler
 * @param {function} props.onSubmit - Submit handler
 * @param {function} props.onClear - Clear handler
 * @param {string} props.error - Validation error message
 * @param {boolean} props.loading - Loading state toggle
 * @param {string} props.helperText - Helper copy below the form
 */
const AnalysisForm = ({
  value,
  onChange,
  onSubmit,
  onClear,
  error,
  loading,
  helperText,
}) => {
  return (
    <Card variant="glass" padding="md" className="space-y-4 fade-in">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            type="url"
            placeholder="Enter IP, domain, URL, or email (e.g. example.com)"
            value={value}
            onChange={onChange}
            disabled={loading}
            error={error}
            clearable
            onClear={onClear}
            icon={<Search className="h-4 w-4" />}
            iconPosition="left"
          />
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={onSubmit}
          disabled={loading}
          loading={loading}
          icon={!loading && <Search className="h-4 w-4" />}
          iconPosition="left"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={onClear}
          disabled={loading}
          icon={<Trash2 className="h-4 w-4" />}
          iconPosition="left"
        >
          Clear
        </Button>
      </div>
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </Card>
  );
};

export default AnalysisForm;
