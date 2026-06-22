import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import VerificationBanner from './VerificationBanner';
import api from '../../api';

jest.mock('../../api', () => ({
  __esModule: true,
  default: {
    post: jest.fn()
  }
}));

jest.mock('../ui/Button', () => {
  return ({ children, onClick, disabled, variant, size, className }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} data-size={size} className={className}>
      {children}
    </button>
  );
});

describe('VerificationBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders when user is unverified', () => {
    const user = { email_verified_at: null };
    render(<VerificationBanner user={user} onVerify={jest.fn()} />);

    expect(screen.getByText('Please verify your email address.')).toBeInTheDocument();
    expect(screen.getByText('Resend verification email')).toBeInTheDocument();
  });

  test('hidden when user is verified', () => {
    const user = { email_verified_at: '2024-01-01T00:00:00.000Z' };
    const { container } = render(<VerificationBanner user={user} onVerify={jest.fn()} />);

    expect(container.firstChild).toBeNull();
  });

  test('hidden when user is null', () => {
    const { container } = render(<VerificationBanner user={null} onVerify={jest.fn()} />);

    expect(container.firstChild).toBeNull();
  });

  test('resend button calls correct API endpoint', async () => {
    api.post.mockResolvedValue({ data: {} });
    const user = { email_verified_at: null };
    render(<VerificationBanner user={user} onVerify={jest.fn()} />);

    fireEvent.click(screen.getByText('Resend verification email'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/email/resend');
    });
  });

  test('shows success message after resend', async () => {
    api.post.mockResolvedValue({ data: {} });
    const user = { email_verified_at: null };
    render(<VerificationBanner user={user} onVerify={jest.fn()} />);

    fireEvent.click(screen.getByText('Resend verification email'));

    expect(await screen.findByText('Verification email sent.')).toBeInTheDocument();
  });

  test('shows error message when resend fails', async () => {
    api.post.mockRejectedValue(new Error('Network error'));
    const user = { email_verified_at: null };
    render(<VerificationBanner user={user} onVerify={jest.fn()} />);

    fireEvent.click(screen.getByText('Resend verification email'));

    expect(await screen.findByText('Failed to resend verification email. Try again later.')).toBeInTheDocument();
  });
});
