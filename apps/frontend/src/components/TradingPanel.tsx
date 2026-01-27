import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useWallet, useConnection } from '../contexts/WalletContext';
import { VersionedTransaction, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, CheckCircle, Wallet } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { ChevronDown } from 'lucide-react';

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

const GET_MARKET_MINTS = gql`
  query GetMarketMints($marketId: String!) {
    dflowMarketMints(marketId: $marketId) {
      baseMint
      yesMint
      noMint
      marketId
    }
  }
`;

const GET_ORDERBOOK = gql`
  query GetDFlowOrderbook($ticker: ID!) {
    dflowOrderbook(ticker: $ticker) {
      yesBids {
        price
        shares
        total
      }
      noBids {
        price
        shares
        total
      }
      spread
      lastPrice
      sequence
    }
  }
`;

interface Market {
  ticker: string;
  title: string;
  yesPrice?: number;
  noPrice?: number;
}

interface TradingPanelProps {
  markets?: Market[];
  defaultMarket?: Market;
  showMarketSelector?: boolean;
  showOrderbook?: boolean;
  title?: string;
  imageUrl?: string;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({
  markets = [],
  defaultMarket,
  showMarketSelector = false,
  showOrderbook = false,
  title,
  imageUrl,
}) => {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [executeTradeMutation] = useMutation(EXECUTE_TRADE);
  const [getOrderStatus] = useLazyQuery(GET_ORDER_STATUS, {
    fetchPolicy: 'network-only',
  });
  const [getMarketMints] = useLazyQuery(GET_MARKET_MINTS);
  const [getOrderbook] = useLazyQuery(GET_ORDERBOOK, {
    fetchPolicy: 'network-only',
  });

  // Trading state
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(
    defaultMarket || (markets.length > 0 ? markets[0] : null)
  );
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState<number>(0);
  const [isTrading, setIsTrading] = useState<boolean>(false);
  const [tradeError, setTradeError] = useState<string>('');
  const [tradeSuccess, setTradeSuccess] = useState<string>('');
  const [balances, setBalances] = useState({
    usdc: 0,
    yes: 0,
    no: 0,
  });
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false);
  const [marketMints, setMarketMints] = useState<{
    yesMint: string;
    noMint: string;
  } | null>(null);
  const [orderbook, setOrderbook] = useState<any>(null);
  const [loadingOrderbook, setLoadingOrderbook] = useState<boolean>(false);

  // USDC mint address
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  // Update selected market when defaultMarket changes
  useEffect(() => {
    if (defaultMarket) {
      setSelectedMarket(defaultMarket);
    }
  }, [defaultMarket]);

