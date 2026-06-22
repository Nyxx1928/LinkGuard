import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import RiskBadge from './RiskBadge';
import CopyButton from './CopyButton';
import { Card } from './ui';
import { relativeTimestamp } from '../utils/formatters';

/**
 * HistoryItem - Single history row with actions.
 */
const HistoryItem = ({ item, onEdit, onDelete }) => {
  const label = item.label || item.target;

  return (
    <Card
      variant="default"
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between hover-lift p-4"
    >
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        {item.label && (
          <p className="text-xs text-body font-mono mt-1">{item.target}</p>
        )}
        <p className="text-xs text-body mt-2">
          {relativeTimestamp(item.created_at)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <RiskBadge level={item.risk_level} />
        {item.uuid && <CopyButton text={`${window.location.origin}/lookup/${item.uuid}`} label="Copy link" compact />}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-2 text-body hover:text-primary transition-colors"
            aria-label="Edit label"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="p-2 text-body hover:text-risk-danger transition-colors"
            aria-label="Delete entry"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  );
};

export default HistoryItem;
