import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class DFlowQuoteRequestInput {
  @Field()
  inputMint: string;

  @Field()
  outputMint: string;

  @Field()
  amount: string;

  @Field(() => Int)
  slippageBps: number;

  @Field()
  userPublicKey: string;
}

@InputType()
export class DFlowTradeRequestInput {
  @Field()
  market: string;

  @Field()
  outcome: string; // 'YES' | 'NO'

  @Field()
  direction: string; // 'BUY' | 'SELL'

  @Field()
  amount: number;

  @Field(() => Int)
  slippageBps: number;

  @Field()
  userPublicKey: string;
}
