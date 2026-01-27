import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

/**
 * Wallet Connect Button Component
 *
 * Styled wallet connection button using Solana wallet adapter.
 * Shows connection status and allows users to connect/disconnect wallet.
 */
export const WalletButton: React.FC = () => {
  return (
    <div className="wallet-button-container">
      <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !text-primary-foreground !rounded-md !px-4 !py-2 !text-sm !font-medium !transition-colors" />
    </div>
  );
};
