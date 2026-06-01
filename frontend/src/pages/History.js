import React from 'react';
import { PageContainer, Footer } from '../components/layout';
import MobileNav from '../components/layout/MobileNav';
import CardNav from '../components/ui/CardNav';
import HistoryDashboard from '../components/HistoryDashboard';

const History = () => {
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
        buttonBgColor="#111"
        buttonTextColor="#fff"
        ctaLabel="Dashboard"
        onCtaClick={() => window.location.href = '/home'}
      />
      <div className="sm:hidden fixed top-4 right-4 z-50">
        <MobileNav isAuthenticated={true} />
      </div>
      <div className="fade-in">
        <HistoryDashboard />
      </div>
      <Footer />
    </PageContainer>
  );
};

export default History;
