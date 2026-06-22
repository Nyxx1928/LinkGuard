import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import CardNav from '../components/ui/CardNav';
import MobileNav from '../components/layout/MobileNav';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function Login({ setIsLoggedIn, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/login', { email, password });
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('session_start', Date.now().toString());
      setIsLoggedIn(true);
      if (res.data.user) {
        setUser(res.data.user);
      }
      navigate('/home');
    } catch {
      setError('Invalid credentials, please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            ctaLabel="Create Account"
            onCtaClick={() => navigate('/register')}
          />
        </div>
      }
    >
      <div className="sm:hidden fixed top-4 right-4 z-50">
        <MobileNav isAuthenticated={false} />
      </div>

      <section className="pt-10 sm:pt-14 lg:pt-18 pb-10 sm:pb-12 lg:pb-16">
        <div className="text-center px-4">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-400">LinkGuard security intelligence</p>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold text-white">
            Welcome
            <span className="block text-primary">
              back.
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
            Sign in to your account to access your dashboard, review history, and run full analyses.
          </p>
        </div>

        <div className="mt-8 sm:mt-10 max-w-lg mx-auto px-4">
          <form onSubmit={handleLogin}>
            <div className="bg-canvas border border-hairline rounded-md p-4 sm:p-6">
              {error && (
                <div className="mb-4 p-3 sm:p-4 bg-red-950 border border-red-800 rounded-md">
                  <p className="text-red-300 text-sm flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{error}</span>
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                    required
                    disabled={loading}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-canvas-soft border border-hairline rounded-sm focus:ring-2 focus:ring-primary transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-ink font-medium placeholder-mute text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-body mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                    required
                    disabled={loading}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-canvas-soft border border-hairline rounded-sm focus:ring-2 focus:ring-primary transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-ink font-medium placeholder-mute text-sm sm:text-base pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  variant="primary"
                  size="lg"
                  className="w-full min-h-[44px]"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-primary hover:text-primary-soft transition-colors font-medium"
                  >
                    Create one
                  </button>
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>

    </PageContainer>
  );
}
