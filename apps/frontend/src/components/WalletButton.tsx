import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

/**
 * Wallet Connect Button Component
 *
 * Mobile-optimized wallet connection button using Solana wallet adapter.
 * Shows connection status and allows users to connect/disconnect wallet.
 * Touch-friendly with minimum 44px touch target.
 */
export const WalletButton: React.FC = () => {
  return (
    <div className="wallet-button-container">
      <WalletMultiButton className="!bg-primary hover:!bg-primary/90 active:!bg-primary/80 !text-primary-foreground !rounded-lg !px-3 md:!px-4 !py-2.5 md:!py-2 !text-sm !font-medium !transition-colors !min-h-[44px] !touch-target" />
    </div>
  );
};
