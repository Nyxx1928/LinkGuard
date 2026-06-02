import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Register from './Register';
import api from '../api';

jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => jest.fn(),
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  }),
  { virtual: true }
);

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    post: jest.fn()
  }
}));

jest.mock('../components/ui/CardNav', () => () => <div data-testid="card-nav" />);
jest.mock('../components/layout/MobileNav', () => () => <div data-testid="mobile-nav" />);
jest.mock('../components/layout/Footer', () => () => <div data-testid="footer" />);

describe('Register page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  function setupRegister(setIsLoggedIn = jest.fn()) {
    render(<Register setIsLoggedIn={setIsLoggedIn} />);
    return setIsLoggedIn;
  }

  test('renders registration form', () => {
    setupRegister();

    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('submits credentials and stores auth token on success', async () => {
    api.post.mockResolvedValue({ data: { token: 'test-token' } });
    const setIsLoggedInMock = setupRegister();

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'new@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'mypassword' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'mypassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/register', {
        email: 'new@example.com',
        password: 'mypassword'
      });
    });

    expect(localStorage.getItem('auth_token')).toBe('test-token');
    expect(setIsLoggedInMock).toHaveBeenCalledWith(true);
  });

  test('submits with name when provided', async () => {
    api.post.mockResolvedValue({ data: { token: 'test-token-2' } });
    setupRegister();

    fireEvent.change(screen.getByPlaceholderText('Enter your username'), {
      target: { value: 'John' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/register', {
        name: 'John',
        email: 'john@example.com',
        password: 'password123'
      });
    });
  });

  test('shows error when passwords do not match', async () => {
    setupRegister();

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'new@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'differentpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  test('shows an error message for failed registration', async () => {
    api.post.mockRejectedValue({
      response: { data: { message: 'Email already registered.' } }
    });
    setupRegister();

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'existing@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Email already registered.')).toBeInTheDocument();
  });
});
