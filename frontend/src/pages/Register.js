import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import CardNav from '../components/ui/CardNav';
import MobileNav from '../components/layout/MobileNav';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import { Mail, ArrowLeft, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function Register({ setIsLoggedIn, setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/register', { name: name || undefined, email, password });
      setEmail(res.data.email || email);
      setStep('otp');
      startResendCooldown();
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }

    // Auto-submit when all digits filled
    if (newOtp.every((d) => d !== '') && value !== '') {
      submitOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const submitOtp = async (code) => {
    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await api.post('/api/email/verify-code', { email, code });
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('session_start', Date.now().toString());
      if (res.data.user) {
        setUser(res.data.user);
      }
      setIsLoggedIn(true);
      navigate('/home');
    } catch (err) {
      setOtpError('Invalid code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs[0].current.focus();
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await api.post('/api/email/resend', { email });
      startResendCooldown();
      setOtpError('');
    } catch {
      setOtpError('Failed to resend code. Try again later.');
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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

  if (step === 'otp') {
    return (
      <PageContainer>
        <div className="hidden sm:block">
          <CardNav
            logoAlt="LinkGuard"
            items={cardNavItems}
            ctaLabel="Log In"
            onCtaClick={() => navigate('/login')}
          />
        </div>
        <div className="sm:hidden fixed top-4 right-4 z-50">
          <MobileNav isAuthenticated={false} />
        </div>

        <section className="pt-10 sm:pt-14 lg:pt-18 pb-10 sm:pb-12 lg:pb-16">
          <div className="max-w-lg mx-auto px-4">
            <div className="bg-canvas border border-hairline rounded-md p-6 sm:p-8 text-center">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">
                Check your email
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                We sent a verification code to <strong className="text-gray-200">{email}</strong>.
                Enter the 6-digit code below.
              </p>

              {otpError && (
                <div className="mb-4 p-3 bg-red-950 border border-red-800 rounded-md">
                  <p className="text-red-300 text-sm">{otpError}</p>
                </div>
              )}

              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={otpLoading}
                    className="w-12 h-14 text-center text-xl font-semibold bg-canvas-soft border border-hairline rounded-md focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 text-ink"
                  />
                ))}
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={otp.some((d) => d === '') || otpLoading}
                loading={otpLoading}
                onClick={() => submitOtp(otp.join(''))}
              >
                {otpLoading ? 'Verifying...' : 'Verify Email'}
              </Button>

              <div className="mt-4 text-sm text-gray-400">
                {resendCooldown > 0 ? (
                  <span>Resend code in <strong className="text-gray-200">{resendCooldown}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-primary hover:text-primary-soft transition-colors"
                  >
                    Resend code
                  </button>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => { setStep('form'); setOtp(['', '', '', '', '', '']); setOtpError(''); }}
                  className="text-sm text-gray-400 hover:text-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Use a different email
                </button>
              </div>
            </div>
          </div>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="hidden sm:block">
        <CardNav
          logoAlt="LinkGuard"
          items={cardNavItems}
          ctaLabel="Log In"
          onCtaClick={() => navigate('/login')}
        />
      </div>
      <div className="sm:hidden fixed top-4 right-4 z-50">
        <MobileNav isAuthenticated={false} />
      </div>

      <section className="pt-10 sm:pt-14 lg:pt-18 pb-10 sm:pb-12 lg:pb-16">
        <div className="text-center px-4">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-400">LinkGuard security intelligence</p>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold text-white">
            Get
            <span className="block text-primary">
              started.
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
            Create a free account to save lookup history, add labels, and share results with your team.
          </p>
        </div>

        <div className="mt-8 sm:mt-10 max-w-lg mx-auto px-4">
          <form onSubmit={handleRegister}>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username (optional)</label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
                    disabled={loading}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-canvas-soft border border-hairline rounded-sm focus:ring-2 focus:ring-primary transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-ink font-medium placeholder-mute text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-2">Email</label>
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
                      placeholder="Create a password"
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

                <div>
                  <label className="block text-sm font-medium text-body mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                      required
                      disabled={loading}
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-canvas-soft border border-hairline rounded-sm focus:ring-2 focus:ring-primary transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-ink font-medium placeholder-mute text-sm sm:text-base pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-primary hover:text-primary-soft transition-colors font-medium"
                  >
                    Sign in
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
