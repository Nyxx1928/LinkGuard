import React, { useState, useEffect } from 'react';
import api from '../api';
import RiskBadge from './RiskBadge';
import CopyButton from './CopyButton';
import { relativeTimestamp } from '../utils/formatters';
import { History, Edit2, Trash2 } from 'lucide-react';

/**
 * HistoryList - Displays persistent lookup history with CRUD operations.
 * 
 * Features:
 * - Fetches history from GET /api/history
 * - Displays target, label, location, risk, and timestamp
 * - Inline label editing (PATCH /api/history/{id})
 * - Per-row delete (DELETE /api/history/{id})
 * - Share link copying
 * - Relative timestamps ("2 hours ago")
 */
const HistoryList = ({ onRefresh }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [onRefresh]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/history');
      setHistory(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lookup from history?')) {
      return;
    }

    try {
      await api.delete(`/api/history/${id}`);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete lookup');
    }
  };

  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditLabel(item.label || item.target);
  };

  const handleEditSave = async (id) => {
    if (editLabel.length > 100) {
      alert('Label must be 100 characters or less');
      return;
    }

    try {
      const res = await api.patch(`/api/history/${id}`, { label: editLabel });
      setHistory(prev =>
        prev.map(item => (item.id === id ? res.data : item))
      );
      setEditingId(null);
      setEditLabel('');
    } catch (err) {
      console.error('Failed to update label:', err);
      alert('Failed to update label');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditLabel('');
  };

  const getShareUrl = (uuid) => {
    return `${window.location.origin}/lookup/${uuid}`;
  };

  if (loading) {
    return (
      <div className="bg-surface p-6 rounded-md border hairline">
        <div className="flex items-center justify-center py-8">
          <span className="text-body">Loading history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface p-6 rounded-md border hairline">
        <div className="flex items-center justify-center py-8">
          <span className="text-risk-danger">{error}</span>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-surface p-6 rounded-md border hairline">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Lookup History</h3>
            <p className="text-xs text-body">Your saved lookups will appear here</p>
          </div>
        </div>
        <div className="text-center py-8 text-body">
          No history yet. Perform a lookup to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface p-6 rounded-md border hairline">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
          <History className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Lookup History</h3>
          <p className="text-xs text-body">{history.length} saved lookups</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b hairline">
              <th className="text-left py-3 px-4 text-sm font-semibold text-ink">
                Target / Label
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-ink">
                Location
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-ink">
                Risk
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-ink">
                Time
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-ink">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => {
              const geo = item.result || {};
              const displayLabel = item.label || item.target;
              const isEditing = editingId === item.id;

              return (
                <tr
                  key={item.id}
                  className="border-b hairline hover:bg-surface transition-colors"
                >
                  {/* Target / Label */}
                  <td className="py-4 px-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-canvas-soft border hairline rounded-md text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                          maxLength={100}
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditSave(item.id)}
                          className="px-3 py-1.5 bg-primary text-on-primary rounded-md text-sm hover:bg-primary/90 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="px-3 py-1.5 bg-surface text-ink rounded-md text-sm border hairline hover:bg-canvas-soft transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-white">{displayLabel}</div>
                        {item.label && (
                          <div className="text-xs text-body font-mono mt-1">
                            {item.target}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-4 px-4">
                    <div className="text-sm text-ink">
                      {geo.city && geo.countryCode ? (
                        <>{geo.city}, {geo.countryCode}</>
                      ) : (
                        <span className="text-mute">Unknown</span>
                      )}
                    </div>
                  </td>

                  {/* Risk */}
                  <td className="py-4 px-4">
                    <RiskBadge level={item.risk_level} />
                  </td>

                  {/* Time */}
                  <td className="py-4 px-4">
                    <div className="text-sm text-body">
                      {relativeTimestamp(item.created_at)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {!isEditing && (
                        <>
                          <button
                            onClick={() => handleEditStart(item)}
                            className="p-2 text-body hover:text-primary transition-colors"
                            title="Edit label"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <CopyButton
                            text={getShareUrl(item.uuid)}
                            label="Copy link"
                            compact
                          />
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-body hover:text-risk-danger transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryList;
