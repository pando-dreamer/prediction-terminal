import React from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { TradingPanel } from '../components/TradingPanel';

const GET_DFLOW_MARKET = gql`
  query GetDFlowMarket($ticker: ID!) {
    dflowMarket(ticker: $ticker) {
      ticker
      eventTicker
      title
      subtitle
      yesSubTitle
      noSubTitle
      status
      category
      volume
      openInterest
      yesPrice
      noPrice
      yesBid
      yesAsk
      noBid
      noAsk
      openTime
      closeTime
      expirationTime
      isActive
      timeUntilClose
      canCloseEarly
      earlyCloseCondition
      rulesPrimary
      rulesSecondary
      result
    }
  }
`;

export function DFlowMarketDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const { loading, error, data } = useQuery(GET_DFLOW_MARKET, {
    variables: { ticker },
    skip: !ticker,
  });

  if (loading) return <div>Loading DFlow market...</div>;
  if (error) return <div>Error loading DFlow market: {error.message}</div>;
  if (!data?.dflowMarket) return <div>DFlow market not found</div>;

  const market = data.dflowMarket;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'closed':
        return 'secondary';
      case 'finalized':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-blue-500">
              DFlow
            </Badge>
            <Badge variant={getStatusBadgeVariant(market.status)}>
              {market.status.toUpperCase()}
            </Badge>
            {market.category && (
              <Badge variant="secondary">{market.category}</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold">{market.title}</h1>
          {market.subtitle && (
            <p className="text-muted-foreground">{market.subtitle}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Event: {market.eventTicker} • Ticker: {market.ticker}
          </p>
        </div>
        <div className="text-right space-y-2">
          <div className="text-2xl font-bold">
            {formatCurrency(market.volume)}
          </div>
          <div className="text-sm text-muted-foreground">Total Volume</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Market Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pricing Card */}
          <Card>
            <CardHeader>
              <CardTitle>Current Prices</CardTitle>
              <CardDescription>
                YES: {market.yesSubTitle} | NO: {market.noSubTitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* YES Side */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">YES</div>
                    <div className="text-sm text-muted-foreground">
                      {market.yesSubTitle}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {market.yesBid && (
                      <div className="flex justify-between">
                        <span>Bid:</span>
                        <span className="font-medium">
                          ${market.yesBid.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {market.yesAsk && (
                      <div className="flex justify-between">
                        <span>Ask:</span>
                        <span className="font-medium">
                          ${market.yesAsk.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {market.yesPrice && (
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Mid:</span>
                        <span className="font-bold">
                          ${market.yesPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* NO Side */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">NO</div>
                    <div className="text-sm text-muted-foreground">
                      {market.noSubTitle}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {market.noBid && (
                      <div className="flex justify-between">
                        <span>Bid:</span>
                        <span className="font-medium">
                          ${market.noBid.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {market.noAsk && (
                      <div className="flex justify-between">
                        <span>Ask:</span>
                        <span className="font-medium">
                          ${market.noAsk.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {market.noPrice && (
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Mid:</span>
                        <span className="font-bold">
                          ${market.noPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  Buy YES
                </Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700">
                  Buy NO
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rules Card */}
          <Card>
            <CardHeader>
              <CardTitle>Market Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Primary Rules</h4>
                <p className="text-sm leading-relaxed">{market.rulesPrimary}</p>
              </div>
              {market.rulesSecondary && (
                <div>
                  <h4 className="font-semibold mb-2">Additional Rules</h4>
                  <p className="text-sm leading-relaxed">
                    {market.rulesSecondary}
                  </p>
                </div>
              )}
              {market.earlyCloseCondition && (
                <div>
                  <h4 className="font-semibold mb-2">Early Close Condition</h4>
                  <p className="text-sm leading-relaxed">
                    {market.earlyCloseCondition}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Trading & Stats */}
        <div className="space-y-6">
          {/* Trading Panel */}
          <TradingPanel
            defaultMarket={{
              ticker: market.ticker,
              title: market.title,
              yesPrice: market.yesPrice,
              noPrice: market.noPrice,
            }}
            title={`Trade on ${market.title}`}
          />

          {/* Market Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Market Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Volume:</span>
                <span className="font-medium">
                  {formatCurrency(market.volume)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Open Interest:
                </span>
                <span className="font-medium">
                  {formatCurrency(market.openInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={getStatusBadgeVariant(market.status)}>
                  {market.status}
                </Badge>
              </div>
              {market.result && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Result:</span>
                  <Badge
                    variant={
                      market.result === 'yes' ? 'default' : 'destructive'
                    }
                  >
                    {market.result.toUpperCase()}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timing Card */}
          <Card>
            <CardHeader>
              <CardTitle>Market Timing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Opened:
                </div>
                <div className="font-medium">{formatTime(market.openTime)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Closes:
                </div>
                <div className="font-medium">
                  {formatTime(market.closeTime)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Expires:
                </div>
                <div className="font-medium">
                  {formatTime(market.expirationTime)}
                </div>
              </div>
              {market.isActive && market.timeUntilClose > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Time Until Close:
                  </div>
                  <div className="font-medium">
                    {Math.floor(market.timeUntilClose / (24 * 3600))} days,{' '}
                    {Math.floor((market.timeUntilClose % (24 * 3600)) / 3600)}{' '}
                    hours
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
