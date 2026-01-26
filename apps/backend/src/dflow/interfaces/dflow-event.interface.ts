// Import the market status from the market entity to avoid duplication
import { DFlowMarketStatus } from '../entities/dflow-market.entity';

export enum DFlowEventSort {
  VOLUME = 'volume',
  VOLUME_24H = 'volume24h',
  LIQUIDITY = 'liquidity',
  OPEN_INTEREST = 'openInterest',
  START_DATE = 'startDate',
}

// Re-export DFlowMarketStatus for convenience
export { DFlowMarketStatus };

export interface DFlowEvent {
  ticker: string;
  seriesTicker: string;
  strikeDate: number | null;
  strikePeriod: string | null;
  title: string;
  subtitle: string;
  imageUrl?: string;
  competition?: string;
  competitionScope?: string;
  settlementSources?: Array<{
    name: string;
    url: string;
  }>;
  volume: number;
  volume24h: number;
  liquidity: number;
  openInterest: number;
  markets?: Array<{
    ticker: string;
    eventTicker: string;
    marketType: string;
    title: string;
    subtitle: string;
    yesSubTitle: string;
    noSubTitle: string;
    openTime: number;
    closeTime: number;
    expirationTime: number;
    status: string;
    volume: number;
    result?: string;
    openInterest: number;
    yesPrice?: number;
    noPrice?: number;
    isActive: boolean;
  }>;
}

export interface DFlowEventsResponse {
  events: DFlowEvent[];
}

export interface DFlowEventFilter {
  limit?: number;
  offset?: number;
  sort?: DFlowEventSort;
  status?: DFlowMarketStatus[];
  search?: string;
  category?: string;
  withNestedMarkets?: boolean;
}

export interface DFlowSearchResponse {
  events: DFlowEvent[];
  markets?: any[];
}
