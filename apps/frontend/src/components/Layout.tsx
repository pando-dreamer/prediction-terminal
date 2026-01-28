import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface LayoutProps {
  children: React.ReactNode;
}

function WalletConnectionSection() {
  const { connected, publicKey, disconnect } = useWallet();

  if (!connected) {
    return <WalletMultiButton />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-500 px-2 uppercase tracking-wider">
          Connected Wallet
        </div>
        <div className="px-2">
          <div className="text-sm text-blue-400 font-mono">
            {publicKey?.toBase58().slice(0, 7)}...
            {publicKey?.toBase58().slice(-7)}
          </div>
        </div>
        <div className="px-2">
          <button
            onClick={disconnect}
            className="text-sm text-red-400 hover:text-red-300 font-normal transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Events', href: '/', icon: Calendar },
    { name: 'Markets', href: '/markets', icon: TrendingUp },
    { name: 'Portfolio', href: '/portfolio', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400">
            Prediction Terminal
          </h1>
        </div>

        <nav className="px-4 space-y-2">
          {navigation.map(item => {
            const isActive =
              item.href === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 px-4">
          <WalletConnectionSection />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
