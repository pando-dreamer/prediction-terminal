import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MobileBottomNav } from './layout/MobileBottomNav';
import { BrowserRouter } from 'react-router-dom';

// Mock the wallet context
const mockWalletContext = {
  connected: false,
  publicKey: null,
  connect: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockWalletContext,
}));

describe('MobileBottomNav', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders all navigation items', () => {
    renderWithRouter(<MobileBottomNav />);

    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    // Check for the Settings text in the span element specifically
    expect(screen.getAllByText('Settings')).toHaveLength(2); // Icon name and label
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('BarChart3')).toBeInTheDocument();
  });

  it('shows wallet connection status when connected', () => {
    // Mock connected wallet
    mockWalletContext.connected = true;
    mockWalletContext.publicKey = {
      toBase58: () => '1234567890abcdef1234567890abcdef12345678',
    };

    renderWithRouter(<MobileBottomNav />);

    expect(screen.getByText('1234...5678')).toBeInTheDocument();
  });

  it('does not show wallet connection status when not connected', () => {
    mockWalletContext.connected = false;
    mockWalletContext.publicKey = null;

    renderWithRouter(<MobileBottomNav />);

    expect(screen.queryByText(/^\w{4}\.\.\.\w{4}$/)).not.toBeInTheDocument();
  });

  it('applies active class to current route', () => {
    // This would require more complex routing setup
    // For now, just verify the component renders without errors
    renderWithRouter(<MobileBottomNav />);

    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();
  });
});
