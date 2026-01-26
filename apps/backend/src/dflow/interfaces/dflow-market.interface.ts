export interface DFlowAccount {
  marketLedger: string;
  yesMint: string;
  noMint: string;
  isInitialized: boolean;
  redemptionStatus: string | null;
}

export interface DFlowMarket {
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
  status: 'active' | 'closed' | 'finalized' | 'cancelled';
  volume: number;
  result?: 'yes' | 'no' | null;
  openInterest: number;
  canCloseEarly: boolean;
  earlyCloseCondition?: string;
  rulesPrimary: string;
  rulesSecondary?: string;
  yesBid?: number | null;
  yesAsk?: number | null;
  noBid?: number | null;
  noAsk?: number | null;
  accounts: Record<string, DFlowAccount>;
}

export interface DFlowMarketsResponse {
  markets: DFlowMarket[];
}

export interface DFlowApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface DFlowMarketFilter {
  limit?: number;
  offset?: number;
  sort?: 'volume' | 'created' | 'close_time';
  order?: 'asc' | 'desc';
  status?: string[];
  search?: string;
}
