import React, { useState, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

// Events query with nested markets
const GET_DFLOW_EVENTS = gql`
  query GetDFlowEvents(
    $limit: Float
    $search: String
    $withNestedMarkets: Boolean
  ) {
    dflowEvents(
      limit: $limit
      search: $search
      withNestedMarkets: $withNestedMarkets
    ) {
      ticker
      seriesTicker
      title
      subtitle
      imageUrl
      competition
      volume
      volume24h
      openInterest
      markets {
        ticker
        title
        yesSubTitle
        noSubTitle
        status
        yesPrice
        noPrice
        volume
        closeTime
        isActive
      }
    }
  }
`;

// Search query using the proper search API
const SEARCH_DFLOW = gql`
  query SearchDFlow(
    $query: String!
    $limit: Float
    $withNestedMarkets: Boolean
    $withNestedAccounts: Boolean
  ) {
    searchDFlow(
      query: $query
      limit: $limit
      withNestedMarkets: $withNestedMarkets
      withNestedAccounts: $withNestedAccounts
    ) {
      ticker
      seriesTicker
      title
      subtitle
      imageUrl
      competition
      volume
      volume24h
      openInterest
      markets {
        ticker
        title
        yesSubTitle
        noSubTitle
        status
        yesPrice
        noPrice
        volume
        closeTime
        isActive
      }
    }
  }
`;

// Custom hook for debounced search
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export function Events() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce

  // Use search query if there's a search term, otherwise get all events
  const shouldSearch = debouncedSearchTerm.trim().length > 0;

  const {
    loading: eventsLoading,
    error: eventsError,
    data: eventsData,
  } = useQuery(GET_DFLOW_EVENTS, {
    variables: {
      limit: 20,
      withNestedMarkets: true,
    },
    skip: shouldSearch,
    errorPolicy: 'ignore',
  });

  const {
    loading: searchLoading,
    error: searchError,
    data: searchData,
  } = useQuery(SEARCH_DFLOW, {
    variables: {
      query: debouncedSearchTerm,
      limit: 20,
      withNestedMarkets: true,
      withNestedAccounts: true,
    },
    skip: !shouldSearch,
    errorPolicy: 'ignore',
  });

  // Determine current loading and error states first
  const currentLoading = shouldSearch ? searchLoading : eventsLoading;
  const currentError = shouldSearch ? searchError : eventsError;

  // Memoize the current events data
  const currentEvents = useMemo(() => {
    if (shouldSearch) {
      return searchData?.searchDFlow || [];
    }
    const events = eventsData?.dflowEvents || [];

    // Fallback mock data for testing layout if no real data is available
    if (events.length === 0 && !currentLoading && !currentError) {
      return [
        {
          ticker: 'TEST-1',
          title: 'Pro Football Championship: Seattle vs New England',
          subtitle: 'On Feb 8, 2026',
          competition: 'NFL',
          volume: 146200000,
          volume24h: 10900000,
          openInterest: 101400000,
          imageUrl: null,
          markets: [
            {
              ticker: 'TEST-MARKET-1',
              title: 'Will Arizona win the 2026 Pro Football Championship?',
              yesSubTitle: 'Arizona',
              noSubTitle: 'Arizona',
              status: 'finalized',
              yesPrice: 0.45,
              isActive: false,
            },
            {
              ticker: 'TEST-MARKET-2',
              title: 'Will Baltimore win the 2026 Pro Football Championship?',
              yesSubTitle: 'Baltimore',
              noSubTitle: 'Baltimore',
              status: 'finalized',
              yesPrice: 0.52,
              isActive: false,
            },
          ],
        },
        {
          ticker: 'TEST-2',
          title: 'College Football Championship: Miami vs Indiana',
          subtitle: 'On Jan 19, 2026',
          competition: 'NCAAFB',
          volume: 142100000,
          volume24h: 7200000,
          openInterest: 85700000,
          imageUrl: null,
          markets: [
            {
              ticker: 'TEST-MARKET-3',
              title:
                'Will Stanford win the College Football Playoff National Championship?',
              yesSubTitle: 'Stanford',
              noSubTitle: 'Stanford',
              status: 'finalized',
              yesPrice: 0.32,
              isActive: false,
            },
          ],
        },
      ];
    }

    return events;
  }, [shouldSearch, searchData, eventsData, currentLoading, currentError]);

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(0)}K`;
    }
    return `$${volume.toFixed(0)}`;
  };

  const renderEventCard = (event: any) => {
    const activeMarkets = event.markets?.filter((m: any) => m.isActive) || [];
    const totalMarkets = event.markets?.length || 0;

    return (
      <Card
        key={event.ticker}
        className="cursor-pointer hover:shadow-md transition-shadow"
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {event.subtitle}
              </CardDescription>
            </div>
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-16 h-16 object-cover rounded-md ml-4"
              />
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{event.competition || 'General'}</Badge>
            <Badge variant="outline">
              {totalMarkets} market{totalMarkets !== 1 ? 's' : ''}
            </Badge>
            {activeMarkets.length > 0 && (
              <Badge variant="default" className="bg-green-500">
                {activeMarkets.length} active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Volume:</span>
              <span className="font-medium">{formatVolume(event.volume)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">24h Volume:</span>
              <span className="font-medium">
                {formatVolume(event.volume24h)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Open Interest:
              </span>
              <span className="font-medium">
                {formatVolume(event.openInterest)}
              </span>
            </div>
          </div>

          {/* Show top markets */}
          {event.markets && event.markets.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Top Markets:
              </h4>
              {event.markets.slice(0, 3).map((market: any) => (
                <div
                  key={market.ticker}
                  className="flex justify-between items-start p-2 bg-muted/30 rounded-md gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium line-clamp-2 leading-tight"
                      title={market.title}
                    >
                      {market.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      YES: {market.yesSubTitle} | NO: {market.noSubTitle}
                    </p>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    {market.yesPrice && (
                      <p className="text-sm font-medium text-green-600">
                        ${market.yesPrice.toFixed(2)}
                      </p>
                    )}
                    <Badge
                      variant={market.isActive ? 'default' : 'secondary'}
                      className="text-xs mt-1"
                    >
                      {market.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {event.markets.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{event.markets.length - 3} more markets
                </p>
              )}
            </div>
          )}

          <div className="mt-4">
            <Link to={`/events/${event.ticker}`}>
              <Button className="w-full">View Event & Markets</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (currentLoading) return <div>Loading events...</div>;

  // Debug logging
  console.log('Events Debug:', {
    shouldSearch,
    debouncedSearchTerm,
    currentEvents: currentEvents?.length,
    eventsData,
    searchData,
    currentError,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Prediction Events</h1>
        <Button>Create Market</Button>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search events and markets..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <Button variant="outline" onClick={() => setSearchTerm('')}>
            Clear
          </Button>
        )}
      </div>

      {/* Search info */}
      {shouldSearch && (
        <div className="text-sm text-muted-foreground">
          {currentLoading
            ? 'Searching...'
            : `Found ${currentEvents.length} events matching "${debouncedSearchTerm}"`}
        </div>
      )}

      {/* Error handling */}
      {currentError && (
        <div className="text-yellow-600 bg-yellow-50 p-4 rounded-md">
          Events unavailable: {currentError.message}
          <div className="text-xs mt-1 text-yellow-500">
            Debug: {JSON.stringify({ shouldSearch, debouncedSearchTerm })}
          </div>
        </div>
      )}

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Debug: Show event count */}
        {currentEvents.length > 0 && (
          <div className="col-span-full text-sm text-blue-600 bg-blue-50 p-2 rounded">
            Rendering {currentEvents.length} events
          </div>
        )}
        {currentEvents.map(renderEventCard)}
      </div>

      {/* Empty state */}
      {currentEvents.length === 0 && !currentLoading && !currentError && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {shouldSearch
              ? `No events found for "${debouncedSearchTerm}"`
              : 'No active events found.'}
          </p>
          {!shouldSearch && (
            <Button className="mt-4">Create the first event</Button>
          )}
        </div>
      )}
    </div>
  );
}
