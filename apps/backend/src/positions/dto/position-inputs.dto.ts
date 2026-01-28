import { InputType, Field, Float, Int } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

@InputType()
export class RedemptionRequestInput {
  @Field()
  @IsString()
  positionId: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  slippageBps?: number;

  @Field()
  @IsString()
  userPublicKey: string;
}

@InputType()
export class PortfolioSettingsInput {
  @Field()
  @IsString()
  walletAddress: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(30)
  autoRefreshInterval?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  priceAlerts?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;
}

@InputType()
export class PositionFiltersInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  marketStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  outcome?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  redeemableOnly?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minValue?: number;
}
