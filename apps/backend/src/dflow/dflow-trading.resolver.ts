import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';
import { DFlowTradingService } from './dflow-trading.service';
import { TradingErrorCode } from './interfaces/trading.interface';
import {
  DFlowQuoteRequestInput,
  DFlowTradeRequestInput,
} from './dto/trading-request.input';
import {
  DFlowQuoteResponse,
  DFlowOrderStatus,
  MarketMints,
  MarketQuote,
  TradeResponse,
} from './dto/trading-response.dto';

@Resolver()
export class DFlowTradingResolver {
  private readonly logger = new Logger(DFlowTradingResolver.name);

  constructor(private readonly tradingService: DFlowTradingService) {}

  @Query(() => DFlowQuoteResponse, { name: 'getDFlowQuote' })
  async getDFlowQuote(
    @Args('request') request: DFlowQuoteRequestInput
  ): Promise<DFlowQuoteResponse> {
    this.logger.log('getDFlowQuote query received');
    return this.tradingService.getQuote(request);
  }

  @Query(() => DFlowOrderStatus, { name: 'dflowOrderStatus', nullable: true })
  async dflowOrderStatus(
    @Args('signature') signature: string
  ): Promise<DFlowOrderStatus | null> {
    this.logger.log(`dflowOrderStatus query received for: ${signature}`);
    return this.tradingService.getOrderStatus(signature);
  }

  @Query(() => MarketMints, { name: 'dflowMarketMints' })
  async dflowMarketMints(
    @Args('marketId') marketId: string
  ): Promise<MarketMints> {
    this.logger.log(`dflowMarketMints query received for: ${marketId}`);
    return this.tradingService.getMarketMints(marketId);
  }

  @Query(() => MarketQuote, { name: 'dflowMarketQuote' })
  async dflowMarketQuote(
    @Args('marketId') marketId: string
  ): Promise<MarketQuote> {
    this.logger.log(`dflowMarketQuote query received for: ${marketId}`);
    return this.tradingService.getMarketQuote(marketId);
  }

  @Mutation(() => TradeResponse, { name: 'executeDFlowTrade' })
  async executeDFlowTrade(
    @Args('request') request: DFlowTradeRequestInput
  ): Promise<TradeResponse> {
    this.logger.log(
      `executeDFlowTrade mutation received: ${request.direction} ${request.amount} ${request.outcome} on ${request.market}`
    );

    try {
      // 1. Get market mints (YES/NO token addresses)
      const mints = await this.tradingService.getMarketMints(request.market);
      if (!mints) {
        throw new Error(`Market ${request.market} not found`);
      }

      // 2. Determine input/output mints based on direction and outcome
      let inputMint: string;
      let outputMint: string;
      const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

      if (request.direction === 'BUY') {
        // Buying tokens: USDC -> YES/NO token
        inputMint = USDC_MINT;
        outputMint = request.outcome === 'YES' ? mints.yesMint : mints.noMint;
      } else {
        // Selling tokens: YES/NO token -> USDC
        inputMint = request.outcome === 'YES' ? mints.yesMint : mints.noMint;
        outputMint = USDC_MINT;
      }

      // 3. Convert human-readable amount to micro units (USDC has 6 decimals)
      const amountInMicroUnits = Math.floor(
        request.amount * 1_000_000
      ).toString();

      // 4. Create order via DFlow API (this returns transaction to sign)
      const order = await this.tradingService.createOrder({
        inputMint,
        outputMint,
        amount: amountInMicroUnits,
        slippageBps: request.slippageBps,
        userPublicKey: request.userPublicKey,
      });

      // 5. Return response with order and transaction to sign
      return {
        success: true,
        signature: null, // Will be set after user signs and submits
        quote: order, // Order response has same structure as quote
      };
    } catch (error) {
      this.logger.error('Trade execution failed', error);
      return {
        success: false,
        error: {
          code: TradingErrorCode.TRANSACTION_FAILED,
          message: error.message || 'Trade execution failed',
          details: error.stack,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  @Mutation(() => Boolean, { name: 'cancelDFlowOrder' })
  async cancelDFlowOrder(
    @Args('signature') signature: string
  ): Promise<boolean> {
    this.logger.log(`cancelDFlowOrder mutation received for: ${signature}`);

    // TODO: Implement order cancellation if supported by DFlow API
    this.logger.warn('Order cancellation not yet implemented');
    return false;
  }
}
