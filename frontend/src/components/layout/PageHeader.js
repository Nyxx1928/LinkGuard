import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { DropdownNavigation } from '../ui/dropdown-navigation';
import MobileNav from './MobileNav';
import Container from './Container';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Shield, User, Search, Globe, BookOpen, FileText, Clock } from 'lucide-react';

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
    {
      id: 1,
      label: 'Platform',
      subMenus: [
        {
          title: 'Core workflow',
          items: [
            {
              label: 'Analyze Links',
              description: 'Run a full risk scan instantly.',
              icon: Search,
              link: '/analyze',
            },
            {
              label: 'Lookup History',
              description: 'Review and label saved results.',
              icon: Clock,
              link: '/history',
            },
            {
              label: 'Dashboard',
              description: 'Your security overview at a glance.',
              icon: Shield,
              link: '/home',
            },
          ],
        },
        {
          title: 'Public tools',
          items: [
            {
              label: 'Public Lookup',
              description: 'Shareable checks for any target.',
              icon: Globe,
              link: '/',
            },
            {
              label: 'About LinkGuard',
              description: 'Methodology and data sources.',
              icon: BookOpen,
              link: '/about',
            },
          ],
        },
      ],
    },
    {
      id: 2,
      label: 'Resources',
      subMenus: [
        {
          title: 'Learn',
          items: [
            {
              label: 'About',
              description: 'How LinkGuard evaluates risk.',
              icon: BookOpen,
              link: '/about',
            },
            {
              label: 'Component Showcase',
              description: 'Design system and UI patterns.',
              icon: FileText,
              link: '/showcase',
            },
          ],
        },
      ],
    },
    { id: 3, label: 'Dashboard', link: '/home' },
    { id: 4, label: 'Analyze', link: '/analyze' },
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
            <DropdownNavigation
              navItems={navItems}
              onNavigate={(path) => navigate(path)}
            />

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
