import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileNav from './MobileNav';

// Mock react-router-dom
jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/' })
  }),
  { virtual: true }
);

// Mock shadcn components
jest.mock('../ui/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>{children}</button>
  )
}));

jest.mock('../ui/sheet', () => ({
  Sheet: ({ children, open, onOpenChange }) => (
    <div data-testid="sheet" data-open={open}>{children}</div>
  ),
  SheetTrigger: ({ children, asChild }) => <div data-testid="sheet-trigger">{children}</div>,
  SheetContent: ({ children }) => <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }) => <div data-testid="sheet-title">{children}</div>
}));

jest.mock('../ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />
}));

jest.mock('../ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />
}));

describe('MobileNav Component', () => {
  it('renders hamburger menu button', () => {
    render(<MobileNav />);
    const menuButton = screen.getByLabelText('Open menu');
    expect(menuButton).toBeInTheDocument();
  });

  it('opens drawer when hamburger menu is clicked', () => {
    render(<MobileNav />);
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    // Check if drawer content is visible
    expect(screen.getByText('LinkGuard')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('displays login and signup links when not authenticated', () => {
    render(<MobileNav isAuthenticated={false} />);
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('displays dashboard and logout when authenticated', () => {
    render(<MobileNav isAuthenticated={true} />);
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('displays user name when authenticated and userName provided', () => {
    render(<MobileNav isAuthenticated={true} userName="John Doe" />);
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('calls onLogout when logout link is clicked', () => {
    const mockLogout = jest.fn();
    render(<MobileNav isAuthenticated={true} onLogout={mockLogout} />);
    
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('ensures touch-friendly link spacing (min 44px height)', () => {
    render(<MobileNav />);
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    const homeButton = screen.getByRole('button', { name: 'Home' });
    // Check that min-height is set (Tailwind min-h-[44px])
    expect(homeButton.className).toContain('min-h-[44px]');
  });

  describe('Snapshot Tests', () => {
    it('matches snapshot for unauthenticated state', () => {
      const { container } = render(<MobileNav isAuthenticated={false} />);
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot for authenticated state', () => {
      const { container } = render(
        <MobileNav isAuthenticated={true} userName="John Doe" />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
