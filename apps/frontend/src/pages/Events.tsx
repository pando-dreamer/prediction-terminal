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
import {
  SlidersHorizontal,
  Search,
  ChevronRight,
  TrendingUp,
  Clock,
  Zap,
  Filter,
  X,
} from 'lucide-react';

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

// Get tags by categories
const GET_TAGS_BY_CATEGORIES = gql`
  query GetTagsByCategories {
    tagsByCategories {
      tagsByCategories
    }
  }
`;

// Get series by tags
const GET_SERIES_BY_TAGS = gql`
  query GetSeriesByTags(
    $tags: [String!]
    $categories: [String!]
    $limit: Float
    $offset: Float
  ) {
    seriesByTags(
      tags: $tags
      categories: $categories
      limit: $limit
      offset: $offset
    ) {
      ticker
      title
      category
      tags
      frequency
    }
  }
`;

// Get events by series
const GET_EVENTS_BY_SERIES = gql`
  query GetEventsBySeries(
    $seriesTickers: [String!]!
    $limit: Float
    $offset: Float
    $sort: DFlowEventSort
    $status: DFlowMarketStatus
    $withNestedMarkets: Boolean
  ) {
    dflowEventsBySeries(
      seriesTickers: $seriesTickers
      limit: $limit
      offset: $offset
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

  // Filter state
  const [activeTab, setActiveTab] = useState<string>('Trending');
  const [currentSort, setCurrentSort] = useState<DFlowEventSort>(
    DFlowEventSort.VOLUME_24H
  );

  // Category filtering state - Managed mostly by activeTab now
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [appliedSeriesTickers, setAppliedSeriesTickers] = useState<string[]>(
    []
  );

  // Update filter/sort state when tab changes
  useEffect(() => {
    // Clear current events to show loading state
    setAllEvents([]);
    setHasMore(true);

    if (activeTab === 'Trending') {
      setSelectedCategories([]);
      setSelectedTags([]);
      setAppliedSeriesTickers([]);
      setCurrentSort(DFlowEventSort.VOLUME_24H);
    } else if (activeTab === 'New') {
      setSelectedCategories([]);
      setSelectedTags([]);
      setAppliedSeriesTickers([]);
      setCurrentSort(DFlowEventSort.START_DATE);
    } else if (activeTab === 'Breaking') {
      setSelectedCategories([]);
      setSelectedTags([]);
      setAppliedSeriesTickers([]);
      setCurrentSort(DFlowEventSort.LIQUIDITY);
    } else {
      // Category selected
      setSelectedCategories([activeTab]);
      setSelectedTags([]);
      setAppliedSeriesTickers([]);
      setCurrentSort(DFlowEventSort.VOLUME_24H);
    }
  }, [activeTab]);

  // Constants for pagination
  const EVENTS_PER_PAGE = 20;

  // Derive search query from inputs OR active filters
  const getEffectiveSearchQuery = () => {
    if (debouncedSearchTerm.trim().length > 0) return debouncedSearchTerm;

    // If filtering by category/tag, use that as search query
    if (
      activeTab !== 'Trending' &&
      activeTab !== 'New' &&
      activeTab !== 'Breaking'
    ) {
      if (selectedTags.length > 0) return selectedTags.join(' ');
      return activeTab;
    }

    return '';
  };

  const effectiveSearchQuery = getEffectiveSearchQuery();
  const shouldSearch = effectiveSearchQuery.length > 0;

  // Only use series filter if explicitly set AND not searching (to avoid conflict, though search takes precedence)
  // We largely rely on Search for categories now to avoid 413 Payload Too Large errors with series lists
  const shouldFilterBySeries = appliedSeriesTickers.length > 0 && !shouldSearch;

  // Get tags by categories
  const { data: categoriesData, loading: categoriesLoading } = useQuery(
    GET_TAGS_BY_CATEGORIES
  );

  // Get series by selected tags/categories
  const { data: seriesData, loading: seriesLoading } = useQuery(
    GET_SERIES_BY_TAGS,
    {
      variables: {
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        categories:
          selectedCategories.length > 0 ? selectedCategories : undefined,
        limit: 50,
        offset: 0,
      },
      skip: selectedTags.length === 0 && selectedCategories.length === 0,
    }
  );

  // Auto-apply series filters when series data is loaded for a category/tag
  useEffect(() => {
    if (seriesData?.seriesByTags) {
      // Only trigger if we are in category mode (not search, not just generic trending unless appropriate)
      if (selectedCategories.length > 0 || selectedTags.length > 0) {
        const tickers = seriesData.seriesByTags.map((s: any) => s.ticker);
        setAppliedSeriesTickers(prev => {
          const isSame =
            prev.length === tickers.length &&
            prev.every((val: any, index: any) => val === tickers[index]);
          return isSame ? prev : tickers;
        });
      }
    }
  }, [seriesData, selectedCategories, selectedTags]);

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
      sort: currentSort,
      status: DFlowMarketStatus.ACTIVE,
      withNestedMarkets: true,
    },
    skip: shouldSearch || shouldFilterBySeries,
    errorPolicy: 'ignore',
    onCompleted: data => {
      if (data?.dflowEvents) {
        setAllEvents(data.dflowEvents);
        setHasMore(data.dflowEvents.length === EVENTS_PER_PAGE);
      }
    },
  });

  // Events by series query
  const {
    loading: seriesEventsLoading,
    error: seriesEventsError,
    data: seriesEventsData,
    fetchMore: fetchMoreSeriesEvents,
  } = useQuery(GET_EVENTS_BY_SERIES, {
    variables: {
      seriesTickers: appliedSeriesTickers,
      limit: EVENTS_PER_PAGE,
      offset: 0,
      sort: currentSort,
      status: DFlowMarketStatus.ACTIVE,
      withNestedMarkets: true,
    },
    skip: !shouldFilterBySeries,
    errorPolicy: 'ignore',
    onCompleted: data => {
      if (data?.dflowEventsBySeries) {
        setAllEvents(data.dflowEventsBySeries);
        setHasMore(data.dflowEventsBySeries.length === EVENTS_PER_PAGE);
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
      query: effectiveSearchQuery,
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
      } else if (shouldFilterBySeries) {
        const { data } = await fetchMoreSeriesEvents({
          variables: {
            offset: currentOffset,
          },
        });

        if (data?.dflowEventsBySeries) {
          const newEvents = data.dflowEventsBySeries;
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
    shouldFilterBySeries,
    fetchMoreEvents,
    fetchMoreSearch,
    fetchMoreSeriesEvents,
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

  // Reset events when search/filter changes
  useEffect(() => {
    // Only reset if we are switching search queries (to avoid double reset with tab change)
    if (shouldSearch) {
      setAllEvents([]);
      setHasMore(true);
    }
  }, [effectiveSearchQuery, shouldSearch]);

  // Reset events when series filter changes
  useEffect(() => {
    if (shouldFilterBySeries) {
      setAllEvents([]);
      setHasMore(true);
    }
  }, [appliedSeriesTickers]);

  // Determine current loading and error states
  const currentLoading =
    (shouldSearch
      ? searchLoading
      : shouldFilterBySeries
        ? seriesEventsLoading
        : eventsLoading) && allEvents.length === 0;
  const currentError = shouldSearch
    ? searchError
    : shouldFilterBySeries
      ? seriesEventsError
      : eventsError;

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
                              <p className="text-xs text-primary mt-1">
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
          {!shouldSearch && !shouldFilterBySeries && (
            <p className="text-muted-foreground mt-1 text-sm">
              Active events sorted by 24h volume
            </p>
          )}
          {shouldFilterBySeries && (
            <p className="text-muted-foreground mt-1 text-sm">
              Filtered by {appliedSeriesTickers.length} series
            </p>
          )}
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex flex-col space-y-4">
        {/* Top Tab Bar */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-border/40 pb-2">
          {[
            { id: 'Trending', icon: TrendingUp },
            { id: 'Breaking', icon: Zap },
            { id: 'New', icon: Clock },
          ].map(tab => (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex items-center gap-2 rounded-none border-b-2 px-1 pb-2 hover:bg-transparent transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="h-4 w-4" />
              {tab.id}
            </Button>
          ))}

          <div className="h-4 w-[1px] bg-border/50 shrink-0" />

          {categoriesLoading ? (
            <div className="flex gap-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-6 w-20 bg-muted rounded" />
              ))}
            </div>
          ) : (
            (() => {
              try {
                const parsed = JSON.parse(
                  categoriesData?.tagsByCategories?.tagsByCategories || '{}'
                );
                return Object.keys(parsed)
                  .sort()
                  .map(cat => (
                    <Button
                      key={cat}
                      variant="ghost"
                      className={`flex items-center gap-2 rounded-none border-b-2 px-1 pb-2 hover:bg-transparent whitespace-nowrap transition-colors ${
                        activeTab === cat
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setActiveTab(cat)}
                    >
                      {cat}
                    </Button>
                  ));
              } catch (e) {
                return null;
              }
            })()
          )}
        </div>

        {/* Secondary Filter Bar */}
        {activeTab !== 'Trending' &&
          activeTab !== 'Breaking' &&
          activeTab !== 'New' && (
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center py-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <h2 className="text-2xl font-bold text-foreground min-w-[120px] tracking-tight">
                {activeTab}
              </h2>

              <div className="flex-1 overflow-hidden w-full">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-2 md:pb-0 mask-gradient-right">
                  <Button
                    variant={selectedTags.length === 0 ? 'secondary' : 'ghost'}
                    size="sm"
                    className={`rounded-full transition-all font-medium ${selectedTags.length === 0 ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                    onClick={() => setSelectedTags([])}
                  >
                    All
                  </Button>
                  {(() => {
                    try {
                      const parsed = JSON.parse(
                        categoriesData?.tagsByCategories?.tagsByCategories ||
                          '{}'
                      );
                      const tags = parsed[activeTab] || [];
                      return tags.map((tag: string) => (
                        <Button
                          key={tag}
                          variant={
                            selectedTags.includes(tag) ? 'secondary' : 'ghost'
                          }
                          size="sm"
                          className={`rounded-full whitespace-nowrap transition-all font-medium ${
                            selectedTags.includes(tag)
                              ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                          onClick={() =>
                            setSelectedTags(prev =>
                              prev.includes(tag)
                                ? prev.filter(t => t !== tag)
                                : [...prev, tag]
                            )
                          }
                        >
                          {tag}
                        </Button>
                      ));
                    } catch (e) {
                      return null;
                    }
                  })()}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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
        <div className="text-sm text-muted-foreground animate-in fade-in slide-in-from-left-2">
          {currentLoading
            ? 'Searching...'
            : `Found ${currentEvents.length} events matching "${effectiveSearchQuery}"`}
        </div>
      )}
      {shouldFilterBySeries && !shouldSearch && (
        <div className="text-sm text-muted-foreground">
          {currentLoading
            ? 'Filtering events...'
            : `Found ${currentEvents.length} events in selected series`}
        </div>
      )}

      {/* Error handling */}
      {currentError && (
        <div className="text-red-500 bg-red-500/10 p-4 rounded-md border border-red-500/20">
          <p className="font-medium">Unable to load events</p>
          <p className="text-sm opacity-90">{currentError.message}</p>
        </div>
      )}

      {/* Events grid */}
      {currentLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              : shouldFilterBySeries
                ? 'No events found for the selected series. Try adjusting your filters.'
                : 'No active events found.'}
          </p>
        </div>
      )}
    </div>
  );
}
