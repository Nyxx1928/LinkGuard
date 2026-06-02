import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PageHeader from './PageHeader';

// Mock react-router-dom
jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/' })
  }),
  { virtual: true }
);

// Mock ThemeToggle
jest.mock('../ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />
}));

// Mock CardNav
jest.mock('../ui/CardNav', () => ({
  __esModule: true,
  default: ({ items }) => (
    <div data-testid="card-nav">
      {items?.map((item, i) => (
        <div key={i}>{item.label}</div>
      ))}
    </div>
  )
}));

// Mock MobileNav
jest.mock('./MobileNav', () => ({
  __esModule: true,
  default: ({ isAuthenticated, onLogout, userName }) => (
    <div data-testid="mobile-nav">
      <span>{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
      {userName && <span>{userName}</span>}
    </div>
  )
}));

describe('PageHeader Component', () => {
  describe('Branding', () => {
    it('renders logo and tagline', () => {
      render(<PageHeader />);
      
      expect(screen.getByText('LinkGuard')).toBeInTheDocument();
      expect(screen.getByText('Security analysis dashboard')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('shows auth buttons when showAuth is true and not authenticated', () => {
      render(<PageHeader showAuth={true} isAuthenticated={false} />);
      
      expect(screen.getByText('Log In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('does not show auth buttons when showAuth is false', () => {
      render(<PageHeader showAuth={false} isAuthenticated={false} />);
      
      expect(screen.queryByText('Log In')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    it('shows logout button when authenticated', () => {
      render(<PageHeader isAuthenticated={true} />);
      
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('shows user name when provided', () => {
      render(<PageHeader isAuthenticated={true} userName="John Doe" />);
      
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    });

    it('does not show auth buttons when authenticated', () => {
      render(<PageHeader showAuth={true} isAuthenticated={true} />);
      
      expect(screen.queryByText('Log In')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
    });

    it('calls onLogout when logout button is clicked', () => {
      const mockLogout = jest.fn();
      render(<PageHeader isAuthenticated={true} onLogout={mockLogout} />);
      
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
      
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Actions', () => {
    it('renders custom actions when provided', () => {
      const customActions = (
        <button data-testid="custom-action">Custom Action</button>
      );
      
      render(<PageHeader actions={customActions} />);
      
      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('applies custom className', () => {
      render(<PageHeader className="custom-class" />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('custom-class');
    });
  });

  describe('Snapshot Tests', () => {
    it('matches snapshot for unauthenticated state', () => {
      const { asFragment } = render(
        <PageHeader showAuth={true} isAuthenticated={false} />
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches snapshot for authenticated state', () => {
      const { asFragment } = render(
        <PageHeader isAuthenticated={true} userName="John Doe" />
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches snapshot with custom actions', () => {
      const customActions = <button>Custom</button>;
      const { asFragment } = render(
        <PageHeader actions={customActions} />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
