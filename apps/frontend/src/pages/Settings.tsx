import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Settings as SettingsIcon,
  Wallet,
  Bell,
  Shield,
  Palette,
} from 'lucide-react';

export function Settings() {
  const { connected, publicKey, disconnect } = useWallet();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account and preferences
        </p>
      </div>

      {/* Wallet Section - Always visible */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Wallet className="h-5 w-5 text-blue-400" />
            Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connected ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  Connected Address
                </p>
                <p className="text-blue-400 font-mono text-sm break-all">
                  {publicKey?.toBase58()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="text-red-400 border-red-400/50 hover:bg-red-400/10 hover:text-red-300"
              >
                Disconnect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">
                Connect your wallet to start trading
              </p>
              <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !rounded-lg !h-11 !text-sm" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white px-1">Coming Soon</h2>

        {[
          {
            icon: Bell,
            title: 'Notifications',
            description: 'Get alerts for price changes and market events',
          },
          {
            icon: Shield,
            title: 'Security',
            description: 'Two-factor authentication and session management',
          },
          {
            icon: Palette,
            title: 'Appearance',
            description: 'Customize themes and display preferences',
          },
          {
            icon: SettingsIcon,
            title: 'Advanced',
            description: 'Slippage tolerance, default amounts, and more',
          },
        ].map(feature => (
          <Card
            key={feature.title}
            className="bg-slate-800/50 border-slate-700/50 opacity-60"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-700/50">
                  <feature.icon className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-300">
                    {feature.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {feature.description}
                  </p>
                </div>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider px-2 py-1 bg-slate-700/50 rounded">
                  Soon
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
