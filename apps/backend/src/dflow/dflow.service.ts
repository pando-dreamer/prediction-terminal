import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DFlowMarket,
  DFlowMarketsResponse,
  DFlowMarketFilter,
  DFlowApiError,
} from './interfaces/dflow-market.interface';

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
      'https://prediction-markets-api.dflow.net';
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
    options: RequestInit = {}
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
          const ttl = endpoint.includes('/markets')
            ? this.MARKETS_CACHE_TTL
            : this.DEFAULT_CACHE_TTL;
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

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      await this.getMarkets({ limit: 1 });
      return true;
    } catch {
      return false;
    }
  }
}
