import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class RedemptionResult {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  transactionSignature?: string;

  @Field(() => Float, { nullable: true })
  amountRedeemed?: number;

  @Field(() => Float, { nullable: true })
  amountReceived?: number;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  orderId?: string;
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
  retryable: boolean;
}
