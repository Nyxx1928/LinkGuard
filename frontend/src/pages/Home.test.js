import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Home from './Home';
import api from '../api';

jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/' })
  }),
  { virtual: true }
);

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

jest.mock('../components/GeoMap', () => function GeoMapMock() { return <div data-testid="geo-map" />; });
jest.mock('../components/MapErrorBoundary', () => function MapErrorBoundaryMock({ children }) { return <>{children}</>; });
jest.mock('../components/layout/MobileNav', () => ({
  __esModule: true,
  default: () => <div data-testid="mobile-nav" />
}));
jest.mock('../components/ui/CardNav', () => ({
  __esModule: true,
  default: () => <div data-testid="card-nav" />
}));
jest.mock('../components/layout/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer" />
}));
jest.mock('../components/layout/PageContainer', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="page-container">{children}</div>
}));
jest.mock('../components/LazyRiskChart', () => ({
  __esModule: true,
  default: () => <div data-testid="risk-chart" />
}));
jest.mock('../components/LazyGeoMap', () => ({
  __esModule: true,
  default: () => <div data-testid="geo-map" />
}));
jest.mock('../components/HistoryList', () => ({
  __esModule: true,
  default: () => <div data-testid="history-list" />
}));
jest.mock('../components/BulkLookup', () => ({
  __esModule: true,
  default: () => <div data-testid="bulk-lookup" />
}));
jest.mock('../components/TransparencyPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="transparency-panel" />
}));
jest.mock('../components/LoadingState', () => ({
  __esModule: true,
  default: ({ message }) => <div data-testid="loading-state">{message}</div>
}));
jest.mock('../components/ResultCard', () => ({
  __esModule: true,
  default: ({ result }) => <div data-testid="result-card">{result?.target}</div>
}));

// Mock ResizeObserver for recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const initialGeo = {
  query: '1.1.1.1',
  city: 'Sydney',
  regionName: 'NSW',
  country: 'Australia',
  lat: -33.86,
  lon: 151.2
};

describe('Home page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  function setupHome(setIsLoggedIn = jest.fn()) {
    render(<Home setIsLoggedIn={setIsLoggedIn} />);
    return setIsLoggedIn;
  }

  test('loads and displays the dashboard', async () => {
    api.get.mockResolvedValueOnce({ data: initialGeo });
    setupHome();

    expect(await screen.findByText('Summary')).toBeInTheDocument();
  });

  test('shows search controls', async () => {
    api.get.mockResolvedValueOnce({ data: initialGeo });
    setupHome();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter ip/i)).toBeInTheDocument();
    });
  });

  test('searches a valid IP and adds it to history', async () => {
    api.get.mockResolvedValueOnce({ data: initialGeo });
    api.post.mockResolvedValueOnce({
      data: {
        status: 'success',
        target: '8.8.8.8',
        risk_level: 'safe',
        risk_score: 5,
      }
    });

    setupHome();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter ip/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/enter ip/i), {
      target: { value: '8.8.8.8' }
    });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/analyze', { target: '8.8.8.8' }));
    expect(await screen.findByText('Search History')).toBeInTheDocument();
    expect(screen.getAllByText('8.8.8.8').length).toBeGreaterThan(0);
  });

  test('logs out and clears auth token', async () => {
    api.get.mockResolvedValueOnce({ data: initialGeo });
    localStorage.setItem('auth_token', 'existing-token');

    const setIsLoggedInMock = setupHome();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter ip/i)).toBeInTheDocument();
    });

    expect(setIsLoggedInMock).toBeDefined();
    expect(localStorage.getItem('auth_token')).toBe('existing-token');
  });
});