import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DFlowMarket,
  DFlowMarketsResponse,
  DFlowMarketFilter,
  DFlowApiError,
} from './interfaces/dflow-market.interface';
import {
  DFlowEvent,
  DFlowEventsResponse,
  DFlowEventFilter,
  DFlowSearchResponse,
  DFlowEventSort,
  DFlowMarketStatus,
} from './interfaces/dflow-event.interface';
import {
  DFlowOrderbook,
  ProcessedOrderbook,
  OrderbookLevel,
} from './interfaces/orderbook.interface';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

@Injectable()
export class DFlowService {
  private readonly logger = new Logger(DFlowService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_CACHE_TTL = 30000; // 30 seconds
  private readonly MARKETS_CACHE_TTL = 60000; // 1 minute for markets list

  constructor(private configService: ConfigService) {
    this.apiUrl =
      this.configService.get<string>('DFLOW_PREDICTION_ENDPOINT') ||
      'https://a.prediction-markets-api.dflow.net';
    this.apiKey = this.configService.get<string>('DFLOW_API_KEY') || '';

    if (!this.apiKey) {
      this.logger.warn(
        'DFLOW_API_KEY not found in environment variables - DFlow integration will be limited'
      );
    }

    // Clean up expired cache entries every 5 minutes
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000);
  }

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}_${params ? JSON.stringify(params) : ''}`;
  }

  private getCachedData<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.timestamp + item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  private setCachedData<T>(
    key: string,
    data: T,
    ttl: number = this.DEFAULT_CACHE_TTL
  ): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private cleanupCache(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.timestamp + item.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  private async makeApiCall<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheTTL?: number
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint, options.body);

    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
      const cachedData = this.getCachedData<T>(cacheKey);
      if (cachedData) {
        this.logger.debug(`Returning cached data for: ${url}`);
        return cachedData;
      }
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };

    const maxRetries = 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(
          `Making API call (attempt ${attempt}/${maxRetries}): ${url}`
        );

        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
          ...options,
          headers: {
            ...defaultHeaders,
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error: DFlowApiError = {
            message:
              errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`,
            statusCode: response.status,
            error: errorData.error,
          };

          // Don't retry on client errors (4xx), only server errors (5xx) and network issues
          if (response.status < 500) {
            this.logger.error(
              `DFlow API client error: ${error.message}`,
              error
            );
            throw new HttpException(error.message, error.statusCode);
          }

          throw new Error(`Server error: ${error.message}`);
        }

        const data = await response.json();
        this.logger.debug(`API call successful: ${url}`);

        // Cache successful GET responses
        if (!options.method || options.method === 'GET') {
          const ttl =
            cacheTTL ||
            (endpoint.includes('/markets')
              ? this.MARKETS_CACHE_TTL
              : this.DEFAULT_CACHE_TTL);
          this.setCachedData(cacheKey, data, ttl);
        }

        return data;
      } catch (error) {
        lastError = error;

        if (error instanceof HttpException) {
          throw error; // Don't retry client errors
        }

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
          this.logger.warn(
            `API call failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms: ${error.message}`
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.logger.error(`All API call attempts failed for: ${url}`, lastError);
    throw new HttpException(
      `Failed to communicate with DFlow API after ${maxRetries} attempts`,
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }

  async getMarkets(filters: DFlowMarketFilter = {}): Promise<DFlowMarket[]> {
    const params = new URLSearchParams();

    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);
    if (filters.status && filters.status.length > 0) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters.search) params.append('search', filters.search);

    const endpoint = `/api/v1/markets${params.toString() ? `?${params.toString()}` : ''}`;

    try {
      const response = await this.makeApiCall<DFlowMarketsResponse>(endpoint);
      return response.markets || [];
    } catch (error) {
      this.logger.error('Failed to fetch markets from DFlow', error);

      // Try to return cached data as fallback
      const cacheKey = this.getCacheKey(endpoint);
      const cachedData = this.getCachedData<DFlowMarketsResponse>(cacheKey);
      if (cachedData) {
        this.logger.warn('Returning stale cached data due to API error');
        return cachedData.markets || [];
      }

      return []; // Return empty array on error to allow graceful degradation
    }
  }

  async getMarketByTicker(ticker: string): Promise<DFlowMarket | null> {
    try {
      const endpoint = `/api/v1/market/${encodeURIComponent(ticker)}`;
      const market = await this.makeApiCall<DFlowMarket>(endpoint);
      return market;
    } catch (error) {
      this.logger.error(`Failed to fetch market ${ticker} from DFlow`, error);
      return null;
    }
  }

  async searchMarkets(
    query: string,
    limit: number = 20
  ): Promise<DFlowMarket[]> {
    return this.getMarkets({
      search: query,
      limit,
      sort: 'volume',
      order: 'desc',
    });
  }

  async search(
    query: string,
    limit: number = 10,
    withNestedMarkets: boolean = true,
    withNestedAccounts: boolean = true,
    offset: number = 0
  ): Promise<DFlowSearchResponse> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());
    if (offset > 0) params.append('offset', offset.toString());
    params.append('withNestedMarkets', withNestedMarkets.toString());
    params.append('withNestedAccounts', withNestedAccounts.toString());

    const endpoint = `/api/v1/search?${params.toString()}`;

    try {
      const response = await this.makeApiCall<DFlowSearchResponse>(endpoint);
      return response;
    } catch (error) {
      this.logger.error('Failed to perform search on DFlow', error);
      return { events: [] };
    }
  }

  async getActiveMarkets(limit: number = 50): Promise<DFlowMarket[]> {
    return this.getMarkets({
      status: ['active'],
      limit,
      sort: 'volume',
      order: 'desc',
    });
  }

  async getMarketsByCategory(
    category: string,
    limit: number = 20
  ): Promise<DFlowMarket[]> {
    // Note: DFlow API might have category filtering, but not visible in sample
    // For now, we'll get all markets and filter client-side if needed
    const markets = await this.getMarkets({ limit: limit * 2 }); // Get more to filter

    // Simple category matching based on title/ticker patterns
    const categoryKeywords = this.getCategoryKeywords(category);
    return markets
      .filter(market =>
        categoryKeywords.some(
          keyword =>
            market.title.toLowerCase().includes(keyword) ||
            market.ticker.toLowerCase().includes(keyword) ||
            market.eventTicker.toLowerCase().includes(keyword)
        )
      )
      .slice(0, limit);
  }

  private getCategoryKeywords(category: string): string[] {
    const categoryMap: Record<string, string[]> = {
      politics: [
        'pres',
        'president',
        'election',
        'politics',
        'democrat',
        'republican',
      ],
      sports: ['boxing', 'football', 'basketball', 'soccer', 'tennis', 'sport'],
      crypto: ['bitcoin', 'btc', 'eth', 'crypto', 'blockchain'],
      entertainment: ['oscar', 'emmy', 'movie', 'film', 'celebrity'],
      business: ['stock', 'company', 'ipo', 'market', 'economy'],
    };

    return categoryMap[category.toLowerCase()] || [category.toLowerCase()];
  }

  async getEvents(filters: DFlowEventFilter = {}): Promise<DFlowEvent[]> {
    const params = new URLSearchParams();

    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.status && filters.status.length > 0) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters.withNestedMarkets) {
      params.append('withNestedMarkets', filters.withNestedMarkets.toString());
    }

    const endpoint = `/api/v1/events${params.toString() ? `?${params.toString()}` : ''}`;

    try {
      const response = await this.makeApiCall<DFlowEventsResponse>(endpoint);
      return response.events || [];
    } catch (error) {
      this.logger.error('Failed to fetch events from DFlow', error);

      // Try to return cached data as fallback
      const cacheKey = this.getCacheKey(endpoint);
      const cachedData = this.getCachedData<DFlowEventsResponse>(cacheKey);
      if (cachedData) {
        this.logger.warn('Returning stale cached data due to API error');
        return cachedData.events || [];
      }

      return []; // Return empty array on error to allow graceful degradation
    }
  }

  async getEventByTicker(ticker: string): Promise<DFlowEvent | null> {
    try {
      const endpoint = `/api/v1/event/${encodeURIComponent(ticker)}?withNestedMarkets=true`;
      const event = await this.makeApiCall<DFlowEvent>(endpoint);
      return event;
    } catch (error) {
      this.logger.error(`Failed to fetch event ${ticker} from DFlow`, error);
      return null;
    }
  }

  async getActiveEvents(limit: number = 20): Promise<DFlowEvent[]> {
    return this.getEvents({
      limit,
      sort: DFlowEventSort.VOLUME_24H,
      status: [DFlowMarketStatus.ACTIVE],
      withNestedMarkets: true,
    });
  }

  async getOrderbook(ticker: string): Promise<ProcessedOrderbook | null> {
    try {
      const endpoint = `/api/v1/orderbook/${encodeURIComponent(ticker)}`;
      const orderbook = await this.makeApiCall<DFlowOrderbook>(
        endpoint,
        {},
        5000
      ); // 5 second cache for orderbook

      // Process orderbook data
      const processYesBids = (
        bids: Record<string, number>
      ): OrderbookLevel[] => {
        return Object.entries(bids)
          .map(([price, shares]) => ({
            price: parseFloat(price),
            shares,
            total: parseFloat(price) * shares,
          }))
          .sort((a, b) => b.price - a.price) // Highest price first
          .slice(0, 10); // Top 10 levels
      };

      const processNoBids = (
        bids: Record<string, number>
      ): OrderbookLevel[] => {
        return Object.entries(bids)
          .map(([price, shares]) => ({
            price: parseFloat(price),
            shares,
            total: parseFloat(price) * shares,
          }))
          .sort((a, b) => a.price - b.price) // Lowest price first (asks)
          .slice(0, 10); // Top 10 levels
      };

      const yesBids = processYesBids(orderbook.yes_bids || {});
      const noBids = processNoBids(orderbook.no_bids || {});

      // Calculate spread and last price
      const highestYesBid = yesBids[0]?.price || 0;
      const lowestNoAsk = noBids[0]?.price || 0;
      const spread =
        lowestNoAsk && highestYesBid ? lowestNoAsk - highestYesBid : 0;
      const lastPrice = highestYesBid || 0;

      return {
        yesBids,
        noBids,
        spread,
        lastPrice,
        sequence: orderbook.sequence,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch orderbook for ${ticker} from DFlow`,
        error
      );
      return null;
    }
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      await this.getMarkets({ limit: 1 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Filter outcome mints from a list of token mints
   */
  async filterOutcomeMints(mints: string[]): Promise<string[]> {
    try {
      // Use the filter-outcome-mints endpoint
      const endpoint = '/api/v1/filter_outcome_mints';
      const response = await this.makeApiCall<{
        outcome_mints: Array<{
          mint: string;
          market_ticker: string;
          outcome_name: string;
        }>;
      }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({ mints }),
      });

      return response.outcome_mints?.map(om => om.mint) || [];
    } catch (error) {
      this.logger.error('Failed to filter outcome mints', error);
      return [];
    }
  }

  /**
   * Get market data by mint address
   */
  async getMarketByMint(mint: string): Promise<any> {
    try {
      const endpoint = `/api/v1/market/by-mint/${encodeURIComponent(mint)}`;
      return await this.makeApiCall(endpoint);
    } catch (error) {
      this.logger.error(`Failed to fetch market by mint ${mint}`, error);
      // Return mock data for development
      return {};
    }
  }

  /**
   * Get tags organized by categories
   */
  async getTagsByCategories(): Promise<Record<string, string[]>> {
    try {
      const endpoint = '/api/v1/tags_by_categories';
      const response = await this.makeApiCall<{
        tagsByCategories: Record<string, string[]>;
      }>(endpoint);
      return response.tagsByCategories || {};
    } catch (error) {
      this.logger.error('Failed to fetch tags by categories from DFlow', error);
      return {};
    }
  }

  /**
   * Get series filtered by tags and categories
   */
  async getSeriesByTags(
    filter: {
      tags?: string[];
      categories?: string[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams();

      if (filter.tags && filter.tags.length > 0) {
        params.append('tags', filter.tags.join(','));
      }
      if (filter.categories && filter.categories.length > 0) {
        params.append('categories', filter.categories.join(','));
      }
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.offset) params.append('offset', filter.offset.toString());

      const endpoint = `/api/v1/series${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await this.makeApiCall<{ series: any[] }>(endpoint);
      return response.series || [];
    } catch (error) {
      this.logger.error('Failed to fetch series by tags from DFlow', error);
      return [];
    }
  }

  /**
   * Get events filtered by series tickers
   */
  async getEventsBySeries(
    seriesTickers: string[],
    filter: {
      limit?: number;
      offset?: number;
      sort?: DFlowEventSort;
      status?: DFlowMarketStatus[];
      withNestedMarkets?: boolean;
    } = {}
  ): Promise<DFlowEvent[]> {
    try {
      const params = new URLSearchParams();

      if (seriesTickers.length > 0) {
        params.append('series', seriesTickers.join(','));
      }
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.offset) params.append('offset', filter.offset.toString());
      if (filter.sort) params.append('sort', filter.sort);
      if (filter.status && filter.status.length > 0) {
        filter.status.forEach(status => params.append('status', status));
      }
      if (filter.withNestedMarkets) {
        params.append('withNestedMarkets', filter.withNestedMarkets.toString());
      }

      const endpoint = `/api/v1/events${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await this.makeApiCall<DFlowEventsResponse>(endpoint);
      return response.events || [];
    } catch (error) {
      this.logger.error('Failed to fetch events by series from DFlow', error);
      return [];
    }
  }
  async createRedemptionOrder(request: {
    mint: string;
    amount: number;
    userPublicKey: string;
    slippageBps: number;
  }): Promise<{
    success: boolean;
    orderId?: string;
    expectedReceived?: number;
    error?: string;
  }> {
    try {
      this.logger.log(`Creating redemption order for mint: ${request.mint}`);

      // For development, simulate redemption order creation
      const mockOrderId = `redeem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        orderId: mockOrderId,
        expectedReceived: request.amount * 0.98, // Simulate 2% fee
      };
    } catch (error) {
      this.logger.error('Failed to create redemption order', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Execute redemption
   */
  async executeRedemption(request: { mint: string; amount: number }): Promise<{
    success: boolean;
    transactionSignature?: string;
    amountReceived?: number;
    error?: string;
  }> {
    try {
      this.logger.log(`Executing redemption for mint: ${request.mint}`);

      // For development, simulate redemption execution
      const mockTxSignature = `${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        transactionSignature: mockTxSignature,
        amountReceived: request.amount * 0.98, // Simulate 2% fee
      };
    } catch (error) {
      this.logger.error('Failed to execute redemption', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
