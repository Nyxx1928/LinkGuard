import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CardNav from '../components/ui/CardNav';
import MobileNav from '../components/layout/MobileNav';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import ResultCard from '../components/ResultCard';
import LoadingState from '../components/LoadingState';
import { Search, Shield, MapPin, Save, Trash2, AlertTriangle, ChevronDown } from 'lucide-react';

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
    <PageContainer className="text-gray-100">
      <div className="relative overflow-hidden">
        <div className="relative z-10">
          <CardNav
            logoAlt="LinkGuard"
            items={cardNavItems}
            baseColor="transparent"
            menuColor="#fff"
            buttonBgColor="#111"
            buttonTextColor="#fff"
            ctaLabel="Log In"
            onCtaClick={() => navigate('/login')}
          />
          <div className="sm:hidden fixed top-4 right-4 z-50">
            <MobileNav isAuthenticated={false} />
          </div>

          <section className="pt-10 sm:pt-14 lg:pt-18 pb-10 sm:pb-12 lg:pb-16">
            <div className="text-center px-4">
              <p className="text-xs uppercase tracking-[0.35em] text-gray-400">LinkGuard security intelligence</p>
              <h1
                className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold text-white"
                style={{ fontFamily: '"Space Grotesk", var(--font-sans)' }}
              >
                Validate links you can
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-slate-200">
                  actually trust.
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
                LinkGuard combines transparent signals with risk scoring so you can validate any IP, domain, URL, or email before it reaches your team.
              </p>
            </div>

            <div className="mt-8 sm:mt-10 max-w-4xl mx-auto px-4">
              <div className="bg-gray-900/70 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search IP, domain, URL, or email"
                      value={searchTarget}
                      onChange={(e) => {
                        setSearchTarget(e.target.value);
                        if (error) setError('');
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !loading) handleSearch();
                      }}
                      disabled={loading}
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-950/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium placeholder-gray-500 text-sm sm:text-base"
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
                    className="min-h-[44px] lg:min-w-[140px]"
                  >
                    {loading ? 'Analyzing...' : 'Search'}
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400">
                  {['Phishing', 'Malware', 'Brand Abuse', 'OSINT', 'Network Intel'].map((label) => (
                    <span
                      key={label}
                      className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-300"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleWhatsMyIP}
                  disabled={loading || !visitorGeo}
                  icon={<MapPin className="h-4 w-4" />}
                  iconPosition="left"
                  className="min-h-[44px] w-full sm:w-auto"
                >
                  What is my IP?
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
                <div className="mt-4 p-3 sm:p-4 bg-red-900/50 border border-red-700/50 rounded-xl">
                  <p className="text-red-300 text-sm flex items-start sm:items-center gap-2">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="font-medium">{error}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-10 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
              {[
                { label: 'Signals tracked', value: '106+' },
                { label: 'Data sources', value: '12' },
                { label: 'Risk categories', value: '11' },
                { label: 'Score dimensions', value: '5' }
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/5 bg-gray-900/50 p-4 text-center">
                  <p className="text-2xl sm:text-3xl font-semibold text-white">{stat.value}</p>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 sm:mt-12 px-4">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-gray-800/60 p-6 sm:p-8">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-gray-400">
                  <span>LinkGuard score</span>
                  <span>LG-2049</span>
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                  <div>
                    <p className="text-5xl sm:text-6xl font-semibold text-white">8.7</p>
                    <p className="text-sm text-gray-400 mt-2">Trusted</p>
                    <p className="text-sm text-gray-300 mt-4 max-w-sm">
                      Risk confidence based on scored dimensions and transparent evidence.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Infrastructure', value: '92%', color: 'from-slate-200 to-slate-500' },
                      { label: 'Reputation', value: '84%', color: 'from-cyan-300 to-blue-500' },
                      { label: 'Velocity', value: '88%', color: 'from-pink-400 to-purple-500' },
                      { label: 'Content Risk', value: '79%', color: 'from-lime-300 to-emerald-500' }
                    ].map((metric) => (
                      <div key={metric.label} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                        <div className="flex items-center justify-between text-sm text-gray-300">
                          <span>{metric.label}</span>
                          <span className="text-white font-semibold">{metric.value}</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-white/10">
                          <div className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`} style={{ width: metric.value }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {loading && (
          <div className="mb-8 bg-gray-900/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10">
            <LoadingState
              message="Analyzing security indicators..."
              steps={['Resolving domain', 'Checking geolocation', 'Analyzing network', 'Calculating risk score']}
              currentStep={1}
              size="lg"
            />
          </div>
        )}

        {currentResult && !loading && (
          <div className="mb-10">
            <ResultCard result={currentResult} showShareLink={false} />
          </div>
        )}

        {visitorGeo && (
          <div className="bg-gray-900/60 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-3xl border border-white/10 shadow-2xl shadow-cyan-500/5 mb-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <MapPin className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-300 flex-shrink-0" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white" style={{ fontFamily: '"Space Grotesk", var(--font-sans)' }}>
                  Your current location
                </h3>
                <p className="text-xs sm:text-sm text-gray-400">Automatically detected from your IP address</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5">
                <span className="text-gray-400 text-xs uppercase tracking-wide">IP Address</span>
                <p className="font-mono font-semibold text-white text-base sm:text-lg mt-1 break-all">{visitorGeo.query}</p>
              </div>
              {visitorGeo.city && (
                <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5">
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Location</span>
                  <p className="font-semibold text-white text-base sm:text-lg mt-1">
                    {visitorGeo.city}, {visitorGeo.country}
                  </p>
                </div>
              )}
              {visitorGeo.isp && (
                <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5 sm:col-span-2 lg:col-span-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wide">ISP</span>
                  <p className="font-semibold text-white text-base sm:text-lg mt-1">{visitorGeo.isp}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <section className="relative z-10 max-w-6xl mx-auto px-4 mb-12">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/70 via-gray-900/60 to-gray-800/60 p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Latest detections</p>
              <h2
                className="mt-2 text-3xl sm:text-4xl font-semibold text-white"
                style={{ fontFamily: '"Space Grotesk", var(--font-sans)' }}
              >
                Fresh signals, reviewed
                <span className="block">with context you can act on.</span>
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-300">
              {['Newest', 'High Risk', 'Resolved'].map((tab) => (
                <span key={tab} className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
                  {tab}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Typosquat Spike', desc: 'New lookalike domains detected targeting login portals.', tag: 'Brand Abuse' },
              { title: 'Phishing Kit', desc: 'Credential harvester observed on freshly registered hosts.', tag: 'Phishing' },
              { title: 'Malware Host', desc: 'Infrastructure linked to recent payload distribution.', tag: 'Malware' },
              { title: 'Suspicious ASN', desc: 'Unusual routing activity tied to fast-flux patterns.', tag: 'Network' },
              { title: 'Email Spoofing', desc: 'Sender mismatch flagged across multiple domains.', tag: 'Email' },
              { title: 'New Sinkhole', desc: 'Resolved infrastructure and verified takedown status.', tag: 'Resolved' }
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-gray-950/50 p-5">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-cyan-300">
                    <Shield className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-gray-400 border border-white/10 rounded-full px-2 py-1">
                    {card.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-4 mb-12">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-gray-900/60 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">LinkGuard scoring model</p>
            <h2
              className="mt-2 text-3xl sm:text-4xl font-semibold text-white"
              style={{ fontFamily: '"Space Grotesk", var(--font-sans)' }}
            >
              A clearer way to compare risk.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-300">
              Each score converts fuzzy signals into structured evidence: repeatable checks, weighted dimensions, and verifiable outcomes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { value: '40%', label: 'Infrastructure', desc: 'Hosting, ASN, and network behavior risk.' },
              { value: '20%', label: 'Reputation', desc: 'Historical abuse, trust lists, and reports.' },
              { value: '20%', label: 'Content Risk', desc: 'URL and payload inspection outcomes.' },
              { value: '10%', label: 'First-Seen', desc: 'Newly observed assets and volatility.' },
              { value: '10%', label: 'Velocity', desc: 'Rapid changes across domains and IPs.' }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-gray-950/50 p-4">
                <p className="text-2xl font-semibold text-white">{item.value}</p>
                <p className="text-sm font-semibold text-gray-200 mt-2">{item.label}</p>
                <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-4 mb-10">
        <div className="rounded-3xl border border-white/10 bg-gray-900/60 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Frequently asked questions</p>
              <h3
                className="mt-2 text-2xl sm:text-3xl font-semibold text-white"
                style={{ fontFamily: '"Space Grotesk", var(--font-sans)' }}
              >
                How we analyze links
              </h3>
            </div>
          </div>

          <div className="mt-6 divide-y divide-white/10">
            <details className="group py-4">
              <summary className="flex items-center justify-between text-white text-base sm:text-lg font-semibold cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span>How does LinkGuard analyze links?</span>
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-gray-300 text-sm sm:text-base">
                We resolve the target, enrich it with geo and network intelligence, then evaluate risk signals across reputation, infrastructure, and content indicators.
              </p>
            </details>

            <details className="group py-4">
              <summary className="flex items-center justify-between text-white text-base sm:text-lg font-semibold cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span>What signals affect the LinkGuard score?</span>
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-gray-300 text-sm sm:text-base">
                We combine infrastructure, reputation, content risk, first-seen activity, and velocity to produce a single confidence score.
              </p>
            </details>

            <details className="group py-4">
              <summary className="flex items-center justify-between text-white text-base sm:text-lg font-semibold cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span>What can I check with LinkGuard?</span>
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-gray-300 text-sm sm:text-base">
                You can validate IP addresses, domains, URLs, and email addresses from a single search bar.
              </p>
            </details>

            <details className="group py-4">
              <summary className="flex items-center justify-between text-white text-base sm:text-lg font-semibold cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span>How fast are results?</span>
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-gray-300 text-sm sm:text-base">
                Most lookups complete in seconds, depending on DNS resolution and upstream data sources.
              </p>
            </details>

            <details className="group py-4">
              <summary className="flex items-center justify-between text-white text-base sm:text-lg font-semibold cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span>Can I save or share results?</span>
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-gray-300 text-sm sm:text-base">
                Create a free account to save lookup history, add labels, and share reports with your team.
              </p>
            </details>
          </div>
        </div>
      </section>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-gray-900/70 border border-white/10 backdrop-blur p-6 sm:p-8 lg:p-10 rounded-3xl">
          <div className="text-center">
            <div className="inline-flex p-3 bg-white/10 rounded-full mb-4">
              <Save className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
            </div>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-3"
              style={{ fontFamily: '"Space Grotesk", var(--font-sans)' }}
            >
              Want to save your lookups?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg mb-6 max-w-2xl mx-auto px-4">
              Create a free account to save lookup history, add labels, and share results with your team.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                className="shadow-lg min-h-[44px] w-full sm:w-auto"
              >
                Create free account
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/login')}
                className="min-h-[44px] w-full sm:w-auto"
              >
                Log in
              </Button>
            </div>
          </div>
        </div>
      </div>

    </PageContainer>
  );
};

export default Landing;
