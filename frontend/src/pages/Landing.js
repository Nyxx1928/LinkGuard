import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../components/layout/PageHeader';
import PageContainer from '../components/layout/PageContainer';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import ResultCard from '../components/ResultCard';
import TransparencyPanel from '../components/TransparencyPanel';
import EducationalTooltip from '../components/EducationalTooltip';
import LoadingState from '../components/LoadingState';
import { Search, Zap, Shield, MapPin, Save, Trash2, AlertTriangle } from 'lucide-react';

/**
 * Landing - Public landing page for unauthenticated users.
 * 
 * Features:
 * - Professional hero section with branding
 * - Shows visitor's IP and location automatically
 * - Allows public lookups without authentication
 * - Educational tooltips for key features
 * - Transparency panel explaining validation methodology
 * - Uses new design system components
 * - Prompts users to log in or register to save history
 * 
 * Requirements: 1.1, 1.4, 2.1, 4.1, 10.1, 10.3
 */
const Landing = () => {
  const navigate = useNavigate();
  const [visitorGeo, setVisitorGeo] = useState(null);
  const [searchTarget, setSearchTarget] = useState('');
  const [currentResult, setCurrentResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch visitor's IP and geo data on mount
  useEffect(() => {
    fetchVisitorGeo();
  }, []);

  const fetchVisitorGeo = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const res = await axios.get(`${apiUrl}/api/geo/public`);
      setVisitorGeo(res.data);
    } catch (err) {
      console.error('Failed to fetch visitor geo:', err);
    }
  };

  const handleSearch = async () => {
    const target = searchTarget.trim();
    if (!target) {
      setError('Please enter an IP address, domain, URL, or email');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const res = await axios.post(`${apiUrl}/api/analyze/public`, { target });

      if (res.data) {
        setCurrentResult(res.data);
        setError('');
      } else {
        setError('Analysis data not available for this target');
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setError(err.response.data?.message || 'Invalid target format');
      } else if (err.response?.status === 404) {
        setError('Unable to resolve target. Please check the address and try again.');
      } else if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please try again in a minute.');
      } else {
        setError('Failed to analyze target. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsMyIP = () => {
    if (visitorGeo?.query) {
      setSearchTarget(visitorGeo.query);
      setError('');
    }
  };

  const clearSearch = () => {
    setSearchTarget('');
    setCurrentResult(null);
    setError('');
  };

  return (
    <PageContainer className="text-gray-100">
      {/* Header */}
      <PageHeader showAuth={true} isAuthenticated={false} />

      {/* Hero Section - Mobile-first single column */}
      <div className="text-center mb-8 sm:mb-10 lg:mb-12 py-6 sm:py-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-600 bg-clip-text text-transparent px-4">
          Validate Links Before You Click
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
          Protect yourself from malicious links, phishing attempts, and suspicious domains.
          Get instant security analysis with geographic intelligence and risk assessment.
        </p>
        {/* Mobile: Single column stack, Tablet: 2 columns, Desktop: 3 columns using CSS Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4 text-sm sm:text-base text-gray-400">
          <div className="flex items-center justify-center sm:justify-start gap-2 min-h-[44px]">
            <EducationalTooltip
              content="We analyze IP addresses, domains, URLs, and email addresses to detect potential security threats based on network characteristics and geographic data."
              position="bottom"
            >
              <span className="flex items-center gap-2 cursor-help hover:text-cyan-400 transition-colors">
                <Search className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                <span>Multi-Source Analysis</span>
              </span>
            </EducationalTooltip>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 min-h-[44px]">
            <EducationalTooltip
              content="Get results in seconds with real-time DNS resolution, geolocation lookup, and network intelligence analysis."
              position="bottom"
            >
              <span className="flex items-center gap-2 cursor-help hover:text-cyan-400 transition-colors">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                <span>Instant Results</span>
              </span>
            </EducationalTooltip>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 min-h-[44px] sm:col-span-2 lg:col-span-1">
            <EducationalTooltip
              content="We use standard DNS queries and reputable geolocation databases. No data is stored without your permission."
              position="bottom"
            >
              <span className="flex items-center gap-2 cursor-help hover:text-cyan-400 transition-colors">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                <span>Privacy Focused</span>
              </span>
            </EducationalTooltip>
          </div>
        </div>
      </div>

      {/* Visitor IP Display - Mobile-first responsive grid */}
      {visitorGeo && (
        <div className="bg-gray-900/60 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <MapPin className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-cyan-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">Your Current Location</h3>
              <p className="text-xs sm:text-sm text-gray-400">Automatically detected from your IP address</p>
            </div>
          </div>
          {/* Mobile: Single column, Tablet: 2 columns, Desktop: 3 columns using CSS Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg">
              <span className="text-gray-400 text-xs uppercase tracking-wide">IP Address</span>
              <p className="font-mono font-semibold text-white text-base sm:text-lg mt-1 break-all">{visitorGeo.query}</p>
            </div>
            {visitorGeo.city && (
              <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Location</span>
                <p className="font-semibold text-white text-base sm:text-lg mt-1">
                  {visitorGeo.city}, {visitorGeo.country}
                </p>
              </div>
            )}
            {visitorGeo.isp && (
              <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
                <span className="text-gray-400 text-xs uppercase tracking-wide">ISP</span>
                <p className="font-semibold text-white text-base sm:text-lg mt-1">{visitorGeo.isp}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State - Mobile-first responsive */}
      {loading && (
        <div className="mb-6 sm:mb-8 bg-gray-900/60 backdrop-blur-md p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-cyan-500/20">
          <LoadingState
            message="Analyzing security indicators..."
            steps={[
              'Resolving domain',
              'Checking geolocation',
              'Analyzing network',
              'Calculating risk score'
            ]}
            currentStep={1}
            size="lg"
          />
        </div>
      )}

      {/* Current Result Display - Mobile-first responsive */}
      {currentResult && !loading && (
        <div className="mb-6 sm:mb-8">
          <ResultCard result={currentResult} showShareLink={false} />
        </div>
      )}

      {/* Search Controls - Mobile-first responsive layout */}
      <div className="bg-gray-900/60 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Search className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400 flex-shrink-0" />
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">Analyze a Target</h3>
        </div>
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Mobile: Stack vertically, Desktop: Horizontal layout */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter IP, domain, URL, or email (e.g., 8.8.8.8, example.com)"
                value={searchTarget}
                onChange={(e) => {
                  setSearchTarget(e.target.value);
                  if (error) setError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading) handleSearch();
                }}
                disabled={loading}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-800/80 border-2 border-gray-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium placeholder-gray-500 text-sm sm:text-base min-h-[44px]"
              />
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSearch}
              disabled={loading}
              loading={loading}
              icon={!loading && <Search className="h-4 w-4" />}
              iconPosition="left"
              className="shadow-lg hover:shadow-cyan-500/50 min-w-full lg:min-w-[140px] min-h-[44px]"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>

          {/* Action buttons - Mobile: Stack, Tablet+: Horizontal */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={handleWhatsMyIP}
              disabled={loading || !visitorGeo}
              icon={<MapPin className="h-4 w-4" />}
              iconPosition="left"
              className="min-h-[44px] w-full sm:w-auto"
            >
              What's my IP?
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={clearSearch}
              disabled={loading}
              icon={<Trash2 className="h-4 w-4" />}
              iconPosition="left"
              className="min-h-[44px] w-full sm:w-auto"
            >
              Clear
            </Button>
          </div>

          {error && (
            <div className="mt-2 p-3 sm:p-4 bg-red-900/50 border-2 border-red-700/50 rounded-lg sm:rounded-xl">
              <p className="text-red-300 text-sm flex items-start sm:items-center gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="font-medium">{error}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transparency Panel - Mobile-first responsive */}
      <div className="mb-6 sm:mb-8">
        <TransparencyPanel />
      </div>

      {/* Call to Action - Mobile-first responsive layout */}
      <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 backdrop-blur-md p-6 sm:p-8 lg:p-10 rounded-xl sm:rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
        <div className="text-center">
          <div className="inline-block p-3 bg-cyan-500/20 rounded-full mb-4">
            <Save className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-400" />
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3">
            Want to Save Your Lookups?
          </h2>
          <p className="text-gray-300 text-sm sm:text-base lg:text-lg mb-6 max-w-2xl mx-auto px-4">
            Create a free account to save your lookup history, add custom labels,
            and share results with your team. Track patterns and build your security intelligence.
          </p>
          {/* Mobile: Stack vertically, Tablet+: Horizontal */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
              className="shadow-lg hover:shadow-cyan-500/50 min-h-[44px] w-full sm:w-auto"
            >
              Create Free Account
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/login')}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Log In
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </PageContainer>
  );
};

export default Landing;
