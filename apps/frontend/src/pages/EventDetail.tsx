import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
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

export function EventDetail() {
  const { ticker } = useParams<{ ticker: string }>();

  const { loading, error, data } = useQuery(GET_DFLOW_EVENT, {
    variables: { ticker },
    errorPolicy: 'ignore',
  });

  const [getOrderbook] = useLazyQuery(GET_ORDERBOOK, {
    fetchPolicy: 'network-only',
  });

  // Trading component state - must be at top level before any early returns
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState<number>(0);
  const [showCompletedMarkets, setShowCompletedMarkets] =
    useState<boolean>(false);
  const [orderbook, setOrderbook] = useState<any>(null);
  const [loadingOrderbook, setLoadingOrderbook] = useState<boolean>(false);

  // Derived data
  const event = data?.dflowEvent;
  const activeMarkets =
    event?.markets
      ?.filter((m: any) => m.isActive)
      ?.sort((a: any, b: any) => (b.yesPrice || 0) - (a.yesPrice || 0)) || [];
  const completedMarkets =
    event?.markets?.filter((m: any) => !m.isActive) || [];

  // Set initial selected market when activeMarkets are available
  useEffect(() => {
    if (activeMarkets.length > 0 && !selectedMarket) {
      setSelectedMarket(activeMarkets[0]);
    }
  }, [activeMarkets, selectedMarket]);

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
        <div>Loading event details...</div>
      </div>
    );
  }

  if (error || !data?.dflowEvent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {error
              ? `Error loading event: ${error.message}`
              : 'Event not found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>

      {/* Top Section: Event Details + Trading Component */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Event Details Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-2xl">{event.title}</CardTitle>
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                  </div>
                  <CardDescription className="text-base">
                    {event.subtitle}
                  </CardDescription>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="secondary">
                      {event.competition || 'General'}
                    </Badge>
                    {event.competitionScope && (
                      <Badge variant="outline">{event.competitionScope}</Badge>
                    )}
                    <Badge variant="outline">
                      {event.markets?.length || 0} markets
                    </Badge>
                    {activeMarkets.length > 0 && (
                      <Badge variant="default" className="bg-green-500">
                        {activeMarkets.length} active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="text-xl font-bold">
                    {formatVolume(event.volume)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="text-xl font-bold">
                    {formatVolume(event.volume24h)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Liquidity</p>
                  <p className="text-xl font-bold">
                    {formatVolume(event.liquidity)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open Interest</p>
                  <p className="text-xl font-bold">
                    {formatVolume(event.openInterest)}
                  </p>
                </div>
              </div>

              {/* Settlement Sources */}
              {event.settlementSources &&
                event.settlementSources.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Settlement Sources
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {event.settlementSources.map(
                        (source: any, index: number) => (
                          <Badge key={index} variant="outline">
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

          {/* Active Markets Section - Same width as Event Details */}
          <div className="lg:max-w-[100%]">
            {/* 2/3 width to match event details */}
            {/* Active Markets */}
            {activeMarkets.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 mt-4">
                  Active Markets ({activeMarkets.length})
                </h2>
                <div className="space-y-3">
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
                        className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                          selectedMarket?.ticker === market.ticker
                            ? 'bg-primary/10 border-primary'
                            : 'bg-card hover:bg-muted/50'
                        }`}
                      >
                        {/* Left: Market Title & Volume - Clickable area */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            setSelectedMarket(market);
                          }}
                        >
                          <h3 className="font-semibold text-base truncate">
                            {market.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatVolume(market.volume)} Vol.
                          </p>
                        </div>

                        {/* Center: Probability */}
                        <div className="flex items-center justify-center min-w-[80px] mx-6">
                          <span className="text-2xl font-bold">
                            {probabilityDisplay}
                          </span>
                          {probability > 1 && probability < 99 && (
                            <span
                              className={`text-sm ml-2 ${
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

                        {/* Right: Buy Buttons */}
                        <div className="flex gap-2 min-w-0">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 min-w-[100px]"
                            onClick={e => {
                              e.stopPropagation();
                              e.preventDefault();
                              setSelectedMarket(market);
                              setSide('yes');
                            }}
                          >
                            Buy Yes{' '}
                            {market.yesPrice
                              ? `${(market.yesPrice * 100).toFixed(1)}¢`
                              : 'N/A'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="min-w-[100px]"
                            onClick={e => {
                              e.stopPropagation();
                              e.preventDefault();
                              setSelectedMarket(market);
                              setSide('no');
                            }}
                          >
                            Buy No{' '}
                            {market.noPrice
                              ? `${(market.noPrice * 100).toFixed(1)}¢`
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
              <div className="mt-6">
                <button
                  onClick={() => setShowCompletedMarkets(!showCompletedMarkets)}
                  className="flex items-center gap-2 text-xl font-semibold mb-4 hover:text-primary transition-colors"
                >
                  <span>Completed Markets ({completedMarkets.length})</span>
                  {showCompletedMarkets ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
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

        {/* Right: Trading Component */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            {selectedMarket && (
              <Card className="bg-slate-800 text-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={selectedMarket.title}
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
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-600 pb-1">
                        <span>PRICE</span>
                        <span>SHARES</span>
                        <span>TOTAL</span>
                      </div>

                      {/* Asks (NO bids - people selling YES) */}
                      <div className="space-y-1">
                        {orderbook.noBids
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

                  {loadingOrderbook && (
                    <div className="text-center py-4 text-slate-400 text-sm">
                      Loading orderbook...
                    </div>
                  )}

                  {/* Amount Input */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Amount</span>
                      <span className="text-slate-400 text-sm">
                        Balance $9.63
                      </span>
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
                      onClick={() => setAmount(9.63)} // Max balance
                    >
                      Max
                    </Button>
                  </div>

                  {/* Trade Button */}
                  <Button
                    className={`w-full py-3 font-bold text-lg ${
                      side === 'yes'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    onClick={() => {
                      // Handle trade execution
                      console.log('Execute trade:', {
                        market: selectedMarket.ticker,
                        type: tradeType,
                        side,
                        amount,
                      });
                    }}
                  >
                    {tradeType === 'buy' ? 'Buy' : 'Sell'}{' '}
                    {side === 'yes' ? 'Yes' : 'No'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
