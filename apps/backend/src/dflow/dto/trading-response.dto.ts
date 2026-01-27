import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DFlowQuoteResponse {
  @Field()
  inputMint: string;

  @Field()
  inAmount: string;

  @Field()
  outputMint: string;

  @Field()
  outAmount: string;

  @Field()
  otherAmountThreshold: string;

  @Field()
  minOutAmount: string;

  @Field(() => Int)
  slippageBps: number;

  @Field(() => Int)
  predictionMarketSlippageBps: number;

  @Field({ nullable: true })
  platformFee?: string;

  @Field()
  priceImpactPct: string;

  @Field(() => Int)
  contextSlot: number;

  @Field()
  executionMode: string;

  @Field()
  revertMint: string;

  @Field()
  transaction: string;

  @Field(() => Int)
  lastValidBlockHeight: number;

  @Field(() => Int)
  prioritizationFeeLamports: number;

  @Field(() => Int)
  computeUnitLimit: number;
}

@ObjectType()
export class DFlowOrderFill {
  @Field()
  signature: string;

  @Field()
  inputMint: string;

  @Field()
  inAmount: string;

  @Field()
  outputMint: string;

  @Field()
  outAmount: string;
}

@ObjectType()
export class DFlowOrderStatus {
  @Field()
  status: string;

  @Field({ nullable: true })
  inAmount?: string;

  @Field({ nullable: true })
  outAmount?: string;

  @Field(() => [DFlowOrderFill])
  fills: DFlowOrderFill[];
}

@ObjectType()
export class TradingError {
  @Field()
  code: string;

  @Field()
  message: string;

  @Field({ nullable: true })
  details?: string;

  @Field()
  timestamp: string;
}

@ObjectType()
export class TradeResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  signature?: string;

  @Field(() => DFlowQuoteResponse, { nullable: true })
  quote?: DFlowQuoteResponse;

  @Field(() => TradingError, { nullable: true })
  error?: TradingError;

  @Field(() => Int, { nullable: true })
  estimatedGas?: number;
}

@ObjectType()
export class MarketMints {
  @Field()
  baseMint: string;

  @Field()
  yesMint: string;

  @Field()
  noMint: string;

  @Field()
  marketId: string;
}

@ObjectType()
export class MarketQuote {
  @Field()
  marketId: string;

  @Field()
  yesPrice: number;

  @Field()
  noPrice: number;

  @Field()
  volume24h: number;

  @Field()
  liquidity: number;

  @Field()
  lastUpdate: string;
}
