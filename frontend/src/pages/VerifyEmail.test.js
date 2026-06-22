import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerifyEmail from '../pages/VerifyEmail';
import api from '../api';

jest.mock(
  'react-router-dom',
  () => ({
    useSearchParams: () => [new URLSearchParams()],
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    post: jest.fn()
  }
}));

jest.mock('../components/ui/Button', () => {
  return function MockButton({ children, onClick, disabled, loading, variant }) {
    return (
      <button onClick={onClick} disabled={disabled || loading} data-variant={variant}>
        {children}
      </button>
    );
  };
});

describe('VerifyEmail page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders invalid state by default', () => {
    render(<VerifyEmail />);

    expect(screen.getByText('Verification link invalid')).toBeInTheDocument();
    expect(screen.getByText('This link has expired or is invalid.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request new link/i })).toBeInTheDocument();
  });

  test('request new link button calls correct API', async () => {
    api.post.mockResolvedValue({ data: {} });
    render(<VerifyEmail />);

    fireEvent.click(screen.getByRole('button', { name: /request new link/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/email/resend');
    });
  });

  test('shows success message after requesting new link', async () => {
    api.post.mockResolvedValue({ data: {} });
    render(<VerifyEmail />);

    fireEvent.click(screen.getByRole('button', { name: /request new link/i }));

    expect(await screen.findByText('A new verification email has been sent.')).toBeInTheDocument();
  });
});
