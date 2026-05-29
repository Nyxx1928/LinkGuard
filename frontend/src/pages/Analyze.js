import { useState } from 'react';
import api from '../api';
import { PageContainer, PageHeader, Footer } from '../components/layout';
import AnalysisForm from '../components/AnalysisForm';
import RiskDisplay from '../components/RiskDisplay';
import RiskFactors from '../components/RiskFactors';
import LazyGeoMap from '../components/LazyGeoMap';
import NetworkInfo from '../components/NetworkInfo';
import AnalysisResultSkeleton from '../components/AnalysisResultSkeleton';
import { Card } from '../components/ui';

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

  const factors = result?.result?.signals || [];
  const geo = result?.result?.geo || result?.geo || {};

  return (
    <PageContainer>
      <PageHeader showAuth={false} isAuthenticated={true} />

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
              score={result.risk_score || null}
              confidence={result.confidence || null}
            />

            <Card variant="elevated" padding="lg" className="space-y-4">
              <details open>
                <summary className="cursor-pointer text-lg font-semibold text-foreground">
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

      <Footer />
    </PageContainer>
  );
};

export default Analyze;
