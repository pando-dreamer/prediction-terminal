// ==============================================================================
// DFLOW TRADING INTERFACES
// ==============================================================================
// Based on Sprint 2 Data Design - Validated against actual DFlow API responses

// ==============================================================================
// EXECUTION MODE & ORDER STATUS TYPES
// ==============================================================================

export type ExecutionMode = 'sync' | 'async';

export type OrderStatus = 'open' | 'pendingClose' | 'closed' | 'failed';

export type OutcomeType = 'YES' | 'NO';

export type TradeDirection = 'BUY' | 'SELL';

// ==============================================================================
// QUOTE INTERFACES
// ==============================================================================

export interface DFlowQuoteRequest {
  inputMint: string; // Token mint address (e.g., USDC)
  outputMint: string; // Target token mint (e.g., YES token)
  amount: string; // Amount in micro units (string for precision)
  slippageBps: number; // Slippage tolerance in basis points
  userPublicKey: string; // User's wallet public key
}

export interface DFlowQuoteResponse {
  inputMint: string;
  inAmount: string; // Actual input amount (micro units)
  outputMint: string;
  outAmount: string; // Expected output amount (micro units)
  otherAmountThreshold: string; // Minimum acceptable output
  minOutAmount: string; // Absolute minimum output
  slippageBps: number; // Actual slippage applied
  predictionMarketSlippageBps: number; // Market-specific slippage
  platformFee: string | null; // Platform fee amount
  priceImpactPct: string; // Price impact percentage
  contextSlot: number; // Solana slot context
  executionMode: ExecutionMode; // 'sync' | 'async'
  revertMint: string; // Fallback mint
  transaction: string; // Base64 encoded transaction
  lastValidBlockHeight: number; // Transaction expiry
  prioritizationFeeLamports: number; // Priority fee
  computeUnitLimit: number; // Compute budget
  prioritizationType?: {
    computeBudget: {
      microLamports: number;
      estimatedMicroLamports: number;
    };
  };
}

// ==============================================================================
// ORDER INTERFACES
// ==============================================================================

export interface DFlowOrderRequest extends DFlowQuoteRequest {
  // Same as quote request - order creation uses same params
}

export interface DFlowOrderResponse extends DFlowQuoteResponse {
  // Same as quote response - includes transaction to sign
}

export interface DFlowOrderStatus {
  status: string; // Order status: open, closed, failed, etc.
  inAmount?: string; // Total input amount
  outAmount?: string; // Total output amount
  fills: DFlowOrderFill[]; // List of fills
}

export interface DFlowOrderFill {
  signature: string; // Transaction signature
  inputMint: string; // Input token mint
  inAmount: string; // Amount of input token
  outputMint: string; // Output token mint
  outAmount: string; // Amount of output token received
}

// ==============================================================================
// TRADING OPERATION INTERFACES
// ==============================================================================

export interface TradeRequest {
  market: string; // Market identifier (ticker or ID)
  outcome: OutcomeType; // 'YES' | 'NO'
  direction: TradeDirection; // 'BUY' | 'SELL'
  amount: number; // Human-readable amount (USDC)
  slippageBps: number; // Slippage tolerance
  userPublicKey: string; // User's wallet address
}

export interface TradeResponse {
  success: boolean;
  signature?: string; // Transaction signature if successful
  quote?: DFlowQuoteResponse; // Quote used for trade
  error?: TradingError; // Error details if failed
  estimatedGas?: number; // Gas estimate
}

// ==============================================================================
// MARKET DATA INTERFACES
// ==============================================================================

export interface MarketMints {
  baseMint: string; // USDC mint
  yesMint: string; // YES token mint
  noMint: string; // NO token mint
  marketId: string; // Market identifier
}

export interface MarketQuote {
  marketId: string;
  yesPrice: number; // YES token price (0-1)
  noPrice: number; // NO token price (0-1)
  volume24h: number; // 24h volume in USDC
  liquidity: number; // Available liquidity
  lastUpdate: string; // Last price update
}

// ==============================================================================
// ERROR INTERFACES
// ==============================================================================

export enum TradingErrorCode {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  SLIPPAGE_EXCEEDED = 'SLIPPAGE_EXCEEDED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_MARKET = 'INVALID_MARKET',
  API_ERROR = 'API_ERROR',
}

export interface TradingError {
  code: TradingErrorCode;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: any;
}

// ==============================================================================
// CONFIGURATION INTERFACES
// ==============================================================================

export interface TradingConfig {
  defaultSlippageBps: number; // Default slippage (100 = 1%)
  maxSlippageBps: number; // Maximum allowed slippage
  quoteRefreshIntervalMs: number; // Quote refresh rate
  statusPollIntervalMs: number; // Status polling rate
  transactionTimeoutMs: number; // Transaction timeout
  retryAttempts: number; // Retry attempts for failed operations
}

export interface NetworkConfig {
  rpcUrl: string; // Solana RPC endpoint
  commitment: 'processed' | 'confirmed' | 'finalized';
  network: 'mainnet-beta' | 'devnet' | 'testnet';
}

// ==============================================================================
// UTILITY TYPES
// ==============================================================================

export type MarketIdentifier = string; // ticker or mint address
export type WalletAddress = string; // Base58 encoded
export type TokenMint = string; // Token mint address
export type MicroAmount = string; // Amount in micro units (for precision)
export type Signature = string; // Transaction signature
