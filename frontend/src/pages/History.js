import React from 'react';
import { PageContainer, PageHeader, Footer } from '../components/layout';
import HistoryDashboard from '../components/HistoryDashboard';

const History = () => {
  return (
    <PageContainer>
      <PageHeader showAuth={false} isAuthenticated={true} />
      <div className="fade-in">
        <HistoryDashboard />
      </div>
      <Footer />
    </PageContainer>
  );
};

export default History;
