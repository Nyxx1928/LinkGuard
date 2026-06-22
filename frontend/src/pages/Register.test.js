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
    render(<Register setIsLoggedIn={setIsLoggedIn} setUser={jest.fn()} />);
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

  test('shows verification notice after successful registration', async () => {
    api.post.mockResolvedValue({ data: { message: 'Account created. Please check your email to verify your account.' } });
    setupRegister();

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

    expect(await screen.findByText('Check your email')).toBeInTheDocument();
    expect(screen.getByText(/Account created/i)).toBeInTheDocument();
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
