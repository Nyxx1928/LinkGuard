import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import CardNav from '../ui/CardNav';
import MobileNav from './MobileNav';
import Container from './Container';
import { Shield, User } from 'lucide-react';

/**
 * PageHeader - Consistent header component for all pages
 * 
 * Features:
 * - Logo with brand gradient
 * - Tagline/description
 * - Responsive navigation (MobileNav < 1024px, horizontal nav >= 1024px)
 * - User menu (when authenticated)
 * - Maintains navigation state during orientation changes
 * 
 * Requirements: 1.4, 10.1, 10.2, 7.1, 5.1, 5.5, 5.6
 */
const PageHeader = ({
  showAuth = false,
  isAuthenticated = false,
  onLogout = null,
  userName = null,
  actions = null,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

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
    <header className={`sticky top-0 z-40 w-full glass-nav ${className}`}>
      <Container className="py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-left text-lg font-semibold text-white"
              >
                LinkGuard
              </button>
              <p className="text-xs text-body">Security analysis dashboard</p>
            </div>
          </div>

          <div className="sm:hidden">
            <MobileNav
              isAuthenticated={isAuthenticated}
              onLogout={onLogout}
              userName={userName}
            />
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <CardNav
              items={cardNavItems}
              menuColor="currentColor"
            />

            {actions && <div className="flex items-center gap-3">{actions}</div>}

            {showAuth && !isAuthenticated && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </>
            )}

            {isAuthenticated && (
              <div className="flex items-center gap-3">
                {userName && (
                  <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-body">
                    <User className="h-3.5 w-3.5" />
                    <span>{userName}</span>
                  </div>
                )}
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
};

export default PageHeader;
