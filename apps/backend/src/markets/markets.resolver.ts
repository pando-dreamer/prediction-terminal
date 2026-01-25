import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { MarketsService } from './markets.service';
import { Market } from './entities/market.entity';
import { CreateMarketInput } from './dto/create-market.input';

@Resolver(() => Market)
export class MarketsResolver {
  constructor(private readonly marketsService: MarketsService) {}

  @Mutation(() => Market)
  createMarket(
    @Args('createMarketInput') createMarketInput: CreateMarketInput
  ) {
    return this.marketsService.create(createMarketInput);
  }

  @Query(() => [Market], { name: 'markets' })
  findAll() {
    return this.marketsService.findAll();
  }

  @Query(() => [Market], { name: 'activeMarkets' })
  findActive() {
    return this.marketsService.findActive();
  }

  @Query(() => Market, { name: 'market' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.marketsService.findOne(id);
  }

  @Mutation(() => Market)
  resolveMarket(
    @Args('id', { type: () => ID }) id: string,
    @Args('outcome') outcome: boolean
  ) {
    return this.marketsService.resolveMarket(id, outcome);
  }
}
