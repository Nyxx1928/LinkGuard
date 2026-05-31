import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import MobileNav from './MobileNav';
import Container from './Container';
import { ThemeToggle } from '../ui/ThemeToggle';
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

  const navItems = [
    { label: 'Dashboard', path: '/home' },
    { label: 'Analyze', path: '/analyze' },
    { label: 'History', path: '/history' },
    { label: 'About', path: '/about' },
  ];

  return (
    <header className={`sticky top-0 z-40 w-full glass-nav ${className}`}>
      <Container className="py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20">
              <Shield className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-left text-lg font-semibold text-foreground"
              >
                LinkGuard
              </button>
              <p className="text-xs text-muted-foreground">Security analysis dashboard</p>
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
            <nav className="flex items-center gap-3 text-sm text-muted-foreground" aria-label="Primary">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="rounded-full px-3 py-1.5 transition-colors hover:text-foreground"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <ThemeToggle />

            {actions && <div className="flex items-center gap-3">{actions}</div>}

            {showAuth && !isAuthenticated && (
              <>
                <Button
                  variant="secondary"
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
                  <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted-foreground">
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
