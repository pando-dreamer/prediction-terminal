import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import { DFlowEventSort, DFlowMarketStatus } from '../lib/dflow-types';

// Events query with pagination and filtering support
const GET_DFLOW_EVENTS = gql`
  query GetDFlowEvents(
    $limit: Float
    $offset: Float
    $search: String
    $sort: DFlowEventSort
    $status: DFlowMarketStatus
    $withNestedMarkets: Boolean
  ) {
    dflowEvents(
      limit: $limit
      offset: $offset
      search: $search
      sort: $sort
      status: $status
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

// Search query using the proper search API with pagination
const SEARCH_DFLOW = gql`
  query SearchDFlow(
    $query: String!
    $limit: Float
    $offset: Float
    $withNestedMarkets: Boolean
    $withNestedAccounts: Boolean
  ) {
    searchDFlow(
      query: $query
      limit: $limit
      offset: $offset
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
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce
  const loadingRef = useRef<HTMLDivElement>(null);

  // Constants for pagination
  const EVENTS_PER_PAGE = 20;

  // Use search query if there's a search term, otherwise get all events
  const shouldSearch = debouncedSearchTerm.trim().length > 0;

  // Initial events query
  const {
    loading: eventsLoading,
    error: eventsError,
    data: eventsData,
    fetchMore: fetchMoreEvents,
  } = useQuery(GET_DFLOW_EVENTS, {
    variables: {
      limit: EVENTS_PER_PAGE,
      offset: 0,
      sort: DFlowEventSort.VOLUME_24H,
      status: DFlowMarketStatus.ACTIVE,
      withNestedMarkets: true,
    },
    skip: shouldSearch,
    errorPolicy: 'ignore',
    onCompleted: data => {
      if (data?.dflowEvents) {
        setAllEvents(data.dflowEvents);
        setHasMore(data.dflowEvents.length === EVENTS_PER_PAGE);
      }
    },
  });

  // Search query
  const {
    loading: searchLoading,
    error: searchError,
    data: searchData,
    fetchMore: fetchMoreSearch,
  } = useQuery(SEARCH_DFLOW, {
    variables: {
      query: debouncedSearchTerm,
      limit: EVENTS_PER_PAGE,
      offset: 0,
      withNestedMarkets: true,
      withNestedAccounts: true,
    },
    skip: !shouldSearch,
    errorPolicy: 'ignore',
    onCompleted: data => {
      if (data?.searchDFlow) {
        setAllEvents(data.searchDFlow);
        setHasMore(data.searchDFlow.length === EVENTS_PER_PAGE);
      }
    },
  });

  // Load more events
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    try {
      const currentOffset = allEvents.length;

      if (shouldSearch) {
        const { data } = await fetchMoreSearch({
          variables: {
            offset: currentOffset,
          },
        });

        if (data?.searchDFlow) {
          const newEvents = data.searchDFlow;
          setAllEvents(prev => [...prev, ...newEvents]);
          setHasMore(newEvents.length === EVENTS_PER_PAGE);
        }
      } else {
        const { data } = await fetchMoreEvents({
          variables: {
            offset: currentOffset,
          },
        });

        if (data?.dflowEvents) {
          const newEvents = data.dflowEvents;
          setAllEvents(prev => [...prev, ...newEvents]);
          setHasMore(newEvents.length === EVENTS_PER_PAGE);
        }
      }
    } catch (error) {
      console.error('Error loading more events:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [
    allEvents.length,
    shouldSearch,
    fetchMoreEvents,
    fetchMoreSearch,
    loadingMore,
    hasMore,
  ]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadMore();
        }
      },
      { threshold: 1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, loadingMore, hasMore]);

  // Reset events when search changes
  useEffect(() => {
    setAllEvents([]);
    setHasMore(true);
  }, [debouncedSearchTerm]);

  // Determine current loading and error states
  const currentLoading =
    (shouldSearch ? searchLoading : eventsLoading) && allEvents.length === 0;
  const currentError = shouldSearch ? searchError : eventsError;

  // Get current events from state
  const currentEvents = allEvents;

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
      <Link to={`/events/${event.ticker}`} key={event.ticker}>
        <Card className="cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col">
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
              <Badge variant="secondary">
                {event.competition || 'General'}
              </Badge>
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
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Volume:</span>
                <span className="font-medium">
                  {formatVolume(event.volume)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  24h Volume:
                </span>
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
              <div className="space-y-2 flex-1">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Top Active Markets:
                </h4>
                {(() => {
                  // Filter only active markets and sort by volume (highest first)
                  const activeMarkets = event.markets
                    .filter(
                      (market: any) =>
                        market.isActive && market.status === 'active'
                    )
                    .sort((a: any, b: any) => (b.volume || 0) - (a.volume || 0))
                    .slice(0, 2);

                  return activeMarkets.length > 0 ? (
                    <>
                      {activeMarkets.map((market: any) => (
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
                              YES: {market.yesSubTitle} | NO:{' '}
                              {market.noSubTitle}
                            </p>
                            {market.volume && (
                              <p className="text-xs text-blue-600 mt-1">
                                Vol: {formatVolume(market.volume)}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-2 flex-shrink-0">
                            {market.yesPrice && (
                              <p className="text-sm font-medium text-green-600">
                                ${market.yesPrice.toFixed(2)}
                              </p>
                            )}
                            <Badge
                              variant={
                                market.isActive ? 'default' : 'secondary'
                              }
                              className="text-xs mt-1"
                            >
                              {market.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {(() => {
                        const totalActiveMarkets = event.markets.filter(
                          (market: any) =>
                            market.isActive && market.status === 'active'
                        ).length;
                        return (
                          totalActiveMarkets > 2 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{totalActiveMarkets - 2} more active markets
                            </p>
                          )
                        );
                      })()}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      No active markets available
                    </p>
                  );
                })()}
              </div>
            )}

            <div className="mt-4">
              <Button className="w-full">View Event & Markets</Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Prediction Events</h1>
          {!shouldSearch && (
            <p className="text-slate-400 mt-1 text-sm">
              Active events sorted by 24h volume
            </p>
          )}
        </div>
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
      {currentLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg text-muted-foreground">
              Loading events...
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentEvents.map(renderEventCard)}
        </div>
      )}

      {/* Infinite scroll loading indicator */}
      {hasMore && !currentLoading && currentEvents.length > 0 && (
        <div ref={loadingRef} className="text-center py-8">
          {loadingMore ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-muted-foreground">
                Loading more events...
              </span>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              {currentEvents.length} events loaded • Scroll for more
            </div>
          )}
        </div>
      )}

      {/* Status indicators */}
      {currentEvents.length > 0 && !hasMore && (
        <div className="text-center py-4">
          <p className="text-muted-foreground text-sm">
            All {currentEvents.length} events loaded ✨
          </p>
        </div>
      )}

      {/* Empty state */}
      {currentEvents.length === 0 && !currentLoading && !currentError && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {shouldSearch
              ? `No events found for "${debouncedSearchTerm}"`
              : 'No active events found.'}
          </p>
        </div>
      )}
    </div>
  );
}
