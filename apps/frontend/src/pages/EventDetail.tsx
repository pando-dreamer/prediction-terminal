import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gql, useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { useWallet, useConnection } from '../contexts/WalletContext';
import { VersionedTransaction, PublicKey } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

const GET_DFLOW_EVENT = gql`
  query GetDFlowEvent($ticker: ID!) {
    dflowEvent(ticker: $ticker) {
      ticker
      seriesTicker
      title
      subtitle
      imageUrl
      competition
      competitionScope
      volume
      volume24h
      liquidity
      openInterest
      settlementSources {
        name
        url
      }
      markets {
        ticker
        eventTicker
        marketType
        title
        subtitle
        yesSubTitle
        noSubTitle
        openTime
        closeTime
        expirationTime
        status
        volume
        result
        openInterest
        yesPrice
        noPrice
        isActive
      }
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

export function EventDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();

  const { loading, error, data } = useQuery(GET_DFLOW_EVENT, {
    variables: { ticker },
    errorPolicy: 'ignore',
  });

  const [getOrderbook] = useLazyQuery(GET_ORDERBOOK, {
    fetchPolicy: 'network-only',
  });

  const [executeTradeMutation] = useMutation(EXECUTE_TRADE);
  const [getOrderStatus] = useLazyQuery(GET_ORDER_STATUS, {
    fetchPolicy: 'network-only',
  });
  const [getMarketMints] = useLazyQuery(GET_MARKET_MINTS);

  // Trading component state - must be at top level before any early returns
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState<number>(0);
  const [showCompletedMarkets, setShowCompletedMarkets] =
    useState<boolean>(false);
  const [orderbook, setOrderbook] = useState<any>(null);
  const [loadingOrderbook, setLoadingOrderbook] = useState<boolean>(false);
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

  // USDC mint address
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  // Derived data
  const event = data?.dflowEvent;
  const activeMarkets =
    event?.markets
      ?.filter((m: any) => m.isActive)
      ?.sort((a: any, b: any) => (b.yesPrice || 0) - (a.yesPrice || 0)) || [];
  const completedMarkets =
    event?.markets?.filter((m: any) => !m.isActive) || [];

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
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            publicKey,
            { mint: yesMint, programId: TOKEN_2022_PROGRAM_ID }
          );
          const yesBalance = tokenAccounts.value
            .map(acc => acc.account.data.parsed.info.tokenAmount)
            .reduce(
              (pre, cur) =>
                Number(pre?.uiAmount || 0) + Number(cur?.uiAmount || 0),
              0
            );
          newBalances.yes = yesBalance;
          console.log('YES balance:', newBalances.yes);
        } catch (err) {
          console.error('Error fetching YES token balance:', err);
        }

        try {
          const noMint = new PublicKey(marketMints.noMint);
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            publicKey,
            { mint: noMint, programId: TOKEN_2022_PROGRAM_ID }
          );
          const noBalance = tokenAccounts.value
            .map(acc => acc.account.data.parsed.info.tokenAmount)
            .reduce(
              (pre, cur) =>
                Number(pre?.uiAmount || 0) + Number(cur?.uiAmount || 0),
              0
            );
          newBalances.no = noBalance;
          console.log('NO balance:', newBalances.no);
        } catch (err) {
          console.error('Error fetching NO token balance:', err);
        }
      }

      setBalances(newBalances);
    } catch (err) {
      console.error('Error fetching balances:', err);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const isInsufficientBalance = useMemo(() => {
    if (tradeType === 'buy' && balances.usdc < amount) return true;
    if (tradeType === 'sell' && balances[side] < amount) return true;
    return false;
  }, [balances, tradeType, amount, side]);

  // Set initial selected market when activeMarkets are available
  useEffect(() => {
    if (activeMarkets.length > 0 && !selectedMarket) {
      setSelectedMarket(activeMarkets[0]);
    }
  }, [activeMarkets, selectedMarket]);

  // Fetch market mints when selectedMarket changes
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
  }, [selectedMarket]);

  // Fetch balances when wallet connects or market mints change
  useEffect(() => {
    fetchBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, connected, marketMints]);

  // Fetch orderbook when market is selected
  useEffect(() => {
    if (selectedMarket?.ticker) {
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
  }, [selectedMarket, getOrderbook]);

  // Monitor transaction for sync mode
  const monitorSyncTransaction = async (signature: string) => {
    let retries = 0;
    const maxRetries = 60;

    while (retries < maxRetries) {
      const statusResult = await connection.getSignatureStatuses([signature]);
      const status = statusResult.value[0];

      if (!status) {
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

  // Monitor order for async mode
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

  // Execute trade
  const handleExecuteTrade = async () => {
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
      // Get order from backend
      const { data } = await executeTradeMutation({
        variables: {
          request: {
            market: selectedMarket.ticker,
            outcome: side.toUpperCase(),
            direction: tradeType.toUpperCase(),
            amount,
            slippageBps: 100,
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

      // Deserialize and sign transaction
      setTradeSuccess('Signing transaction...');
      const transactionBuffer = Buffer.from(quote.transaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuffer);
      const signedTransaction = await signTransaction(transaction);

      // Submit transaction
      setTradeSuccess('Submitting transaction...');
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        { skipPreflight: false, maxRetries: 3 }
      );

      setTradeSuccess(`Transaction submitted: ${signature.substring(0, 8)}...`);

      // Monitor based on execution mode
      if (quote.executionMode === 'sync') {
        setTradeSuccess('Monitoring transaction...');
        await monitorSyncTransaction(signature);
      } else {
        setTradeSuccess('Monitoring order execution...');
        await monitorAsyncOrder(signature);
      }

      setTradeSuccess(
        `✅ Trade successful! ${tradeType.toUpperCase()} ${amount} USDC for ${side.toUpperCase()} tokens`
      );
      setAmount(0);
    } catch (err: any) {
      console.error('Trade error:', err);
      setTradeError(err.message || 'Trade failed');
    } finally {
      setIsTrading(false);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(0)}K`;
    }
    return `$${volume.toFixed(0)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm md:text-base">Loading event details...</div>
      </div>
    );
  }

  if (error || !data?.dflowEvent) {
    return (
      <div className="space-y-4 md:space-y-6 px-4 md:px-0">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="touch-target">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        <div className="text-center py-8 md:py-12">
          <p className="text-sm md:text-base text-muted-foreground px-4">
            {error
              ? `Error loading event: ${error.message}`
              : 'Event not found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-24 lg:pb-0">
      {/* Header - Mobile optimized */}
      <div className="flex items-center gap-3 md:gap-4">
        <Link to="/">
          <button className="flex items-center gap-2 px-3 py-2 md:px-4 text-sm font-medium text-slate-300 hover:text-white active:bg-slate-800 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700 touch-target tap-highlight-none">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Back to Events</span>
            <span className="xs:hidden">Back</span>
          </button>
        </Link>
      </div>

      {/* Top Section: Event Details + Trading Component */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left: Event Details Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        loading="lazy"
                        decoding="async"
                        className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                    <CardTitle className="text-lg md:text-2xl leading-tight">
                      {event.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm md:text-base">
                    {event.subtitle}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">
                      {event.competition || 'General'}
                    </Badge>
                    {event.competitionScope && (
                      <Badge variant="outline" className="text-xs">
                        {event.competitionScope}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {event.markets?.length || 0} markets
                    </Badge>
                    {activeMarkets.length > 0 && (
                      <Badge variant="default" className="bg-green-500 text-xs">
                        {activeMarkets.length} active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Total Volume
                  </p>
                  <p className="text-base md:text-xl font-bold">
                    {formatVolume(event.volume)}
                  </p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    24h Volume
                  </p>
                  <p className="text-base md:text-xl font-bold">
                    {formatVolume(event.volume24h)}
                  </p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Liquidity
                  </p>
                  <p className="text-base md:text-xl font-bold">
                    {formatVolume(event.liquidity)}
                  </p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Open Interest
                  </p>
                  <p className="text-base md:text-xl font-bold">
                    {formatVolume(event.openInterest)}
                  </p>
                </div>
              </div>

              {/* Settlement Sources */}
              {event.settlementSources &&
                event.settlementSources.length > 0 && (
                  <div className="mt-4 md:mt-6">
                    <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">
                      Settlement Sources
                    </h3>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {event.settlementSources.map(
                        (source: any, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {source.name}
                            </a>
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Active Markets Section */}
          <div className="mt-4 md:mt-6">
            {/* Active Markets */}
            {activeMarkets.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-slate-800 rounded-lg border border-slate-700 mb-3 md:mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-white">
                    Active Markets
                  </h2>
                  <span className="px-2.5 md:px-3 py-1 bg-blue-600 text-white text-xs md:text-sm font-semibold rounded-full">
                    {activeMarkets.length}
                  </span>
                </div>
                <div className="space-y-2 md:space-y-3">
                  {activeMarkets.map((market: any) => {
                    // Calculate probability from YES price (assuming 0-1 range maps to 0-100%)
                    const probability = market.yesPrice
                      ? Math.round(market.yesPrice * 100)
                      : 0;
                    const probabilityDisplay =
                      probability < 1 ? '<1%' : `${probability}%`;

                    return (
                      <div
                        key={market.ticker}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border rounded-lg transition-all cursor-pointer tap-highlight-none ${
                          selectedMarket?.ticker === market.ticker
                            ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                            : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 active:bg-slate-700 hover:border-slate-600'
                        }`}
                        onClick={() => setSelectedMarket(market)}
                      >
                        {/* Top row on mobile: Title & Probability */}
                        <div className="flex items-center justify-between sm:flex-1 sm:min-w-0 mb-2 sm:mb-0">
                          <div className="flex-1 min-w-0 mr-3">
                            <h3 className="font-semibold text-sm md:text-base line-clamp-2 text-white">
                              {market.title}
                            </h3>
                            <p className="text-xs md:text-sm text-slate-400">
                              {formatVolume(market.volume)} Vol.
                            </p>
                          </div>

                          {/* Probability - visible on mobile next to title */}
                          <div className="flex items-center sm:hidden">
                            <span className="text-xl font-bold text-white">
                              {probabilityDisplay}
                            </span>
                          </div>
                        </div>

                        {/* Center: Probability - hidden on mobile, visible on sm+ */}
                        <div className="hidden sm:flex items-center justify-center min-w-[80px] mx-4 md:mx-6">
                          <span className="text-xl md:text-2xl font-bold text-white">
                            {probabilityDisplay}
                          </span>
                          {probability > 1 && probability < 99 && (
                            <span
                              className={`text-xs md:text-sm ml-2 ${
                                probability > 50
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {probability > 50 ? '▲' : '▼'}
                              {Math.abs(probability - 50)}%
                            </span>
                          )}
                        </div>

                        {/* Bottom row on mobile: Buy Buttons */}
                        <div className="flex gap-2 w-full sm:w-auto sm:min-w-0">
                          <Button
                            size="sm"
                            className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 active:bg-green-800 h-10 sm:h-9 text-xs sm:text-sm sm:min-w-[100px] touch-target"
                            onClick={e => {
                              e.stopPropagation();
                              e.preventDefault();
                              setSelectedMarket(market);
                              setSide('yes');
                            }}
                          >
                            Yes{' '}
                            {market.yesPrice
                              ? `${(market.yesPrice * 100).toFixed(0)}¢`
                              : 'N/A'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1 sm:flex-initial h-10 sm:h-9 text-xs sm:text-sm sm:min-w-[100px] touch-target"
                            onClick={e => {
                              e.stopPropagation();
                              e.preventDefault();
                              setSelectedMarket(market);
                              setSide('no');
                            }}
                          >
                            No{' '}
                            {market.noPrice
                              ? `${(market.noPrice * 100).toFixed(0)}¢`
                              : 'N/A'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Markets */}
            {completedMarkets.length > 0 && (
              <div className="mt-4 md:mt-6">
                <button
                  onClick={() => setShowCompletedMarkets(!showCompletedMarkets)}
                  className="w-full flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-slate-800 rounded-lg border border-slate-700 mb-3 md:mb-4 hover:bg-slate-700 active:bg-slate-600 transition-colors touch-target tap-highlight-none"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <h2 className="text-lg md:text-xl font-bold text-white">
                      Completed Markets
                    </h2>
                    <span className="px-2.5 md:px-3 py-1 bg-slate-600 text-white text-xs md:text-sm font-semibold rounded-full">
                      {completedMarkets.length}
                    </span>
                  </div>
                  {showCompletedMarkets ? (
                    <ChevronUp className="h-5 w-5 text-slate-300" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-300" />
                  )}
                </button>
                {showCompletedMarkets && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedMarkets.map((market: any) => (
                      <Card key={market.ticker} className="opacity-75">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            {market.title}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Badge variant="secondary">{market.status}</Badge>
                            {market.result && (
                              <Badge variant="outline">
                                Result: {market.result.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Final Volume:
                              </span>
                              <span>{formatVolume(market.volume)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Closed:
                              </span>
                              <span>{formatDate(market.closeTime)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Trading Component - Hidden on mobile, shown on lg+ */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-6">
            {selectedMarket && (
              <Card className="bg-slate-800 text-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={selectedMarket.title}
                        loading="lazy"
                        decoding="async"
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <CardTitle className="text-lg text-white">
                        {selectedMarket.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Buy/Sell Toggle */}
                  <div className="flex border-b border-slate-600">
                    <button
                      className={`flex-1 py-2 text-center font-medium touch-target ${
                        tradeType === 'buy'
                          ? 'text-white border-b-2 border-white'
                          : 'text-slate-400'
                      }`}
                      onClick={() => setTradeType('buy')}
                    >
                      Buy
                    </button>
                    <button
                      className={`flex-1 py-2 text-center font-medium touch-target ${
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
                  <div>
                    <Select
                      value={selectedMarket.ticker}
                      onValueChange={value => {
                        const market = activeMarkets.find(
                          (m: any) => m.ticker === value
                        );
                        if (market) setSelectedMarket(market);
                      }}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select market" />
                        <ChevronDown className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {activeMarkets.map((market: any) => (
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
                  {orderbook && !loadingOrderbook && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-600 pb-1 font-semibold">
                        <span>PRICE</span>
                        <span>SHARES</span>
                        <span>TOTAL</span>
                      </div>

                      {/* NO Orders (Asks - people selling YES) */}
                      <div>
                        <div className="text-xs font-semibold text-red-400 mb-2">
                          NO (Sell YES)
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                          {[...orderbook.noBids]
                            .sort((a, b) => b.price - a.price)
                            .map((level: any, i: number) => {
                              const maxTotal = Math.max(
                                ...orderbook.noBids.map((l: any) => l.total),
                                ...orderbook.yesBids.map((l: any) => l.total)
                              );
                              const depth = (level.total / maxTotal) * 100;
                              return (
                                <div
                                  key={i}
                                  className="relative flex justify-between items-center text-xs py-1.5 px-1"
                                >
                                  <div
                                    className="absolute inset-0 bg-red-900/20"
                                    style={{ width: `${depth}%` }}
                                  />
                                  <span className="relative z-10 text-red-400 font-medium">
                                    {(level.price * 100).toFixed(0)}¢
                                  </span>
                                  <span className="relative z-10 text-slate-200">
                                    {level.shares.toLocaleString()}
                                  </span>
                                  <span className="relative z-10 text-slate-200">
                                    ${level.total.toFixed(0)}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Spread */}
                      <div className="flex justify-between items-center text-xs py-2 bg-slate-700 px-3 rounded">
                        <span className="text-slate-200 font-medium">
                          Last: {(orderbook.lastPrice * 100).toFixed(0)}¢
                        </span>
                        <span className="text-slate-200 font-medium">
                          Spread: {(orderbook.spread * 100).toFixed(0)}¢
                        </span>
                      </div>

                      {/* YES Orders (Bids - people buying YES) */}
                      <div>
                        <div className="text-xs font-semibold text-green-400 mb-2">
                          YES (Buy YES)
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                          {[...orderbook.yesBids]
                            .sort((a, b) => b.price - a.price)
                            .map((level: any, i: number) => {
                              const maxTotal = Math.max(
                                ...orderbook.noBids.map((l: any) => l.total),
                                ...orderbook.yesBids.map((l: any) => l.total)
                              );
                              const depth = (level.total / maxTotal) * 100;
                              return (
                                <div
                                  key={i}
                                  className="relative flex justify-between items-center text-xs py-1.5 px-1"
                                >
                                  <div
                                    className="absolute inset-0 bg-green-900/20"
                                    style={{ width: `${depth}%` }}
                                  />
                                  <span className="relative z-10 text-green-400 font-medium">
                                    {(level.price * 100).toFixed(0)}¢
                                  </span>
                                  <span className="relative z-10 text-slate-200">
                                    {level.shares.toLocaleString()}
                                  </span>
                                  <span className="relative z-10 text-slate-200">
                                    ${level.total.toFixed(0)}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )}

                  {loadingOrderbook && (
                    <div className="text-center py-4 text-slate-400 text-sm">
                      Loading orderbook...
                    </div>
                  )}

                  {/* Amount Input */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Amount</span>
                      {isLoadingBalances ? (
                        <span className="text-slate-400 text-sm">
                          Loading...
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">
                          {tradeType === 'buy'
                            ? `${balances.usdc.toFixed(2)} USDC`
                            : marketMints
                              ? side === 'yes'
                                ? `${balances.yes.toFixed(1)} YES`
                                : `${balances.no.toFixed(1)} NO`
                              : `${balances.usdc.toFixed(2)} USDC`}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-3xl font-bold text-slate-300">
                        $
                      </span>
                      <Input
                        type="number"
                        value={amount}
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
                      } // Max balance
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

                  {/* Trade Button */}
                  <Button
                    className={`w-full py-3 font-bold text-lg ${
                      side === 'yes'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    onClick={handleExecuteTrade}
                    disabled={
                      isTrading ||
                      !connected ||
                      !amount ||
                      isInsufficientBalance
                    }
                  >
                    {isTrading
                      ? 'Processing...'
                      : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${side === 'yes' ? 'Yes' : 'No'}`}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Trade CTA */}
      {selectedMarket && (
        <div className="fixed bottom-16 left-0 right-0 lg:hidden z-30 px-4 pb-4 pt-2 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent safe-bottom">
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-xs text-slate-400 truncate">
                  {selectedMarket.title}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-400 font-medium">
                    Yes{' '}
                    {selectedMarket.yesPrice
                      ? `${(selectedMarket.yesPrice * 100).toFixed(0)}¢`
                      : '-'}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-red-400 font-medium">
                    No{' '}
                    {selectedMarket.noPrice
                      ? `${(selectedMarket.noPrice * 100).toFixed(0)}¢`
                      : '-'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className={`h-10 px-4 text-sm font-semibold ${
                    side === 'yes'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                  onClick={() => setSide('yes')}
                >
                  Yes
                </Button>
                <Button
                  size="sm"
                  className={`h-10 px-4 text-sm font-semibold ${
                    side === 'no'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                  onClick={() => setSide('no')}
                >
                  No
                </Button>
              </div>
            </div>
            <Button
              className={`w-full h-12 text-base font-bold ${
                side === 'yes'
                  ? 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                  : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
              }`}
              onClick={handleExecuteTrade}
              disabled={isTrading || !connected}
            >
              {!connected
                ? 'Connect Wallet to Trade'
                : isTrading
                  ? 'Processing...'
                  : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${side === 'yes' ? 'Yes' : 'No'}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
