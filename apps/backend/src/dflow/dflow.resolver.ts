import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { DFlowService } from './dflow.service';
import {
  DFlowMarketGraphQL,
  DFlowMarketStatus,
} from './entities/dflow-market.entity';
import {
  DFlowEvent,
  DFlowEventSortGraphQL,
} from './entities/dflow-event.entity';
import { DFlowOrderbookGraphQL } from './entities/orderbook.entity';
import { DFlowMarket } from './interfaces/dflow-market.interface';
import {
  DFlowEvent as IDFlowEvent,
  DFlowEventSort,
  DFlowMarketStatus as IMarketStatus,
} from './interfaces/dflow-event.interface';

@Resolver(() => DFlowMarketGraphQL)
export class DFlowResolver {
  constructor(private readonly dflowService: DFlowService) {}

  @Query(() => [DFlowMarketGraphQL], { name: 'dflowMarkets' })
  async findAllDFlowMarkets(
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('category', { type: () => String, nullable: true }) category?: string
  ): Promise<DFlowMarketGraphQL[]> {
    let markets: DFlowMarket[];

    if (search) {
      markets = await this.dflowService.searchMarkets(search, limit);
    } else if (category) {
      markets = await this.dflowService.getMarketsByCategory(category, limit);
    } else {
      markets = await this.dflowService.getActiveMarkets(limit || 50);
    }

    return markets.map(market => this.transformToGraphQL(market));
  }

  @Query(() => [DFlowMarketGraphQL], { name: 'activeDFlowMarkets' })
  async findActiveDFlowMarkets(
    @Args('limit', { type: () => Number, nullable: true }) limit?: number
  ): Promise<DFlowMarketGraphQL[]> {
    const markets = await this.dflowService.getActiveMarkets(limit || 20);
    return markets.map(market => this.transformToGraphQL(market));
  }

  @Query(() => DFlowMarketGraphQL, { name: 'dflowMarket', nullable: true })
  async findOneDFlowMarket(
    @Args('ticker', { type: () => ID }) ticker: string
  ): Promise<DFlowMarketGraphQL | null> {
    const market = await this.dflowService.getMarketByTicker(ticker);
    return market ? this.transformToGraphQL(market) : null;
  }

  @Query(() => [DFlowMarketGraphQL], { name: 'searchDFlowMarkets' })
  async searchDFlowMarkets(
    @Args('query') query: string,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number
  ): Promise<DFlowMarketGraphQL[]> {
    const markets = await this.dflowService.searchMarkets(query, limit || 20);
    return markets.map(market => this.transformToGraphQL(market));
  }

  @Query(() => [DFlowEvent], { name: 'dflowEvents' })
  async findAllDFlowEvents(
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('offset', { type: () => Number, nullable: true }) offset?: number,
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('sort', { type: () => DFlowEventSortGraphQL, nullable: true })
    sort?: DFlowEventSortGraphQL,
    @Args('status', { type: () => DFlowMarketStatus, nullable: true })
    status?: DFlowMarketStatus,
    @Args('withNestedMarkets', { type: () => Boolean, nullable: true })
    withNestedMarkets?: boolean
  ): Promise<DFlowEvent[]> {
    const events = await this.dflowService.getEvents({
      limit: limit || 20,
      offset: offset || 0,
      search,
      status: status ? [status] : undefined,
      sort: (sort as unknown as DFlowEventSort) || DFlowEventSort.VOLUME_24H,
      withNestedMarkets: withNestedMarkets ?? true,
    });

    return events.map(event => this.transformEventToGraphQL(event));
  }

  @Query(() => [DFlowEvent], { name: 'activeDFlowEvents' })
  async findActiveDFlowEvents(
    @Args('limit', { type: () => Number, nullable: true }) limit?: number
  ): Promise<DFlowEvent[]> {
    const events = await this.dflowService.getActiveEvents(limit || 20);
    return events.map(event => this.transformEventToGraphQL(event));
  }

  @Query(() => DFlowEvent, { name: 'dflowEvent', nullable: true })
  async findOneDFlowEvent(
    @Args('ticker', { type: () => ID }) ticker: string
  ): Promise<DFlowEvent | null> {
    const event = await this.dflowService.getEventByTicker(ticker);
    return event ? this.transformEventToGraphQL(event) : null;
  }

  @Query(() => [DFlowEvent], { name: 'searchDFlow' })
  async searchDFlow(
    @Args('query') query: string,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('offset', { type: () => Number, nullable: true }) offset?: number,
    @Args('withNestedMarkets', { type: () => Boolean, nullable: true })
    withNestedMarkets?: boolean,
    @Args('withNestedAccounts', { type: () => Boolean, nullable: true })
    withNestedAccounts?: boolean
  ): Promise<DFlowEvent[]> {
    const response = await this.dflowService.search(
      query,
      limit || 10,
      withNestedMarkets ?? true,
      withNestedAccounts ?? true,
      offset || 0
    );
    return response.events.map(event => this.transformEventToGraphQL(event));
  }

