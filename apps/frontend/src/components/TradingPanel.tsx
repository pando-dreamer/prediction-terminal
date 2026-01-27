import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface TradingPanelProps {
  marketTicker: string;
  marketTitle: string;
  yesPrice?: number;
  noPrice?: number;
}

type OutcomeType = 'YES' | 'NO';
type TradeDirection = 'BUY' | 'SELL';

/**
 * Trading Panel Component
 *
 * Provides UI for buying and selling YES/NO tokens on prediction markets.
 * Integrates with Solana wallet and DFlow trading API.
 */
export const TradingPanel: React.FC<TradingPanelProps> = ({
  marketTicker,
  marketTitle,
  yesPrice = 0.5,
  noPrice = 0.5,
}) => {
  const { publicKey, connected } = useWallet();

  const [outcome, setOutcome] = useState<OutcomeType>('YES');
  const [amount, setAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(100); // 1% = 100 bps
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Handle null/undefined prices
  const safeYesPrice = yesPrice ?? 0.5;
  const safeNoPrice = noPrice ?? 0.5;
  const currentPrice = outcome === 'YES' ? safeYesPrice : safeNoPrice;
  const estimatedTokens = amount ? parseFloat(amount) / currentPrice : 0;

  const handleTrade = async (direction: TradeDirection) => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement GraphQL mutation to execute trade
      // This will call executeDFlowTrade mutation with:
      // - market: marketTicker
      // - outcome: outcome
      // - direction: direction
      // - amount: parseFloat(amount)
      // - slippageBps: slippage
      // - userPublicKey: publicKey.toBase58()

      console.log('Trading:', {
        market: marketTicker,
        outcome,
        direction,
        amount: parseFloat(amount),
        slippageBps: slippage,
        userPublicKey: publicKey.toBase58(),
      });

      // Placeholder for transaction signing and submission
      setError('Trading functionality will be implemented in next phase');
    } catch (err: any) {
      setError(err.message || 'Trade failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trading</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to start trading
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade on {marketTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Outcome Selection */}
        <div className="space-y-2">
          <Label>Outcome</Label>
          <Tabs
            value={outcome}
            onValueChange={v => setOutcome(v as OutcomeType)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="YES" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                YES ${safeYesPrice.toFixed(2)}
              </TabsTrigger>
              <TabsTrigger value="NO" className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                NO ${safeNoPrice.toFixed(2)}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USDC)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          {amount && (
            <p className="text-sm text-muted-foreground">
              ≈ {estimatedTokens.toFixed(2)} {outcome} tokens
            </p>
          )}
        </div>

        {/* Slippage */}
        <div className="space-y-2">
          <Label htmlFor="slippage">Slippage Tolerance</Label>
          <div className="flex gap-2">
            {[50, 100, 200, 500].map(bps => (
              <Button
                key={bps}
                variant={slippage === bps ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSlippage(bps)}
              >
                {(bps / 100).toFixed(1)}%
              </Button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Trade Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleTrade('BUY')}
            disabled={isLoading || !amount}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Buy'}
          </Button>
          <Button
            onClick={() => handleTrade('SELL')}
            disabled={isLoading || !amount}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Sell'}
          </Button>
        </div>

        {/* Trading Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Trades are executed on DFlow prediction market</p>
          <p>• Network: Solana Mainnet</p>
          <p>
            • Wallet: {publicKey?.toBase58().slice(0, 8)}...
            {publicKey?.toBase58().slice(-8)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