  // Fetch user's token balances
  const fetchBalances = async () => {
    if (!publicKey || !connected) {
      setBalances({ usdc: 0, yes: 0, no: 0 });
      return;
    }

    setIsLoadingBalances(true);
    try {
      const usdcMint = new PublicKey(USDC_MINT);
      const usdcTokenAccount = await getAssociatedTokenAddress(
        usdcMint,
        publicKey
      );

      const newBalances = { usdc: 0, yes: 0, no: 0 };

      try {
        const usdcBalance =
          await connection.getTokenAccountBalance(usdcTokenAccount);
        newBalances.usdc = parseFloat(
          usdcBalance.value.uiAmount?.toString() || '0'
        );
        console.log('USDC balance:', newBalances.usdc);
      } catch (err) {
        console.log('USDC account not found');
      }

      // Fetch YES/NO token balances if we have market mints
      if (marketMints) {
        try {
          const yesMint = new PublicKey(marketMints.yesMint);
          const yesTokenAccount = await getAssociatedTokenAddress(
            yesMint,
            publicKey
          );
          const yesBalance =
            await connection.getTokenAccountBalance(yesTokenAccount);
          newBalances.yes = parseFloat(
            yesBalance.value.uiAmount?.toString() || '0'
          );
          console.log('YES balance:', newBalances.yes);
        } catch (err) {
          console.log('YES token account not found');
        }

        try {
          const noMint = new PublicKey(marketMints.noMint);
          const noTokenAccount = await getAssociatedTokenAddress(
            noMint,
            publicKey
          );
          const noBalance =
            await connection.getTokenAccountBalance(noTokenAccount);
          newBalances.no = parseFloat(
            noBalance.value.uiAmount?.toString() || '0'
          );
          console.log('NO balance:', newBalances.no);
        } catch (err) {
          console.log('NO token account not found');
        }
      }

      setBalances(newBalances);
    } catch (err) {
      console.error('Error fetching balances:', err);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Fetch market mints when market changes
  useEffect(() => {
    const fetchMints = async () => {
      if (!selectedMarket?.ticker) return;

      try {
        const result = await getMarketMints({
          variables: { marketId: selectedMarket.ticker },
        });
        if (result.data?.dflowMarketMints) {
          setMarketMints({
            yesMint: result.data.dflowMarketMints.yesMint,
            noMint: result.data.dflowMarketMints.noMint,
          });
          console.log('Market mints fetched:', result.data.dflowMarketMints);
        }
      } catch (err) {
        console.error('Error fetching market mints:', err);
      }
    };
    fetchMints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMarket?.ticker]);

  // Fetch orderbook when market changes
  useEffect(() => {
    if (showOrderbook && selectedMarket?.ticker) {
      setLoadingOrderbook(true);
      getOrderbook({ variables: { ticker: selectedMarket.ticker } })
        .then(result => {
          if (result.data?.dflowOrderbook) {
            setOrderbook(result.data.dflowOrderbook);
          }
        })
        .catch(err => {
          console.error('Failed to fetch orderbook:', err);
        })
        .finally(() => {
          setLoadingOrderbook(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMarket?.ticker, showOrderbook]);

  // Fetch balances when wallet connects or market mints change
  useEffect(() => {
    fetchBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, connected, marketMints]);

  // Monitor order status for async execution mode
  const monitorAsyncOrder = async (signature: string) => {
    let retries = 0;
    const maxRetries = 30;

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

  const handleTrade = async () => {
    if (!connected || !publicKey) {
      setTradeError('Please connect your wallet first');
      return;
    }

    if (!amount || amount <= 0) {
      setTradeError('Please enter a valid amount');
      return;
    }

    if (!signTransaction) {
      setTradeError('Wallet does not support transaction signing');
      return;
    }

    if (!selectedMarket) {
      setTradeError('Please select a market');
      return;
    }

    setIsTrading(true);
    setTradeError('');
    setTradeSuccess('');

    try {
      const currentPrice =
        side === 'yes'
          ? selectedMarket.yesPrice || 0.5
          : selectedMarket.noPrice || 0.5;
      const apiAmount = tradeType === 'buy' ? amount : amount * currentPrice;

      const { data: tradeData } = await executeTradeMutation({
        variables: {
          request: {
            market: selectedMarket.ticker,
            outcome: side.toUpperCase(),
            direction: tradeType.toUpperCase(),
            amount: apiAmount,
            slippageBps: 100,
            userPublicKey: publicKey.toBase58(),
          },
        },
      });

      if (!tradeData?.executeDFlowTrade?.success) {
        throw new Error(
          tradeData?.executeDFlowTrade?.error?.message || 'Trade failed'
        );
      }

      const { quote } = tradeData.executeDFlowTrade;

      const transactionBuffer = Buffer.from(quote.transaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuffer);

      setTradeSuccess('Signing transaction...');
      const signedTransaction = await signTransaction(transaction);

      setTradeSuccess('Submitting transaction...');
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          maxRetries: 3,
        }
      );

      setTradeSuccess(`Transaction submitted: ${signature.substring(0, 8)}...`);

      if (quote.executionMode === 'async') {
        setTradeSuccess('Monitoring order execution...');
        await monitorAsyncOrder(signature);
      }

      if (tradeType === 'buy') {
        setTradeSuccess(
          `✅ Trade successful! ${tradeType.toUpperCase()} ${amount}  USDC for ${side.toUpperCase()} tokens. Signature: ${signature.substring(0, 8)}...`
        );
      } else {
        setTradeSuccess(
          `✅ Trade successful! ${tradeType.toUpperCase()} ${amount} shares of ${side.toUpperCase()}. Signature: ${signature.substring(0, 8)}...`
        );
      }

      setAmount(0);
      setTimeout(fetchBalances, 2000);
    } catch (err: any) {
      console.error('Trade error:', err);
      setTradeError(err.message || 'Trade failed');
    } finally {
      setIsTrading(false);
    }
  };

  // Check for insufficient balance
  const isInsufficientBalance =
    tradeType === 'buy'
      ? amount > balances.usdc
      : amount > (side === 'yes' ? balances.yes : balances.no);

  if (!selectedMarket) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No market selected</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={selectedMarket.title}
              className="w-12 h-12 object-cover rounded-lg"
            />
          )}
          <div>
            <CardTitle className="text-lg text-white">
              {title || selectedMarket.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to start trading
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Buy/Sell Toggle */}
            <div className="flex border-b border-slate-600">
              <button
                className={`flex-1 py-2 text-center font-medium ${
                  tradeType === 'buy'
                    ? 'text-white border-b-2 border-white'
                    : 'text-slate-400'
                }`}
                onClick={() => setTradeType('buy')}
              >
                Buy
              </button>
              <button
                className={`flex-1 py-2 text-center font-medium ${
                  tradeType === 'sell'
                    ? 'text-white border-b-2 border-white'
                    : 'text-slate-400'
                }`}
                onClick={() => setTradeType('sell')}
              >
                Sell
              </button>
            </div>

            {/* Market Selector */}
            {showMarketSelector && markets.length > 1 && (
              <div>
                <Select
                  value={selectedMarket.ticker}
                  onValueChange={value => {
                    const market = markets.find(m => m.ticker === value);
                    if (market) setSelectedMarket(market);
                  }}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select market" />
                    <ChevronDown className="h-4 w-4" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {markets.map((market: Market) => (
                      <SelectItem
                        key={market.ticker}
                        value={market.ticker}
                        className="text-white hover:bg-slate-600"
                      >
                        {market.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Yes/No Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`p-4 rounded-lg font-bold transition-colors ${
                  side === 'yes'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                }`}
                onClick={() => setSide('yes')}
              >
                <div>Yes</div>
                <div className="text-lg">
                  {selectedMarket.yesPrice
                    ? `${(selectedMarket.yesPrice * 100).toFixed(1)}¢`
                    : 'N/A'}
                </div>
              </button>
              <button
                className={`p-4 rounded-lg font-bold transition-colors ${
                  side === 'no'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                }`}
                onClick={() => setSide('no')}
              >
                <div>No</div>
                <div className="text-lg">
                  {selectedMarket.noPrice
                    ? `${(selectedMarket.noPrice * 100).toFixed(1)}¢`
                    : 'N/A'}
                </div>
              </button>
            </div>

            {/* Orderbook Display */}
            {showOrderbook && orderbook && !loadingOrderbook && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-600 pb-1">
                  <span>PRICE</span>
                  <span>SHARES</span>
                  <span>TOTAL</span>
                </div>

                {/* Asks (NO bids - people selling YES) */}
                <div className="space-y-1">
                  {orderbook.noBids.slice(0, 4).map((level: any, i: number) => {
                    const maxTotal = Math.max(
                      ...orderbook.noBids.map((l: any) => l.total),
                      ...orderbook.yesBids.map((l: any) => l.total)
                    );
                    const depth = (level.total / maxTotal) * 100;
                    return (
                      <div
                        key={i}
                        className="relative flex justify-between items-center text-xs py-1"
                      >
                        <div
                          className="absolute inset-0 bg-red-900/20"
                          style={{ width: `${depth}%` }}
                        />
                        <span className="relative z-10 text-red-400">
                          {(level.price * 100).toFixed(0)}¢
                        </span>
                        <span className="relative z-10 text-slate-300">
                          {level.shares.toLocaleString()}
                        </span>
                        <span className="relative z-10 text-slate-300">
                          ${level.total.toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Spread */}
                <div className="flex justify-between items-center text-xs py-1 bg-slate-700/50 px-2 rounded">
                  <span className="text-slate-400">
                    Last: {(orderbook.lastPrice * 100).toFixed(0)}¢
                  </span>
                  <span className="text-slate-400">
                    Spread: {(orderbook.spread * 100).toFixed(0)}¢
                  </span>
                </div>

                {/* Bids (YES bids - people buying YES) */}
                <div className="space-y-1">
                  {orderbook.yesBids
                    .slice(0, 4)
                    .map((level: any, i: number) => {
                      const maxTotal = Math.max(
                        ...orderbook.noBids.map((l: any) => l.total),
                        ...orderbook.yesBids.map((l: any) => l.total)
                      );
                      const depth = (level.total / maxTotal) * 100;
                      return (
                        <div
                          key={i}
                          className="relative flex justify-between items-center text-xs py-1"
                        >
                          <div
                            className="absolute inset-0 bg-green-900/20"
                            style={{ width: `${depth}%` }}
                          />
                          <span className="relative z-10 text-green-400">
                            {(level.price * 100).toFixed(0)}¢
                          </span>
                          <span className="relative z-10 text-slate-300">
                            {level.shares.toLocaleString()}
                          </span>
                          <span className="relative z-10 text-slate-300">
                            ${level.total.toFixed(0)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {showOrderbook && loadingOrderbook && (
              <div className="text-center py-4 text-slate-400 text-sm">
                Loading orderbook...
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Amount</span>
                {isLoadingBalances ? (
                  <span className="text-slate-400 text-sm">Loading...</span>
                ) : (
                  <div className="flex items-center gap-1 text-slate-400 text-sm">
                    <Wallet className="h-3 w-3" />
                    <span>
                      {tradeType === 'buy'
                        ? `${balances.usdc.toFixed(6)} USDC`
                        : marketMints
                          ? side === 'yes'
                            ? `${balances.yes.toFixed(6)} YES`
                            : `${balances.no.toFixed(6)} NO`
                          : `${balances.usdc.toFixed(6)} USDC`}
                    </span>
                  </div>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-3xl font-bold text-slate-300">
                  $
                </span>
                <Input
                  type="number"
                  value={amount || ''}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white text-3xl font-bold pl-8 pr-4 py-6"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 20, 100].map(value => (
                <Button
                  key={value}
                  variant="secondary"
                  size="sm"
                  className="bg-slate-600 hover:bg-slate-500 text-white"
                  onClick={() => setAmount(amount + value)}
                >
                  +${value}
                </Button>
              ))}
              <Button
                variant="secondary"
                size="sm"
                className="bg-slate-600 hover:bg-slate-500 text-white"
                onClick={() =>
                  setAmount(
                    tradeType === 'buy' ? balances.usdc : balances[side]
                  )
                }
              >
                Max
              </Button>
            </div>

            {/* Error Display */}
            {tradeError && (
              <Alert className="bg-red-900/20 border-red-500">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">
                  {tradeError}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Display */}
            {tradeSuccess && (
              <Alert className="bg-green-900/20 border-green-500">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">
                  {tradeSuccess}
                </AlertDescription>
              </Alert>
            )}

            {/* Insufficient Balance Warning */}
            {isInsufficientBalance && amount > 0 && (
              <Alert className="bg-yellow-900/20 border-yellow-500">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-200">
                  Insufficient balance
                </AlertDescription>
              </Alert>
            )}

            {/* Trade Button */}
            <Button
              className={`w-full py-3 font-bold text-lg ${
                side === 'yes'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              onClick={handleTrade}
              disabled={
                isTrading || !amount || amount <= 0 || isInsufficientBalance
              }
            >
              {isTrading
                ? 'Processing...'
                : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${side === 'yes' ? 'Yes' : 'No'}`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