  @Query(() => DFlowOrderbookGraphQL, {
    name: 'dflowOrderbook',
    nullable: true,
  })
  async getDFlowOrderbook(
    @Args('ticker', { type: () => ID }) ticker: string
  ): Promise<DFlowOrderbookGraphQL | null> {
    return this.dflowService.getOrderbook(ticker);
  }

  private transformToGraphQL(market: DFlowMarket): DFlowMarketGraphQL {
    const now = Math.floor(Date.now() / 1000);

    // Calculate pricing from bid/ask if available - ensure we handle null/undefined properly
    let yesPrice: number | null = null;
    if (
      typeof market.yesAsk === 'number' &&
      typeof market.yesBid === 'number' &&
      !isNaN(market.yesAsk) &&
      !isNaN(market.yesBid)
    ) {
      yesPrice = (market.yesAsk + market.yesBid) / 2;
    } else if (typeof market.yesAsk === 'number' && !isNaN(market.yesAsk)) {
      yesPrice = market.yesAsk;
    } else if (typeof market.yesBid === 'number' && !isNaN(market.yesBid)) {
      yesPrice = market.yesBid;
    }

    let noPrice: number | null = null;
    if (
      typeof market.noAsk === 'number' &&
      typeof market.noBid === 'number' &&
      !isNaN(market.noAsk) &&
      !isNaN(market.noBid)
    ) {
      noPrice = (market.noAsk + market.noBid) / 2;
    } else if (typeof market.noAsk === 'number' && !isNaN(market.noAsk)) {
      noPrice = market.noAsk;
    } else if (typeof market.noBid === 'number' && !isNaN(market.noBid)) {
      noPrice = market.noBid;
    }

    // Determine category from ticker/title patterns
    const category = this.detectCategory(market);

    return {
      ticker: market.ticker,
      eventTicker: market.eventTicker,
      marketType: market.marketType as any,
      title: market.title,
      subtitle: market.subtitle || undefined,
      yesSubTitle: market.yesSubTitle,
      noSubTitle: market.noSubTitle,
      openTime: market.openTime,
      closeTime: market.closeTime,
      expirationTime: market.expirationTime,
      status: market.status as any,
      volume: market.volume,
      result: market.result || undefined,
      openInterest: market.openInterest,
      canCloseEarly: market.canCloseEarly,
      earlyCloseCondition: market.earlyCloseCondition || undefined,
      rulesPrimary: market.rulesPrimary,
      rulesSecondary: market.rulesSecondary || undefined,
      yesBid: market.yesBid,
      yesAsk: market.yesAsk,
      noBid: market.noBid,
      noAsk: market.noAsk,
      accountsJson: JSON.stringify(market.accounts),
      yesPrice,
      noPrice,
      isActive: market.status === 'active' && now < market.closeTime,
      timeUntilClose: Math.max(0, market.closeTime - now),
      category,
    };
  }

  private detectCategory(market: DFlowMarket): string {
    const text =
      `${market.title} ${market.ticker} ${market.eventTicker}`.toLowerCase();

    if (
      text.includes('pres') ||
      text.includes('president') ||
      text.includes('election')
    ) {
      return 'Politics';
    }
    if (
      text.includes('boxing') ||
      text.includes('sport') ||
      text.includes('football') ||
      text.includes('basketball')
    ) {
      return 'Sports';
    }
    if (
      text.includes('bitcoin') ||
      text.includes('btc') ||
      text.includes('crypto') ||
      text.includes('eth')
    ) {
      return 'Crypto';
    }
    if (
      text.includes('oscar') ||
      text.includes('movie') ||
      text.includes('celebrity') ||
      text.includes('emmy')
    ) {
      return 'Entertainment';
    }

    return 'Other';
  }

  private transformEventToGraphQL(event: IDFlowEvent): DFlowEvent {
    return {
      ticker: event.ticker,
      seriesTicker: event.seriesTicker,
      strikeDate: event.strikeDate,
      strikePeriod: event.strikePeriod,
      title: event.title,
      subtitle: event.subtitle,
      imageUrl: event.imageUrl,
      competition: event.competition,
      competitionScope: event.competitionScope,
      settlementSources: event.settlementSources,
      volume: event.volume,
      volume24h: event.volume24h,
      liquidity: event.liquidity,
      openInterest: event.openInterest,
      markets: event.markets?.map(market => ({
        ticker: market.ticker,
        eventTicker: market.eventTicker,
        marketType: market.marketType,
        title: market.title,
        subtitle: market.subtitle,
        yesSubTitle: market.yesSubTitle,
        noSubTitle: market.noSubTitle,
        openTime: market.openTime,
        closeTime: market.closeTime,
        expirationTime: market.expirationTime,
        status: market.status,
        volume: market.volume,
        result: market.result,
        openInterest: market.openInterest,
        yesPrice: market.yesAsk || market.yesBid,
        noPrice: market.noAsk || market.noBid,
        isActive: market.isActive || market.status === 'active',
      })),
    };
  }
}
