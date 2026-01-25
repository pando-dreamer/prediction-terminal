import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { MarketCategory } from '../entities/market.entity';

@InputType()
export class CreateMarketInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => MarketCategory)
  @IsEnum(MarketCategory)
  category: MarketCategory;

  @Field()
  @IsDateString()
  expiryDate: Date;

  @Field({ nullable: true })
  @IsOptional()
  currentPrice?: number;
}
