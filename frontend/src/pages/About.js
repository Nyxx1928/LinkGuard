import React from 'react';
import { PageContainer } from '../components/layout';
import MobileNav from '../components/layout/MobileNav';
import CardNav from '../components/ui/CardNav';
import { Card } from '../components/ui';
import EducationalTooltip from '../components/EducationalTooltip';
import { ShieldCheck, Database, Network } from 'lucide-react';

const About = () => {
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

      <div className="space-y-10 fade-in">
        <Card variant="default" className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">How LinkGuard Works</h2>
          <p className="text-sm text-body">
            LinkGuard validates targets with layered checks across DNS, geolocation, and
            network intelligence sources. Each signal contributes to a risk score
            designed to highlight suspicious activity quickly.
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card variant="default" className="space-y-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-white">Signal Validation</h3>
            <p className="text-sm text-body">
              We combine multiple risk indicators to reduce false positives and
              explain why an alert appears.
            </p>
          </Card>
          <Card variant="default" className="space-y-3">
            <Database className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-white">Trusted Sources</h3>
            <p className="text-sm text-body">
              Data comes from reputable geolocation and network datasets, reviewed
              for accuracy and freshness.
            </p>
          </Card>
          <Card variant="default" className="space-y-3">
            <Network className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-white">Transparent Output</h3>
            <p className="text-sm text-body">
              Hover over each metric to see the signal source and how it impacts the
              final score.
            </p>
          </Card>
        </div>

        <Card variant="default" className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Glossary</h3>
          <div className="space-y-3 text-sm text-body">
            <EducationalTooltip content="An Autonomous System Number identifies a network on the internet.">
              <span className="underline decoration-dotted cursor-help">ASN</span>
            </EducationalTooltip>
            <EducationalTooltip content="A proxy routes traffic through a different host to mask origin.">
              <span className="underline decoration-dotted cursor-help ml-4">Proxy</span>
            </EducationalTooltip>
            <EducationalTooltip content="Hosting providers supply infrastructure for websites and apps.">
              <span className="underline decoration-dotted cursor-help ml-4">Hosting</span>
            </EducationalTooltip>
          </div>
        </Card>
      </div>

    </PageContainer>
  );
};

export default About;
