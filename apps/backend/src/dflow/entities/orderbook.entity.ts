import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class OrderbookLevel {
  @Field(() => Float)
  price: number;

  @Field(() => Float)
  shares: number;

  @Field(() => Float)
  total: number;
}

@ObjectType()
export class DFlowOrderbookGraphQL {
  @Field(() => [OrderbookLevel])
  yesBids: OrderbookLevel[];

  @Field(() => [OrderbookLevel])
  noBids: OrderbookLevel[];

  @Field(() => Float)
  spread: number;

  @Field(() => Float)
  lastPrice: number;

  @Field(() => Int)
  sequence: number;
}
