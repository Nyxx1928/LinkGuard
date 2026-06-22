import React from 'react';
import { PageContainer } from '../components/layout';
import MobileNav from '../components/layout/MobileNav';
import CardNav from '../components/ui/CardNav';
import HistoryDashboard from '../components/HistoryDashboard';

const History = () => {
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
      <div className="fade-in">
        <HistoryDashboard />
      </div>
    </PageContainer>
  );
};

export default History;
