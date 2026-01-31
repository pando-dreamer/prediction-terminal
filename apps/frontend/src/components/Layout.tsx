import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { MobileBottomNav } from './layout/MobileBottomNav';

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

function DesktopSidebar() {
  const location = useLocation();

  const navigation = [
    { name: 'Events', href: '/', icon: Calendar },
    { name: 'Portfolio', href: '/portfolio', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-800 border-r border-slate-700">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-400">
          Prediction Terminal
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
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

      <div className="p-4 border-t border-slate-700">
        <WalletConnectionSection />
      </div>
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Desktop sidebar - hidden on mobile */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <DesktopSidebar />
      </aside>

      {/* Main content area */}
      <main
        className={cn(
          'min-h-screen',
          // Mobile: add bottom padding for nav, no left padding
          'pb-20 lg:pb-0',
          // Desktop: add left padding for sidebar
          'lg:pl-64'
        )}
      >
        <div className="h-full p-4 lg:p-6">{children}</div>
      </main>

      {/* Mobile bottom navigation - visible only on mobile */}
      <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
        <MobileBottomNav />
      </nav>
    </div>
  );
}
