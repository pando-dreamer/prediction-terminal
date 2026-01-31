import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TradingPanel } from '../TradingPanel';

// Mock wallet and connection contexts
const mockUseWallet = {
  publicKey: null,
  connected: false,
  signTransaction: undefined,
};
const mockUseConnection = {
  connection: {},
};

vi.mock('../../contexts/WalletContext', () => ({
  useWallet: () => mockUseWallet,
  useConnection: () => mockUseConnection,
}));

// Mock Apollo Client hooks to avoid real GraphQL calls
vi.mock('@apollo/client', () => ({
  useLazyQuery: () => [async () => ({ data: { dflowMarketMints: { yesMint: 'YES', noMint: 'NO' } } })],
  useMutation: () => [async () => ({ data: { executeDFlowTrade: { success: true } } })],
  gql: (s: any) => s,
}));

// Mock Solana SPL token utilities to avoid PublicKey-related runtime errors in tests
vi.mock('@solana/spl-token', () => ({
  getAssociatedTokenAddress: vi.fn().mockResolvedValue('FAKE_ATA'),
}));

describe('TradingPanel', () => {
  const market = { ticker: 'TEST-1', title: 'Test Market', yesPrice: 0.5, noPrice: 0.5 };

  beforeEach(() => {
    // reset mocks
    mockUseWallet.connected = false;
    mockUseWallet.publicKey = null;
    mockUseWallet.signTransaction = undefined;
  });

  it('renders with default market and prompts to connect wallet', () => {
    render(<TradingPanel markets={[market]} defaultMarket={market} />);

    expect(screen.getByText(/Test Market/)).toBeInTheDocument();
    // When not connected, user should see connect prompt
    expect(screen.getByText(/Connect your wallet to start trading/i)).toBeInTheDocument();
  });

  it('disables trade button when connected but amount is zero', async () => {
    mockUseWallet.connected = true;
    mockUseWallet.publicKey = { toBase58: () => 'abcdef' } as any;

    render(<TradingPanel markets={[market]} defaultMarket={market} />);

    const tradeBtn = await screen.findByRole('button', { name: /Buy Yes/i });
    expect(tradeBtn).toBeDisabled();

    // Clicking a disabled button should not trigger the trade error
    fireEvent.click(tradeBtn);
    await waitFor(() => expect(screen.queryByText(/Please enter a valid amount/i)).not.toBeInTheDocument());
  });

  it('toggles side to No when No button clicked and updates trade button text', async () => {
    mockUseWallet.connected = true;
    mockUseWallet.publicKey = { toBase58: () => 'abcdef' } as any;

    render(<TradingPanel markets={[market]} defaultMarket={market} />);

    const noBtn = await screen.findByRole('button', { name: /No/i });
    fireEvent.click(noBtn);

    // Now trade button should reference No
    expect(await screen.findByRole('button', { name: /Buy No/i })).toBeInTheDocument();
  });
});
