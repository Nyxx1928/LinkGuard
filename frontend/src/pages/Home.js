import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ResultCard from '../components/ResultCard';
import HistoryList from '../components/HistoryList';
import BulkLookup from '../components/BulkLookup';
import LoadingState from '../components/LoadingState';
import TransparencyPanel from '../components/TransparencyPanel';
import LazyRiskChart from '../components/LazyRiskChart';
import TrendIndicator from '../components/TrendIndicator';
import { PageContainer } from '../components/layout';
import MobileNav from '../components/layout/MobileNav';
import CardNav from '../components/ui/CardNav';
import { Button, Input, Card } from '../components/ui';
import { Search, List, Trash2, MapPin, History, ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

export default function Home({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [userGeo, setUserGeo] = useState(null);
  const [searchTarget, setSearchTarget] = useState('');
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [resultHistory, setResultHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [lookupMode, setLookupMode] = useState('single'); // 'single' or 'bulk'

  // Load user's current location on mount
  useEffect(() => {
    fetchUserGeo();
  }, []);

  // Load persisted history from backend on mount for KPI cards
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchUserGeo = async () => {
    try {
      const res = await api.get('/api/geo');
      setUserGeo(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load your location');
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/history');
      const items = res.data?.data;
      if (Array.isArray(items)) {
        const entries = items.map(item => ({
          target: item.target,
          risk_level: item.risk_level || 'UNKNOWN',
        }));
        setResultHistory(entries);
      }
    } catch (err) {
      // Silent fail — KPI cards will just show empty
    }
  };

  const handleSearch = async (targetToSearch = null) => {
    if (targetToSearch !== null && typeof targetToSearch === 'object' && targetToSearch.target) {
      console.warn('handleSearch was called with React event object - ignoring');
      return;
    }
    const target = String(targetToSearch || searchTarget || '').trim();
    if (!target) { setError('Please enter an IP address, domain, URL, or email'); return; }
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/analyze', { target });
      if (res.data) {
        setCurrentResult(res.data);
        setHistory(prev => [target, ...prev.filter(t => t !== target)].slice(0, 10));
        setError('');
        setSearchTarget(target);
        setHistoryRefreshKey(prev => prev + 1);
        fetchHistory(); // Refresh KPI cards from backend
      } else {
        setError('Analysis data not available for this target');
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setError(err.response.data?.message || 'Invalid target format');
      } else if (err.response?.status === 404) {
        setError('Unable to resolve target. Please check the address and try again.');
      } else {
        setError('Failed to analyze target. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, UNKNOWN: 0 };
    resultHistory.forEach(r => { counts[r.risk_level]++; });
    return [
      { name: 'Safe', value: counts.LOW, fill: '#10b981' },
      { name: 'Caution', value: counts.MEDIUM, fill: '#f59e0b' },
      { name: 'Danger', value: counts.HIGH, fill: '#ef4444' },
      { name: 'Unknown', value: counts.UNKNOWN, fill: '#8b949e' },
    ];
  }, [resultHistory]);

  const riskSummary = useMemo(() => {
    const total = resultHistory.length;
    if (!total) return null;
    const high = resultHistory.filter(r => r.risk_level === 'HIGH').length;
    const low = resultHistory.filter(r => r.risk_level === 'LOW').length;
    const med = resultHistory.filter(r => r.risk_level === 'MEDIUM').length;
    return {
      total,
      high,
      med,
      low,
      cleanRate: total ? Math.round((low / total) * 100) : 0,
      riskRate: total ? Math.round(((high + med) / total) * 100) : 0,
    };
  }, [resultHistory]);

  const clearSearch = () => {
    setSearchTarget('');
    setCurrentResult(null);
    setError('');
  };

  const handleHistoryClick = (target) => {
    handleSearch(target);
  };

  const handleCheckboxChange = (target) => {
    setSelectedHistory(prev =>
      prev.includes(target) ? prev.filter(item => item !== target) : [...prev, target]
    );
  };

  const handleDeleteSelected = () => {
    setHistory(prev => prev.filter(target => !selectedHistory.includes(target)));
    setResultHistory(prev => prev.filter(r => !selectedHistory.includes(r.target)));
    setSelectedHistory([]);
  };

  const handleSelectAll = () => {
    if (selectedHistory.length === history.length) {
      setSelectedHistory([]);
    } else {
      setSelectedHistory([...history]);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/logout');
    } finally {
      localStorage.removeItem('auth_token');
      setIsLoggedIn(false);
      navigate('/login');
    }
  };

  const cardNavItems = [
    {
      label: 'Platform',
      links: [
        { label: 'Analyze Links', href: '/analyze', ariaLabel: 'Run a full risk scan instantly' },
        { label: 'Lookup History', href: '/history', ariaLabel: 'Review and label saved results' },
        { label: 'Dashboard', href: '/home', ariaLabel: 'Your security overview at a glance' },
      ],
    },
    {
      label: 'Public Tools',

      links: [
        { label: 'Public Lookup', href: '/', ariaLabel: 'Shareable checks for any target' },
        { label: 'About LinkGuard', href: '/about', ariaLabel: 'Methodology and data sources' },
      ],
    },
    {
      label: 'Resources',

      links: [
        { label: 'About', href: '/about', ariaLabel: 'How LinkGuard evaluates risk' },
        { label: 'Component Showcase', href: '/showcase', ariaLabel: 'Design system and UI patterns' },
      ],
    },
  ];

  return (
    <PageContainer
      nav={
        <div className="hidden sm:block">
          <CardNav
            logoAlt="LinkGuard"
            items={cardNavItems}
            logoHref="/home"
            ctaLabel="Logout"
            onCtaClick={handleLogout}
          />
        </div>
      }
    >
      <div className="sm:hidden fixed top-4 right-4 z-50">
        <MobileNav isAuthenticated={true} onLogout={handleLogout} />
      </div>

      <section className="mb-8 fade-in">
        <div className="rounded-md border border-hairline bg-canvas p-6 sm:p-8">
          <div className="space-y-2 mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-mute">Dashboard</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white">
              Recent Analysis
              <span className="block text-primary">
                Summary
              </span>
            </h2>
            <p className="text-sm sm:text-base text-gray-300">
              Snapshot of recent activity across your workspace.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {[
              { id: 'total', label: 'Total Lookups', value: resultHistory.length, icon: History },
              { id: 'clean', label: 'Clean Rate', value: riskSummary ? `${riskSummary.cleanRate}%` : '--', icon: ShieldCheck, trend: riskSummary ? { value: `${riskSummary.cleanRate}%`, direction: riskSummary.cleanRate >= 70 ? 'up' : 'down' } : null },
              { id: 'risk', label: 'High Risk', value: riskSummary ? riskSummary.high : '--', icon: AlertTriangle },
              { id: 'latest', label: 'Latest Risk', value: currentResult?.risk_level || 'Unknown', icon: AlertCircle },
            ].map((metric) => (
              <div key={metric.id} className="rounded-md border border-hairline bg-canvas p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-widest text-mute">{metric.label}</p>
                  <metric.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-semibold text-white">{metric.value}</p>
                {metric.trend && (
                  <TrendIndicator value={metric.trend.value} direction={metric.trend.direction} label="of lookups" />
                )}
              </div>
            ))}
          </div>
          <LazyRiskChart data={chartData} />
        </div>
      </section>

      {/* Mode Toggle */}
      <Card variant="default" className="inline-flex p-sm mb-8">
        <Button
          variant={lookupMode === 'single' ? 'primary' : 'ghost'}
          size="md"
          onClick={() => setLookupMode('single')}
          icon={<Search className="h-4 w-4" />}
          iconPosition="left"
        >
          Single Lookup
        </Button>
        <Button
          variant={lookupMode === 'bulk' ? 'primary' : 'ghost'}
          size="md"
          onClick={() => setLookupMode('bulk')}
          icon={<List className="h-4 w-4" />}
          iconPosition="left"
        >
          Bulk Lookup
        </Button>
      </Card>

      {/* Single Lookup Mode */}
      {lookupMode === 'single' && (
        <>
          {/* Search Controls */}
          <Card variant="default" className="mb-8">
            {loading ? (
              <LoadingState
                message="Analyzing target..."
                size="md"
                steps={[
                  'Resolving domain',
                  'Checking geolocation',
                  'Analyzing network',
                  'Calculating risk score'
                ]}
                currentStep={1}
              />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter IP, domain, URL, or email (e.g. 8.8.8.8, example.com)"
                      value={searchTarget}
                      onChange={(e) => {
                        setSearchTarget(e.target.value);
                        if (error) setError('');
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !loading) handleSearch();
                      }}
                      disabled={loading}
                      error={error}
                      clearable
                      onClear={() => setSearchTarget('')}
                      icon={<Search className="h-4 w-4" />}
                      iconPosition="left"
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleSearch()}
                    disabled={loading}
                    loading={loading}
                    icon={!loading && <Search className="h-4 w-4" />}
                    iconPosition="left"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={clearSearch}
                    disabled={loading}
                    icon={<Trash2 className="h-4 w-4" />}
                    iconPosition="left"
                  >
                    Clear
                  </Button>
                </div>

                {/* What's my IP button */}
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (userGeo?.query) {
                        setSearchTarget(userGeo.query);
                        setError('');
                      }
                    }}
                    disabled={loading || !userGeo}
                    icon={<MapPin className="h-4 w-4" />}
                    iconPosition="left"
                  >
                    What's my IP?
                  </Button>
                </div>
              </>
            )}
          </Card>

          {/* Current Result Display */}
          {currentResult && !loading && (
            <div className="mb-8">
              <ResultCard result={currentResult} />
            </div>
          )}

          {/* Search History */}
          {history.length > 0 && (
            <div className="mb-8 bg-canvas border border-hairline rounded-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                    <History className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Search History</h3>
                    <p className="text-xs text-gray-400">{history.length} recent searches</p>
                  </div>
                </div>
                {selectedHistory.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteSelected}
                    icon={<Trash2 className="h-4 w-4" />}
                    iconPosition="left"
                  >
                    Delete Selected ({selectedHistory.length})
                  </Button>
                )}
              </div>
              <div className="mb-4 p-3 bg-canvas-soft rounded-md border border-hairline">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedHistory.length === history.length && history.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary border-hairline rounded focus:ring-primary bg-canvas"
                  />
                  <span className="ml-3 text-sm font-medium text-body">Select All</span>
                </label>
              </div>
              <div className="space-y-2">
                {history.map((target, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-canvas hover:bg-canvas-soft rounded-md border border-hairline hover:border-primary transition-all duration-200 flex items-center gap-3 group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedHistory.includes(target)}
                      onChange={() => handleCheckboxChange(target)}
                      className="w-4 h-4 text-primary border-hairline rounded focus:ring-primary bg-canvas"
                    />
                    <span className="flex-1 font-mono font-semibold text-white">{target}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleHistoryClick(target)}
                    >
                      Reload
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Persistent Lookup History */}
          <div className="mb-8">
            <HistoryList onRefresh={historyRefreshKey} />
          </div>

          {/* Transparency Panel */}
          <TransparencyPanel className="mb-8" />
        </>
      )}

      {/* Bulk Lookup Mode */}
      {lookupMode === 'bulk' && (
        <BulkLookup />
      )}

    </PageContainer>
  );
}
