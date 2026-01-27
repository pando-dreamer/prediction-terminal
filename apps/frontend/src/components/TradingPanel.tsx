import React, { useState, useEffect } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { useWallet, useConnection } from '../contexts/WalletContext';
import { VersionedTransaction, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Wallet,
} from 'lucide-react';

const EXECUTE_TRADE = gql`
  mutation ExecuteDFlowTrade($request: DFlowTradeRequestInput!) {
    executeDFlowTrade(request: $request) {
      success
      signature
      quote {
        inputMint
        inAmount
        outputMint
        outAmount
        slippageBps
        priceImpactPct
        executionMode
        transaction
      }
      error {
        code
        message
      }
    }
  }
`;

const GET_ORDER_STATUS = gql`
  query GetOrderStatus($signature: String!) {
    dflowOrderStatus(signature: $signature) {
      status
      inAmount
      outAmount
      fills {
        signature
        inputMint
        inAmount
        outputMint
        outAmount
      }
    }
  }
`;

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
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [outcome, setOutcome] = useState<OutcomeType>('YES');
  const [amount, setAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(100); // 1% = 100 bps
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [balances, setBalances] = useState({
    usdc: 0,
    yes: 0,
    no: 0,
  });
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  const [executeTradeMutation] = useMutation(EXECUTE_TRADE);
  const [getOrderStatus] = useLazyQuery(GET_ORDER_STATUS, {
    fetchPolicy: 'network-only',
  });

  // USDC mint address
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  /**
   * Fetch user's token balances
   */
  const fetchBalances = async () => {
    if (!publicKey || !connected) {
      setBalances({ usdc: 0, yes: 0, no: 0 });
      return;
    }

    setIsLoadingBalances(true);
    try {
      // Get USDC balance
      const usdcMint = new PublicKey(USDC_MINT);
      const usdcTokenAccount = await getAssociatedTokenAddress(
        usdcMint,
        publicKey
      );

      try {
        const usdcBalance =
          await connection.getTokenAccountBalance(usdcTokenAccount);
        const balance = parseFloat(
          usdcBalance.value.uiAmount?.toString() || '0'
        );
        console.log('USDC balance fetched:', balance);
        setBalances(prev => ({
          ...prev,
          usdc: balance,
        }));
      } catch (err) {
        // Account doesn't exist, balance is 0
        console.log('USDC account not found, setting balance to 0');
        setBalances(prev => ({ ...prev, usdc: 0 }));
      }

      // TODO: Fetch YES/NO token balances when we have market mints
      // For now, we'll set them to 0 and only check USDC for BUY
    } catch (err) {
      console.error('Error fetching balances:', err);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Fetch balances when wallet connects or outcome changes
  useEffect(() => {
    fetchBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, connected]);

  // Refetch balances after successful trade
  useEffect(() => {
    if (successMessage.includes('✅')) {
      // Wait a bit for blockchain to update
      setTimeout(fetchBalances, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successMessage]);

  // Handle null/undefined prices
  const safeYesPrice = yesPrice ?? 0.5;
  const safeNoPrice = noPrice ?? 0.5;
  const currentPrice = outcome === 'YES' ? safeYesPrice : safeNoPrice;
  const estimatedTokens = amount ? parseFloat(amount) / currentPrice : 0;

  // Balance validation
  const getInsufficientBalanceWarning = (
    direction: TradeDirection
  ): string | null => {
    const inputAmount = parseFloat(amount || '0');

    if (inputAmount <= 0) return null;

    console.log(`Checking ${direction} balance:`, {
      inputAmount,
      usdcBalance: balances.usdc,
      yesBalance: balances.yes,
      noBalance: balances.no,
      estimatedTokens,
    });

    if (direction === 'BUY') {
      if (inputAmount > balances.usdc) {
        console.log('Insufficient USDC for BUY');
        return `Insufficient USDC balance. You have ${balances.usdc.toFixed(2)} USDC`;
      }
    } else {
      // SELL
      const requiredTokens = estimatedTokens;
      const tokenBalance = outcome === 'YES' ? balances.yes : balances.no;

      if (requiredTokens > tokenBalance) {
        console.log(`Insufficient ${outcome} tokens for SELL`);
        return `Insufficient ${outcome} token balance. You have ${tokenBalance.toFixed(2)} ${outcome} tokens`;
      }
    }

    return null;
  };

  // Get the active warning based on which button would be clickable
  const buyWarning = amount ? getInsufficientBalanceWarning('BUY') : null;
  const sellWarning = amount ? getInsufficientBalanceWarning('SELL') : null;

  /**
   * Monitor transaction status for sync execution mode
   */
  const monitorSyncTransaction = async (signature: string) => {
    let retries = 0;
    const maxRetries = 60; // 60 seconds timeout

    while (retries < maxRetries) {
      const statusResult = await connection.getSignatureStatuses([signature]);
      const status = statusResult.value[0];

      if (!status) {
        console.log('Waiting for transaction confirmation...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries++;
        continue;
      }

      if (status.confirmationStatus === 'finalized') {
        if (status.err) {
          throw new Error('Transaction failed on blockchain');
        }
        return true;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      retries++;
    }

    throw new Error('Transaction confirmation timeout');
  };

  /**
   * Monitor order status for async execution mode
   */
  const monitorAsyncOrder = async (signature: string) => {
    let retries = 0;
    const maxRetries = 30; // 60 seconds timeout (2 sec intervals)

    while (retries < maxRetries) {
      try {
        const { data } = await getOrderStatus({
          variables: { signature },
        });

        const orderStatus = data?.dflowOrderStatus;

        if (!orderStatus) {
          console.log('Waiting for order status...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          retries++;
          continue;
        }

        console.log(`Order status: ${orderStatus.status}`);

        if (orderStatus.status === 'closed') {
          if (orderStatus.fills && orderStatus.fills.length > 0) {
            return true;
          }
          throw new Error('Order closed without fills');
        }

        if (orderStatus.status === 'failed') {
          throw new Error('Order failed to execute');
        }

        // Continue polling for 'open' or 'pendingClose'
        await new Promise(resolve => setTimeout(resolve, 2000));
        retries++;
      } catch (err) {
        console.error('Error monitoring order:', err);
        await new Promise(resolve => setTimeout(resolve, 2000));
        retries++;
      }
    }

    throw new Error('Order monitoring timeout');
  };

  const handleTrade = async (direction: TradeDirection) => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!signTransaction) {
      setError('Wallet does not support transaction signing');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // 1. Get quote and transaction from backend
      const { data } = await executeTradeMutation({
        variables: {
          request: {
            market: marketTicker,
            outcome,
            direction,
            amount: parseFloat(amount),
            slippageBps: slippage,
            userPublicKey: publicKey.toBase58(),
          },
        },
      });

      if (!data?.executeDFlowTrade?.success) {
        throw new Error(
          data?.executeDFlowTrade?.error?.message || 'Trade failed'
        );
      }

      const { quote } = data.executeDFlowTrade;

      // 2. Deserialize the transaction
      const transactionBuffer = Buffer.from(quote.transaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuffer);

      // 3. Sign the transaction with user's wallet
      setSuccessMessage('Signing transaction...');
      const signedTransaction = await signTransaction(transaction);

      // 4. Send the signed transaction to Solana
      setSuccessMessage('Submitting transaction...');
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          maxRetries: 3,
        }
      );

      setSuccessMessage(
        `Transaction submitted: ${signature.substring(0, 8)}...`
      );

      // 5. Monitor transaction based on execution mode
      if (quote.executionMode === 'sync') {
        setSuccessMessage('Monitoring transaction...');
        await monitorSyncTransaction(signature);
      } else {
        setSuccessMessage('Monitoring order execution...');
        await monitorAsyncOrder(signature);
      }

      setSuccessMessage(
        `✅ Trade successful! ${direction} ${amount} USDC for ${outcome} tokens. Signature: ${signature.substring(0, 8)}...`
      );

      // Reset form
      setAmount('');
    } catch (err: any) {
      console.error('Trade error:', err);
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
          <div className="flex items-center justify-between text-sm">
            {amount && (
              <p className="text-muted-foreground">
                ≈ {estimatedTokens.toFixed(2)} {outcome} tokens
              </p>
            )}
            {isLoadingBalances ? (
              <p className="text-muted-foreground">Loading balances...</p>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Wallet className="h-3 w-3" />
                <span>{balances.usdc.toFixed(2)} USDC</span>
              </div>
            )}
          </div>
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

        {/* Success Display */}
        {successMessage && (
          <Alert className="border-green-500 bg-green-50 text-green-900">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Balance Warnings - Show either BUY or SELL warning, prioritize BUY */}
        {buyWarning && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{buyWarning}</AlertDescription>
          </Alert>
        )}
        {!buyWarning && sellWarning && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{sellWarning}</AlertDescription>
          </Alert>
        )}

        {/* Trade Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleTrade('BUY')}
            disabled={isLoading || !amount || !!buyWarning || isLoadingBalances}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Buy'}
          </Button>
          <Button
            onClick={() => handleTrade('SELL')}
            disabled={
              isLoading || !amount || !!sellWarning || isLoadingBalances
            }
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
