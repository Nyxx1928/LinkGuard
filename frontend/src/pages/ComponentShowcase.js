import React from 'react';
import { PageContainer } from '../components/layout';
import MobileNav from '../components/layout/MobileNav';
import CardNav from '../components/ui/CardNav';
import { Button, Card, Input, Badge } from '../components/ui';
import MetricCard from '../components/MetricCard';
import TrendIndicator from '../components/TrendIndicator';
import RiskDisplay from '../components/RiskDisplay';
import RiskFactors from '../components/RiskFactors';
import LazyRiskChart from '../components/LazyRiskChart';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const ComponentShowcase = () => {
  const cardNavItems = [
    {
      label: 'Platform',
      bgColor: '#0f172a',
      textColor: '#fff',
      links: [
        { label: 'Analyze Links', href: '/analyze', ariaLabel: 'Run a full risk scan instantly' },
        { label: 'Lookup History', href: '/history', ariaLabel: 'Review and label saved results' },
        { label: 'Dashboard', href: '/home', ariaLabel: 'Your security overview at a glance' },
      ],
    },
    {
      label: 'Public Tools',
      bgColor: '#1e293b',
      textColor: '#fff',
      links: [
        { label: 'Public Lookup', href: '/', ariaLabel: 'Shareable checks for any target' },
        { label: 'About LinkGuard', href: '/about', ariaLabel: 'Methodology and data sources' },
      ],
    },
    {
      label: 'Resources',
      bgColor: '#1e293b',
      textColor: '#fff',
      links: [
        { label: 'About', href: '/about', ariaLabel: 'How LinkGuard evaluates risk' },
        { label: 'Component Showcase', href: '/showcase', ariaLabel: 'Design system and UI patterns' },
      ],
    },
  ];

  return (
    <PageContainer>
      <div className="hidden sm:block">
        <CardNav
          logoAlt="LinkGuard"
          items={cardNavItems}
          ctaLabel="Log In"
          onCtaClick={() => window.location.href = '/login'}
        />
      </div>
      <div className="sm:hidden fixed top-4 right-4 z-50">
        <MobileNav isAuthenticated={false} />
      </div>

      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="outline">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Inputs and Badges</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Target" placeholder="example.com" />
            <div className="flex items-center gap-2">
              <Badge variant="safe">Safe</Badge>
              <Badge variant="caution">Caution</Badge>
              <Badge variant="danger">Danger</Badge>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Metric Cards</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              icon={ShieldCheck}
              label="Safe Targets"
              value="124"
              trend={{ value: '+12%', direction: 'up', label: 'this week' }}
            />
            <MetricCard
              icon={AlertTriangle}
              label="High Risk"
              value="9"
              trend={{ value: '-4%', direction: 'down', label: 'this week' }}
            />
            <Card variant="default" className="flex items-center justify-between p-4">
              <span className="text-sm text-body">Trend</span>
              <TrendIndicator value="+8%" direction="up" />
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Risk Surfaces</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <RiskDisplay level="MEDIUM" score={52} confidence={78} />
            <RiskFactors
              factors={[
                { label: 'Hosting provider detected', description: 'IP belongs to a data center.', severity: 'medium' },
                { label: 'Recent domain activity', description: 'Domain registered in the last 30 days.', severity: 'high' },
              ]}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Charts</h2>
          <LazyRiskChart
            data={[
              { name: 'Safe', value: 42, fill: '#7dd3fc' },
              { name: 'Caution', value: 18, fill: '#0ea5e9' },
              { name: 'Danger', value: 7, fill: '#0369a1' },
              { name: 'Unknown', value: 3, fill: '#6b7280' },
            ]}
          />
        </section>
      </div>

    </PageContainer>
  );
};

export default ComponentShowcase;
