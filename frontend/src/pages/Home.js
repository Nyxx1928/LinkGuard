import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ResultCard from '../components/ResultCard';
import HistoryList from '../components/HistoryList';
import BulkLookup from '../components/BulkLookup';
import LoadingState from '../components/LoadingState';
import TransparencyPanel from '../components/TransparencyPanel';
import InsightsPanel from '../components/InsightsPanel';
import LazyRiskChart from '../components/LazyRiskChart';
import { PageContainer, Footer } from '../components/layout';
import MobileNav from '../components/layout/MobileNav';
import CardNav from '../components/ui/CardNav';
import { Button, Input, Card } from '../components/ui';
import { Search, List, Trash2, MapPin, History } from 'lucide-react';

export default function Home({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [userGeo, setUserGeo] = useState(null);
  const [searchTarget, setSearchTarget] = useState('');
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [lookupMode, setLookupMode] = useState('single'); // 'single' or 'bulk'

  // Load user's current location on mount
  useEffect(() => {
    fetchUserGeo();
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
        setHistory(prev => [...new Set([target, ...prev])].slice(0, 10));
        setError('');
        setSearchTarget(target);
        // Refresh the HistoryList component
        setHistoryRefreshKey(prev => prev + 1);
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
      bgColor: '#1B1722',
      textColor: '#fff',
      links: [
        { label: 'Analyze Links', href: '/analyze', ariaLabel: 'Run a full risk scan instantly' },
        { label: 'Lookup History', href: '/history', ariaLabel: 'Review and label saved results' },
        { label: 'Dashboard', href: '/home', ariaLabel: 'Your security overview at a glance' },
      ],
    },
    {
      label: 'Public Tools',
      bgColor: '#2F293A',
      textColor: '#fff',
      links: [
        { label: 'Public Lookup', href: '/', ariaLabel: 'Shareable checks for any target' },
        { label: 'About LinkGuard', href: '/about', ariaLabel: 'Methodology and data sources' },
      ],
    },
    {
      label: 'Resources',
      bgColor: '#2F293A',
      textColor: '#fff',
      links: [
        { label: 'About', href: '/about', ariaLabel: 'How LinkGuard evaluates risk' },
        { label: 'Component Showcase', href: '/showcase', ariaLabel: 'Design system and UI patterns' },
      ],
    },
  ];

  return (
    <PageContainer>
      <CardNav
        logoAlt="LinkGuard"
        items={cardNavItems}
        baseColor="#fff"
        menuColor="#000"
        buttonBgColor="#ef4444"
        buttonTextColor="#fff"
        ctaLabel="Logout"
        onCtaClick={handleLogout}
      />
      <div className="sm:hidden fixed top-4 right-4 z-50">
        <MobileNav isAuthenticated={true} onLogout={handleLogout} />
      </div>

      <div className="mb-8 fade-in">
        <InsightsPanel
          title="Recent Analysis Summary"
          description="Snapshot of recent activity across your workspace."
          metrics={[
            { id: 'total', label: 'Total Lookups', value: history.length || 0 },
            { id: 'latest', label: 'Latest Target', value: currentResult?.target || 'N/A' },
            { id: 'risk', label: 'Latest Risk', value: currentResult?.risk_level || 'Unknown' },
          ]}
          chart={
            <LazyRiskChart
              data={[
                { name: 'Safe', value: 2, fill: '#10b981' },
                { name: 'Caution', value: 1, fill: '#f59e0b' },
                { name: 'Danger', value: 1, fill: '#ef4444' },
                { name: 'Unknown', value: 0, fill: '#94a3b8' },
              ]}
            />
          }
        />
      </div>

      {/* Mode Toggle */}
      <Card variant="glass" padding="sm" className="inline-flex mb-8">
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
          <Card variant="glass" padding="md" className="mb-8">
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
                    variant="secondary"
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
            <Card variant="glass" padding="lg" className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                    <History className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">Search History</h3>
                    <p className="text-xs text-neutral-600">{history.length} recent searches</p>
                  </div>
                </div>
                {selectedHistory.length > 0 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeleteSelected}
                    icon={<Trash2 className="h-4 w-4" />}
                    iconPosition="left"
                  >
                    Delete Selected ({selectedHistory.length})
                  </Button>
                )}
              </div>
              <div className="mb-4 p-3 bg-neutral-100 rounded-xl border border-neutral-200">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedHistory.length === history.length && history.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-brand-500 border-neutral-400 rounded focus:ring-brand-500"
                  />
                  <span className="ml-3 text-sm font-medium text-neutral-700">Select All</span>
                </label>
              </div>
              <div className="space-y-2">
                {history.map((target, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 hover:border-brand-500/50 transition-all duration-200 flex items-center gap-3 group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedHistory.includes(target)}
                      onChange={() => handleCheckboxChange(target)}
                      className="w-4 h-4 text-brand-500 border-neutral-400 rounded focus:ring-brand-500"
                    />
                    <span className="flex-1 font-mono font-semibold text-neutral-900">{target}</span>
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
            </Card>
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

      <Footer />
    </PageContainer>
  );
}
