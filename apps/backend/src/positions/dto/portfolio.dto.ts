import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { RiskLevel } from '../entities/user-position.entity';

@ObjectType()
export class PortfolioSummary {
  // Basic Metrics
  @Field(() => Int)
  totalPositions: number;

  @Field(() => Int)
  activePositions: number;

  @Field(() => Int)
  resolvedPositions: number;

  // Value Metrics
  @Field(() => Float)
  totalValue: number;

  @Field(() => Float)
  totalCostBasis: number;

  @Field(() => Float)
  availableBalance: number;

  // P&L Metrics
  @Field(() => Float)
  totalUnrealizedPnL: number;

  @Field(() => Float)
  totalRealizedPnL: number;

  @Field(() => Float)
  netPnL: number;

  @Field(() => Float)
  portfolioReturn: number;

  // Redeemable Positions
  @Field(() => Int)
  redeemablePositions: number;

  @Field(() => Float)
  redeemableValue: number;

  // Performance Metrics
  @Field(() => Float)
  winRate: number;

  @Field(() => Float)
  averagePositionSize: number;

  @Field(() => Float)
  largestPosition: number;

  @Field(() => Float)
  averageHoldingPeriod: number;

  // Risk Metrics
  @Field(() => RiskLevel)
  portfolioRisk: RiskLevel;

  @Field(() => Float)
  diversificationScore: number;

  // Time-based Metrics
  @Field(() => Float)
  dailyPnL: number;

  @Field(() => Float)
  weeklyPnL: number;

  @Field(() => Float)
  monthlyPnL: number;
}

@ObjectType()
export class RefreshResult {
  @Field()
  success: boolean;

  @Field(() => Int)
  positionsFound: number;

  @Field(() => Int)
  positionsUpdated: number;

  @Field(() => [String])
  errors: string[];

  @Field()
  lastRefresh: Date;
}

@ObjectType()
export class PriceData {
  @Field()
  marketId: string;

  @Field()
  outcome: string;

  @Field(() => Float)
  currentPrice: number;

  @Field(() => Float)
  priceChange24h: number;

  @Field(() => Float)
  priceChangePercent24h: number;

  @Field(() => Float)
  volume24h: number;

  @Field()
  lastUpdated: Date;

  @Field()
  source: string;
}
