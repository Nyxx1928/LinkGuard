import React, { useState } from 'react';
import api from '../api';
import RiskBadge from './RiskBadge';
import { List, Search, Download, Trash2, BarChart3, Check, X, Loader2 } from 'lucide-react';

/**
 * BulkLookup - Component for analyzing multiple targets at once.
 * 
 * Features:
 * - Textarea for newline-separated targets
 * - Concurrent request processing (max 10 simultaneous)
 * - Results table with all key information
 * - CSV export functionality
 * - Error handling for individual targets
 */
const BulkLookup = () => {
  const [targetsText, setTargetsText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  /**
   * Process targets in chunks to limit concurrent requests.
   * Uses Promise.allSettled to handle both successes and failures.
   */
  const processBulkLookup = async () => {
    // Parse targets from textarea
    const targets = targetsText
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (targets.length === 0) {
      alert('Please enter at least one target');
      return;
    }

    setLoading(true);
    setResults([]);
    setProgress({ current: 0, total: targets.length });

    const allResults = [];
    const CHUNK_SIZE = 10; // Max 10 concurrent requests

    // Process targets in chunks
    for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
      const chunk = targets.slice(i, i + CHUNK_SIZE);
      
      // Create promises for this chunk
      const promises = chunk.map(async (target) => {
        try {
          const res = await api.post('/api/analyze', { target });
          return {
            success: true,
            target,
            data: res.data,
          };
        } catch (err) {
          return {
            success: false,
            target,
            error: err.response?.data?.message || 'Failed to analyze',
          };
        }
      });

      // Wait for all requests in this chunk to complete
      const chunkResults = await Promise.allSettled(promises);
      
      // Extract results from Promise.allSettled format
      chunkResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          allResults.push(result.value);
        } else {
          // This shouldn't happen since we catch errors in the promise
          allResults.push({
            success: false,
            target: 'unknown',
            error: 'Request failed',
          });
        }
      });

      // Update progress
      setProgress({ current: allResults.length, total: targets.length });
    }

    setResults(allResults);
    setLoading(false);
  };

  /**
   * Export results to CSV format.
   */
  const exportToCSV = () => {
    if (results.length === 0) {
      alert('No results to export');
      return;
    }

    // CSV header
    const headers = ['Target', 'Status', 'Resolved IP', 'Country', 'City', 'ISP', 'Risk Level', 'Error'];
    
    // CSV rows
    const rows = results.map((result) => {
      if (result.success) {
        const { data } = result;
        return [
          result.target,
          'Success',
          data.resolved_ip || '',
          data.geo?.country || '',
          data.geo?.city || '',
          data.geo?.isp || '',
          data.risk_level || '',
          '',
        ];
      } else {
        return [
          result.target,
          'Failed',
          '',
          '',
          '',
          '',
          '',
          result.error || 'Unknown error',
        ];
      }
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `linkguard-bulk-results-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearResults = () => {
    setResults([]);
    setTargetsText('');
    setProgress({ current: 0, total: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-surface p-6 rounded-md border hairline">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
            <List className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Bulk Lookup</h3>
            <p className="text-sm text-body">Analyze multiple targets at once (one per line)</p>
          </div>
        </div>

        <textarea
          value={targetsText}
          onChange={(e) => setTargetsText(e.target.value)}
          placeholder="Enter targets (one per line):&#10;8.8.8.8&#10;google.com&#10;https://example.com&#10;user@example.com"
          disabled={loading}
          className="w-full h-48 px-4 py-3 bg-canvas-soft border hairline rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-sm placeholder-body resize-none"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={processBulkLookup}
            disabled={loading || !targetsText.trim()}
            className="px-8 py-3 bg-primary text-on-primary font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing... ({progress.current}/{progress.total})</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Analyze All</span>
              </>
            )}
          </button>

          {results.length > 0 && (
            <>
              <button
                onClick={exportToCSV}
                disabled={loading}
                className="px-6 py-3 bg-primary/10 text-primary font-semibold rounded-md hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={clearResults}
                disabled={loading}
                className="px-6 py-3 bg-canvas text-ink font-semibold rounded-md border hairline hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-surface p-6 rounded-md border hairline">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Results</h3>
                <p className="text-sm text-body">
                  {results.filter(r => r.success).length} successful, {results.filter(r => !r.success).length} failed
                </p>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b hairline">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Target</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Resolved IP</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-ink">ISP</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Risk</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <tr
                    key={idx}
                    className={`border-b hairline ${
                      result.success ? 'hover:bg-surface' : 'bg-risk-danger/10'
                    } transition-colors`}
                  >
                    {/* Target */}
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-white">{result.target}</span>
                    </td>

                    {result.success ? (
                      <>
                        {/* Resolved IP */}
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm text-ink">
                            {result.data.resolved_ip}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-4">
                          <div className="text-sm text-ink">
                            {result.data.geo?.city && result.data.geo?.countryCode ? (
                              <>
                                  {result.data.geo.city}, {result.data.geo.countryCode}
                              </>
                            ) : (
                              <span className="text-mute">Unknown</span>
                            )}
                          </div>
                        </td>

                        {/* ISP */}
                        <td className="py-4 px-4">
                          <span className="text-sm text-ink">
                            {result.data.geo?.isp || 'Unknown'}
                          </span>
                        </td>

                        {/* Risk */}
                        <td className="py-4 px-4">
                          <RiskBadge level={result.data.risk_level} />
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className="text-risk-safe text-sm flex items-center gap-1">
                            <Check className="h-4 w-4" /> Success
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Error columns */}
                        <td className="py-4 px-4" colSpan="4">
                          <span className="text-risk-danger text-sm">{result.error}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-risk-danger text-sm flex items-center gap-1">
                            <X className="h-4 w-4" /> Failed
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkLookup;
