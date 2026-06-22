import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import HistoryFilters from './HistoryFilters';
import HistoryItem from './HistoryItem';
import InsightsPanel from './InsightsPanel';
import LazyRiskChart from './LazyRiskChart';
import { Card } from './ui';

/**
 * HistoryDashboard - History list with filters and insights.
 */
const HistoryDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/history');
        setItems(res.data.data || []);
      } catch (error) {
        console.error('Failed to load history', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filtered = useMemo(() => {
    let result = [...items];

    if (searchValue) {
      const query = searchValue.toLowerCase();
      result = result.filter((item) =>
        item.target.toLowerCase().includes(query) ||
        (item.label || '').toLowerCase().includes(query)
      );
    }

    if (riskFilter !== 'all') {
      result = result.filter((item) => item.risk_level === riskFilter);
    }

    if (sortBy === 'risk') {
      const order = ['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'];
      result.sort((a, b) => order.indexOf(a.risk_level) - order.indexOf(b.risk_level));
    } else if (sortBy === 'target') {
      result.sort((a, b) => a.target.localeCompare(b.target));
    } else {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [items, riskFilter, searchValue, sortBy]);

  const metrics = [
    { label: 'Total Lookups', value: items.length, id: 'total' },
    { label: 'High Risk', value: items.filter((item) => item.risk_level === 'HIGH').length, id: 'high' },
    { label: 'Unique Targets', value: new Set(items.map((item) => item.target)).size, id: 'unique' },
  ];

  const chartData = [
    { name: 'Safe', value: items.filter((item) => item.risk_level === 'LOW').length, fill: '#10b981' },
    { name: 'Caution', value: items.filter((item) => item.risk_level === 'MEDIUM').length, fill: '#f59e0b' },
    { name: 'Danger', value: items.filter((item) => item.risk_level === 'HIGH').length, fill: '#ef4444' },
    { name: 'Unknown', value: items.filter((item) => item.risk_level === 'UNKNOWN').length, fill: '#8b949e' },
  ];

  return (
    <div className="space-y-6">
      <InsightsPanel
        title="History Overview"
        description="Track the latest risk outcomes and analysis volume."
        metrics={metrics}
        chart={<LazyRiskChart data={chartData} />}
      />

      <HistoryFilters
        searchValue={searchValue}
        onSearchChange={(e) => setSearchValue(e.target.value)}
        riskFilter={riskFilter}
        onRiskChange={setRiskFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <Card variant="default" className="space-y-4 fade-in p-6">
        {loading && <p className="text-sm text-body">Loading history...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-body">No history results match your filters.</p>
        )}
        {!loading && filtered.map((item) => (
          <HistoryItem key={item.id} item={item} />
        ))}
      </Card>
    </div>
  );
};

export default HistoryDashboard;
