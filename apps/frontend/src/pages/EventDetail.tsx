import React from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { ArrowLeft } from 'lucide-react';

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

export function EventDetail() {
  const { ticker } = useParams<{ ticker: string }>();

  const { loading, error, data } = useQuery(GET_DFLOW_EVENT, {
    variables: { ticker },
    errorPolicy: 'ignore',
  });

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

  const event = data.dflowEvent;
  const activeMarkets = event.markets?.filter((m: any) => m.isActive) || [];
  const completedMarkets = event.markets?.filter((m: any) => !m.isActive) || [];

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

      {/* Event Details Card */}
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
              <p className="text-xl font-bold">{formatVolume(event.volume)}</p>
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
          {event.settlementSources && event.settlementSources.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Settlement Sources
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.settlementSources.map((source: any, index: number) => (
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
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Markets */}
      {activeMarkets.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Active Markets ({activeMarkets.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMarkets.map((market: any) => (
              <Card
                key={market.ticker}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{market.title}</CardTitle>
                  {market.subtitle && (
                    <CardDescription className="text-sm">
                      {market.subtitle}
                    </CardDescription>
                  )}
                  <div className="flex gap-2">
                    <Badge
                      variant={market.isActive ? 'default' : 'secondary'}
                      className={market.isActive ? 'bg-green-500' : ''}
                    >
                      {market.status}
                    </Badge>
                    <Badge variant="outline">{market.marketType}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* YES/NO Options */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span className="text-sm font-medium text-green-800">
                          YES: {market.yesSubTitle}
                        </span>
                        {market.yesPrice && (
                          <span className="font-bold text-green-600">
                            ${market.yesPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="text-sm font-medium text-red-800">
                          NO: {market.noSubTitle}
                        </span>
                        {market.noPrice && (
                          <span className="font-bold text-red-600">
                            ${market.noPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Market Stats */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume:</span>
                        <span>{formatVolume(market.volume)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Open Interest:
                        </span>
                        <span>{formatVolume(market.openInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Closes:</span>
                        <span>{formatDate(market.closeTime)}</span>
                      </div>
                    </div>

                    {market.result && (
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className="w-full justify-center"
                        >
                          Result: {market.result.toUpperCase()}
                        </Badge>
                      </div>
                    )}

                    <div className="pt-2">
                      <Link to={`/markets/dflow/${market.ticker}`}>
                        <Button size="sm" className="w-full">
                          Trade Market
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Markets */}
      {completedMarkets.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Completed Markets ({completedMarkets.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedMarkets.map((market: any) => (
              <Card key={market.ticker} className="opacity-75">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{market.title}</CardTitle>
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
                      <span className="text-muted-foreground">Closed:</span>
                      <span>{formatDate(market.closeTime)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
