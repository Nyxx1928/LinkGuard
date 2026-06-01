import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorDisplay from './ErrorDisplay';

jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/' })
  }),
  { virtual: true }
);

describe('ErrorDisplay Component', () => {
  describe('Error Type Variants', () => {
    it('renders validation error with default title and message', () => {
      render(<ErrorDisplay type="validation" />);
      
      expect(screen.getByText('Invalid Input Format')).toBeInTheDocument();
      expect(screen.getByText(/does not match/i)).toBeInTheDocument();
    });

    it('renders network error with default title and message', () => {
      render(<ErrorDisplay type="network" />);
      
      expect(screen.getByText('Connection Issue')).toBeInTheDocument();
      expect(screen.getByText(/could not reach the server/i)).toBeInTheDocument();
    });

    it('renders rate limit error with default title and message', () => {
      render(<ErrorDisplay type="rateLimit" />);
      
      expect(screen.getByText('Too Many Requests')).toBeInTheDocument();
      expect(screen.getByText(/wait and try again/i)).toBeInTheDocument();
    });

    it('renders not found error with default title and message', () => {
      render(<ErrorDisplay type="notFound" />);
      
      expect(screen.getByText('Target Not Found')).toBeInTheDocument();
      expect(screen.getByText(/could not locate/i)).toBeInTheDocument();
    });

    it('renders server error with default title and message', () => {
      render(<ErrorDisplay type="server" />);
      
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
      expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument();
    });
  });

  describe('Custom Content', () => {
    it('renders custom title and message', () => {
      render(
        <ErrorDisplay
          type="validation"
          title="Custom Error Title"
          message="Custom error message"
        />
      );
      
      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('renders string details', () => {
      render(
        <ErrorDisplay
          type="server"
          details="Additional error information"
        />
      );
      
      expect(screen.getByText('Additional error information')).toBeInTheDocument();
    });

    it('renders array details as list', () => {
      const details = [
        'First error detail',
        'Second error detail',
        'Third error detail',
      ];
      
      render(<ErrorDisplay type="validation" details={details} />);
      
      details.forEach(detail => {
        expect(screen.getByText(detail)).toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    it('renders retry button when onRetry provided', () => {
      const handleRetry = jest.fn();
      render(<ErrorDisplay type="network" onRetry={handleRetry} />);
      
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('renders dismiss button when onDismiss provided', () => {
      const handleDismiss = jest.fn();
      render(<ErrorDisplay type="server" onDismiss={handleDismiss} />);
      
      const dismissButton = screen.getByText('Dismiss');
      expect(dismissButton).toBeInTheDocument();
      
      fireEvent.click(dismissButton);
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it('renders custom action buttons', () => {
      const handleAction1 = jest.fn();
      const handleAction2 = jest.fn();
      
      const actions = [
        { label: 'Go Home', onClick: handleAction1, variant: 'secondary' },
        { label: 'Contact Support', onClick: handleAction2, variant: 'primary' },
      ];
      
      render(<ErrorDisplay type="server" actions={actions} />);
      
      const homeButton = screen.getByText('Go Home');
      const supportButton = screen.getByText('Contact Support');
      
      expect(homeButton).toBeInTheDocument();
      expect(supportButton).toBeInTheDocument();
      
      fireEvent.click(homeButton);
      expect(handleAction1).toHaveBeenCalledTimes(1);
      
      fireEvent.click(supportButton);
      expect(handleAction2).toHaveBeenCalledTimes(1);
    });

    it('renders all button types together', () => {
      const handleRetry = jest.fn();
      const handleDismiss = jest.fn();
      const handleCustom = jest.fn();
      
      render(
        <ErrorDisplay
          type="network"
          onRetry={handleRetry}
          onDismiss={handleDismiss}
          actions={[{ label: 'Custom Action', onClick: handleCustom }]}
        />
      );
      
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Custom Action')).toBeInTheDocument();
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders small size variant', () => {
      render(<ErrorDisplay type="server" size="sm" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('p-4');
    });

    it('renders medium size variant (default)', () => {
      render(<ErrorDisplay type="server" size="md" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('p-6');
    });

    it('renders large size variant', () => {
      render(<ErrorDisplay type="server" size="lg" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('p-8');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA role', () => {
      render(<ErrorDisplay type="server" />);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('has aria-live attribute', () => {
      render(<ErrorDisplay type="server" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      render(<ErrorDisplay type="server" className="custom-class" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-class');
    });

    it('applies error-specific border styles', () => {
      const { unmount } = render(<ErrorDisplay type="validation" />);
      expect(screen.getByRole('alert')).toHaveClass('border-risk-danger/40');
      unmount();

      render(<ErrorDisplay type="rateLimit" />);
      expect(screen.getByRole('alert')).toHaveClass('border-risk-caution/40');
    });
  });
});
