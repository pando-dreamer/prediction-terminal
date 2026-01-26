import { Field, ObjectType, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class DFlowSettlementSource {
  @Field()
  name: string;

  @Field()
  url: string;
}

@ObjectType()
export class DFlowEventMarket {
  @Field()
  ticker: string;

  @Field()
  eventTicker: string;

  @Field()
  marketType: string;

  @Field()
  title: string;

  @Field()
  subtitle: string;

  @Field()
  yesSubTitle: string;

  @Field()
  noSubTitle: string;

  @Field(() => Int)
  openTime: number;

  @Field(() => Int)
  closeTime: number;

  @Field(() => Int)
  expirationTime: number;

  @Field()
  status: string;

  @Field(() => Float)
  volume: number;

  @Field({ nullable: true })
  result?: string;

  @Field(() => Float)
  openInterest: number;

  @Field(() => Float, { nullable: true })
  yesPrice?: number;

  @Field(() => Float, { nullable: true })
  noPrice?: number;

  @Field()
  isActive: boolean;
}

@ObjectType()
export class DFlowEvent {
  @Field()
  ticker: string;

  @Field()
  seriesTicker: string;

  @Field(() => Int, { nullable: true })
  strikeDate?: number;

  @Field({ nullable: true })
  strikePeriod?: string;

  @Field()
  title: string;

  @Field()
  subtitle: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  competition?: string;

  @Field({ nullable: true })
  competitionScope?: string;

  @Field(() => [DFlowSettlementSource], { nullable: true })
  settlementSources?: DFlowSettlementSource[];

  @Field(() => Float)
  volume: number;

  @Field(() => Float)
  volume24h: number;

  @Field(() => Float)
  liquidity: number;

  @Field(() => Float)
  openInterest: number;

  @Field(() => [DFlowEventMarket], { nullable: true })
  markets?: DFlowEventMarket[];
}
