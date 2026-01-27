import React, { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextProviderProps {
  children: React.ReactNode;
}

/**
 * Wallet Context Provider
 *
 * Provides Solana wallet connection functionality throughout the app.
 * Supports Phantom and Solflare wallets on mainnet-beta.
 */
export const WalletContextProvider: React.FC<WalletContextProviderProps> = ({
  children,
}) => {
  // Use mainnet-beta for production, or configure via environment variable
  const network =
    (process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork) ||
    WalletAdapterNetwork.Mainnet;

  // Configure RPC endpoint
  const endpoint = useMemo(() => {
    // Use custom RPC if provided, otherwise default to public endpoint
    return process.env.REACT_APP_SOLANA_RPC_URL || clusterApiUrl(network);
  }, [network]);

  // Configure supported wallets
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

/**
 * Hook to access wallet context
 * Re-exports from @solana/wallet-adapter-react for convenience
 */
export { useWallet, useConnection } from '@solana/wallet-adapter-react';
