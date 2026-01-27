import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum DFlowMarketStatus {
  INITIALIZED = 'initialized',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CLOSED = 'closed',
  DETERMINED = 'determined',
  FINALIZED = 'finalized',
  CANCELLED = 'cancelled',
}

export enum DFlowMarketType {
  BINARY = 'binary',
  CATEGORICAL = 'categorical',
}

registerEnumType(DFlowMarketStatus, {
  name: 'DFlowMarketStatus',
});

registerEnumType(DFlowMarketType, {
  name: 'DFlowMarketType',
});

@ObjectType()
export class DFlowAccount {
  @Field()
  marketLedger: string;

  @Field()
  yesMint: string;

  @Field()
  noMint: string;

  @Field()
  isInitialized: boolean;

  @Field({ nullable: true })
  redemptionStatus?: string;
}

@ObjectType()
export class DFlowMarketGraphQL {
  @Field(() => ID)
  ticker: string;

  @Field()
  eventTicker: string;

  @Field(() => DFlowMarketType)
  marketType: DFlowMarketType;

  @Field()
  title: string;

  @Field({ nullable: true })
  subtitle?: string;

  @Field()
  yesSubTitle: string;

  @Field()
  noSubTitle: string;

  @Field()
  openTime: number;

  @Field()
  closeTime: number;

  @Field()
  expirationTime: number;

  @Field(() => DFlowMarketStatus)
  status: DFlowMarketStatus;

  @Field()
  volume: number;

  @Field({ nullable: true })
  result?: string;

  @Field()
  openInterest: number;

  @Field()
  canCloseEarly: boolean;

  @Field({ nullable: true })
  earlyCloseCondition?: string;

  @Field()
  rulesPrimary: string;

  @Field({ nullable: true })
  rulesSecondary?: string;

  @Field({ nullable: true })
  yesBid?: number;

  @Field({ nullable: true })
  yesAsk?: number;

  @Field({ nullable: true })
  noBid?: number;

  @Field({ nullable: true })
  noAsk?: number;

  // For simplicity, we'll expose account info as JSON string for now
  @Field({ nullable: true })
  accountsJson?: string;

  // Computed fields for UI
  @Field({ nullable: true })
  yesPrice?: number;

  @Field({ nullable: true })
  noPrice?: number;

  @Field()
  isActive: boolean;

  @Field()
  timeUntilClose: number;

  @Field({ nullable: true })
  category?: string;
}
