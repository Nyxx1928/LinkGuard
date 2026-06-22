import { useState } from 'react';
import api from '../api';
import { PageContainer } from '../components/layout';
import MobileNav from '../components/layout/MobileNav';
import CardNav from '../components/ui/CardNav';
import AnalysisForm from '../components/AnalysisForm';
import RiskDisplay from '../components/RiskDisplay';
import RiskFactors from '../components/RiskFactors';
import LazyGeoMap from '../components/LazyGeoMap';
import NetworkInfo from '../components/NetworkInfo';
import AnalysisResultSkeleton from '../components/AnalysisResultSkeleton';
import { Card } from '../components/ui';

const riskScoreMap = { LOW: 15, MEDIUM: 50, HIGH: 85, UNKNOWN: 50 };

const buildFactors = (geo, dnsRecords) => {
  const factors = [];
  if (geo?.proxy === true) {
    factors.push({
      severity: 'high',
      label: 'Proxy Detected',
      description: 'This IP is flagged as a proxy or anonymizer, which can hide the true origin of the connection.',
    });
  }
  if (geo?.hosting === true) {
    factors.push({
      severity: 'medium',
      label: 'Hosting Provider',
      description: 'This IP belongs to a hosting or datacenter provider, often used for automated services rather than personal connections.',
    });
  }
  if (geo?.mobile === true) {
    factors.push({
      severity: 'info',
      label: 'Mobile Connection',
      description: 'This IP is associated with a mobile network carrier.',
    });
  }
  if (dnsRecords && dnsRecords.length > 0) {
    const mxCount = dnsRecords.filter(r => r.type === 'MX').length;
    const aCount = dnsRecords.filter(r => r.type === 'A').length;
    if (mxCount > 0) {
      factors.push({
        severity: 'info',
        label: `${mxCount} Mail Server${mxCount > 1 ? 's' : ''} Found`,
        description: `Domain has ${mxCount} configured mail exchange server${mxCount > 1 ? 's' : ''}.`,
      });
    }
    if (aCount > 0) {
      factors.push({
        severity: 'info',
        label: `${aCount} A Record${aCount > 1 ? 's' : ''} Found`,
        description: `Domain resolves to ${aCount} IPv4 address${aCount > 1 ? 'es' : ''}.`,
      });
    }
  }
  return factors;
};

const Analyze = () => {
  const [target, setTarget] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    const trimmed = target.trim();
    if (!trimmed) {
      setError('Please enter an IP address, domain, URL, or email');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/analyze', { target: trimmed });
      setResult(res.data || null);
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

  const geo = result?.result?.geo || result?.geo || {};
  const dnsRecords = result?.dns_records || result?.result?.dns_records || [];
  const factors = buildFactors(geo, dnsRecords);

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
            ctaLabel="Dashboard"
            onCtaClick={() => window.location.href = '/home'}
          />
        </div>
      }
    >
      <div className="sm:hidden fixed top-4 right-4 z-50">
        <MobileNav isAuthenticated={true} />
      </div>

      <div className="space-y-10">
        <AnalysisForm
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            if (error) setError('');
          }}
          onSubmit={handleAnalyze}
          onClear={() => {
            setTarget('');
            setResult(null);
            setError('');
          }}
          error={error}
          loading={loading}
          helperText="Paste a link, domain, IP address, or email to start a risk analysis."
        />

        {loading && <AnalysisResultSkeleton />}

        {!loading && result && (
          <div className="grid gap-6 lg:grid-cols-2 fade-in">
            <RiskDisplay
              level={result.risk_level}
              score={result.risk_score ?? riskScoreMap[result.risk_level] ?? 50}
              confidence={result.confidence || null}
            />

            <Card variant="default" className="space-y-4">
              <details open>
                <summary className="cursor-pointer text-lg font-semibold text-ink">
                  Risk Factors
                </summary>
                <div className="mt-4">
                  <RiskFactors factors={factors} />
                </div>
              </details>
            </Card>

            {geo.lat && geo.lon && (
              <div className="lg:col-span-2">
                <LazyGeoMap lat={geo.lat} lon={geo.lon} />
              </div>
            )}

            <NetworkInfo
              isp={geo.isp}
              organization={geo.org}
              asn={geo.as || geo.asn}
              city={geo.city}
              country={geo.country}
              region={geo.regionName}
              lat={geo.lat}
              lon={geo.lon}
              flags={{
                proxy: geo.proxy,
                hosting: geo.hosting,
                mobile: geo.mobile,
                vpn: geo.vpn,
              }}
              className="lg:col-span-2"
            />
          </div>
        )}
      </div>

    </PageContainer>
  );
};

export default Analyze;
