import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import api from '../../api';
import Button from '../ui/Button';

export default function VerificationBanner({ user, onVerify }) {
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  if (!user || user.email_verified_at !== null) {
    return null;
  }

  const handleResend = async () => {
    setResending(true);
    setMessage('');
    try {
      await api.post('/api/email/resend');
      setMessage('Verification email sent.');
      setMessageType('success');
    } catch {
      setMessage('Failed to resend verification email. Try again later.');
      setMessageType('error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-yellow-950 border-b border-yellow-800 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-200 text-sm">
            Please verify your email address.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <span className={`text-xs ${messageType === 'success' ? 'text-yellow-300' : 'text-red-400'}`}>
              {message}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={resending}
            className="text-yellow-300 hover:text-yellow-100 hover:bg-yellow-900"
          >
            {resending ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend verification email'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
