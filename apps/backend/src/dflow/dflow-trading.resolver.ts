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
      // TODO: Implement full trade execution flow:
      // 1. Resolve market to get mints (YES/NO token addresses)
      // 2. Convert human-readable amount to micro units
      // 3. Call createOrder from trading service
      // 4. Return response with transaction to sign

      // For now, return error indicating implementation needed
      return {
        success: false,
        error: {
          code: TradingErrorCode.API_ERROR,
          message: 'Trade execution not yet fully implemented',
          timestamp: new Date().toISOString(),
        },
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
