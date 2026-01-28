import { Injectable, Logger } from '@nestjs/common';
import {
  DFlowQuoteRequest,
  DFlowQuoteResponse,
  DFlowOrderRequest,
  DFlowOrderResponse,
  DFlowOrderStatus,
  MarketMints,
  MarketQuote,
  TradingError,
  TradingErrorCode,
} from './interfaces/trading.interface';
import { DFlowService } from './dflow.service';

@Injectable()
export class DFlowTradingService {
  private readonly logger = new Logger(DFlowTradingService.name);
  private readonly apiBaseUrl: string;
  private readonly apiKey?: string;

  constructor(private readonly dflowService: DFlowService) {
    this.apiBaseUrl =
      process.env.DFLOW_QUOTE_ENDPOINT || 'https://api.dflow.trade';
    this.apiKey = process.env.DFLOW_API_KEY;
  }

  /**
   * Get a quote for a trade
   */
  async getQuote(request: DFlowQuoteRequest): Promise<DFlowQuoteResponse> {
    try {
      this.logger.log(
        `Getting quote: ${request.inputMint} -> ${request.outputMint}, amount: ${request.amount}`
      );

      const queryParams = new URLSearchParams({
        inputMint: request.inputMint,
        outputMint: request.outputMint,
        amount: request.amount,
        slippageBps: request.slippageBps.toString(),
        predictionMarketSlippageBps: 'auto',
        userPublicKey: request.userPublicKey,
      });

      const response = await fetch(
        `${this.apiBaseUrl}/quote?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey && { 'x-api-key': this.apiKey }),
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Quote request failed: ${response.status} ${response.statusText}`
        );
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      this.logger.log('Quote retrieved successfully');
      return data;
    } catch (error) {
      this.logger.error('Failed to get quote', error);
      throw this.handleError(error, TradingErrorCode.API_ERROR);
    }
  }

  /**
   * Create an order (same as quote but committed)
   */
  async createOrder(request: DFlowOrderRequest): Promise<DFlowOrderResponse> {
    try {
      this.logger.log(
        `Creating order: ${request.inputMint} -> ${request.outputMint}, amount: ${request.amount}`
      );

      const queryParams = new URLSearchParams({
        inputMint: request.inputMint,
        outputMint: request.outputMint,
        amount: request.amount,
        slippageBps: request.slippageBps.toString(),
        predictionMarketSlippageBps: 'auto',
        userPublicKey: request.userPublicKey,
      });

      const response = await fetch(
        `${this.apiBaseUrl}/order?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey && { 'x-api-key': this.apiKey }),
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Order creation failed: ${response.status} ${response.statusText}`
        );
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      this.logger.log('Order created successfully');
      return data;
    } catch (error) {
      this.logger.error('Failed to create order', error);
      throw this.handleError(error, TradingErrorCode.API_ERROR);
    }
  }

  /**
   * Get order status by signature
   */
  async getOrderStatus(signature: string): Promise<DFlowOrderStatus | null> {
    try {
      this.logger.log(`Checking order status: ${signature}`);

      const queryParams = new URLSearchParams({
        signature,
      });

      const response = await fetch(
        `${this.apiBaseUrl}/order-status?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey && { 'x-api-key': this.apiKey }),
          },
        }
      );

      if (response.status === 404) {
        this.logger.warn(`Order not found: ${signature}`);
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Order status request failed: ${response.status} ${response.statusText}`
        );
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      this.logger.log(`Order status: ${data.status}`);
      return data;
    } catch (error) {
      this.logger.error('Failed to get order status', error);
      throw this.handleError(error, TradingErrorCode.API_ERROR);
    }
  }

  /**
   * Get market mints for trading
   * Fetches the market data and extracts YES/NO token mint addresses
   */
  async getMarketMints(marketId: string): Promise<MarketMints> {
    try {
      this.logger.log(`Getting market mints for: ${marketId}`);

      // Fetch market data using DFlowService
      const market = await this.dflowService.getMarketByTicker(marketId);

      if (!market) {
        throw new Error(`Market ${marketId} not found`);
      }

      // USDC mint address
      const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

      // Get the account for USDC trading
      const usdcAccount = market.accounts?.[USDC_MINT];

      if (!usdcAccount) {
        throw new Error(
          `Market ${marketId} does not have USDC trading account`
        );
      }

      this.logger.log(
        `Found mints for ${marketId}: YES=${usdcAccount.yesMint}, NO=${usdcAccount.noMint}`
      );

      return {
        baseMint: USDC_MINT,
        yesMint: usdcAccount.yesMint,
        noMint: usdcAccount.noMint,
        marketId,
      };
    } catch (error) {
      this.logger.error('Failed to get market mints', error);
      throw this.handleError(error, TradingErrorCode.INVALID_MARKET);
    }
  }

  /**
   * Get current market quote/pricing
   * Note: This may need to be implemented based on DFlow's market API
   */
  async getMarketQuote(marketId: string): Promise<MarketQuote> {
    try {
      this.logger.log(`Getting market quote for: ${marketId}`);

      // TODO: Implement based on DFlow's market data API
      // For now, return placeholder structure
      throw new Error('Market quote API not yet implemented');
    } catch (error) {
      this.logger.error('Failed to get market quote', error);
      throw this.handleError(error, TradingErrorCode.INVALID_MARKET);
    }
  }

  /**
   * Handle errors and create TradingError objects
   */
  private handleError(error: any, defaultCode: TradingErrorCode): Error {
    const tradingError: TradingError = {
      code: defaultCode,
      message: error.message || 'An unexpected error occurred',
      details: error.stack || error,
      timestamp: new Date().toISOString(),
    };

    return new Error(JSON.stringify(tradingError));
  }
}
