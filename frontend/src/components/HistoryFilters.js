import React from 'react';
import { Filter, Search } from 'lucide-react';
import { Button, Input, Card } from './ui';

/**
 * HistoryFilters - Controls for filtering and sorting history.
 */
const HistoryFilters = ({
  searchValue,
  onSearchChange,
  riskFilter,
  onRiskChange,
  sortBy,
  onSortChange,
}) => {
  const riskOptions = ['all', 'LOW', 'MEDIUM', 'HIGH', 'UNKNOWN'];
  const sortOptions = ['recent', 'risk', 'target'];

  return (
    <Card variant="subtle" padding="md" className="space-y-4 fade-in">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Filter className="h-4 w-4 text-brand-400" />
        Filters
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="text"
          placeholder="Search by target or label"
          value={searchValue}
          onChange={onSearchChange}
          icon={<Search className="h-4 w-4" />}
          iconPosition="left"
        />
        <div className="flex flex-wrap gap-2">
          {riskOptions.map((option) => (
            <Button
              key={option}
              variant={riskFilter === option ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onRiskChange(option)}
            >
              {option === 'all' ? 'All' : option}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <Button
              key={option}
              variant={sortBy === option ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onSortChange(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default HistoryFilters;
