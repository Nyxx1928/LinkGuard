import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import api from '../api';
import Button from '../components/ui/Button';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const status = searchParams.get('status');

  useEffect(() => {
    if (status === 'success') {
      const timeout = setTimeout(() => {
        navigate('/home');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [status, navigate]);

  const handleResend = async () => {
    setResending(true);
    setResendMessage('');
    try {
      await api.post('/api/email/resend');
      setResendMessage('A new verification email has been sent.');
    } catch {
      setResendMessage('Failed to resend. Try again later.');
    } finally {
      setResending(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-semibold text-white mb-2">
            Email verified!
          </h1>
          <p className="text-gray-400">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-semibold text-white mb-2">
          Verification link invalid
        </h1>
        <p className="text-gray-400 mb-6">
          This link has expired or is invalid.
        </p>
        {resendMessage ? (
          <p className="text-sm text-green-400 mb-4">{resendMessage}</p>
        ) : (
          <Button
            variant="primary"
            onClick={handleResend}
            disabled={resending}
            loading={resending}
          >
            <Mail className="h-4 w-4" />
            Request new link
          </Button>
        )}
      </div>
    </div>
  );
}
