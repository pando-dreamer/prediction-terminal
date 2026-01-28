import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { OutcomeType } from './user-position.entity';

export enum PriceSource {
  DFLOW_API = 'DFLOW_API',
  CALCULATED = 'CALCULATED',
  CACHED = 'CACHED',
}

@ObjectType()
@Entity('price_cache')
@Index(['marketId', 'outcome'], { unique: true })
@Index(['marketId'])
@Index(['expiresAt'])
export class PriceCache {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'market_id', length: 100 })
  marketId: string;

  @Field(() => OutcomeType)
  @Column({ type: 'varchar', length: 3 })
  outcome: OutcomeType;

  // Price Data
  @Field(() => Float)
  @Column({ name: 'current_price', type: 'decimal', precision: 20, scale: 6 })
  currentPrice: number;

  @Field(() => Float)
  @Column({
    name: 'price_change_24h',
    type: 'decimal',
    precision: 20,
    scale: 6,
    default: 0,
  })
  priceChange24h: number;

  @Field(() => Float)
  @Column({
    name: 'price_change_percent_24h',
    type: 'decimal',
    precision: 8,
    scale: 4,
    default: 0,
  })
  priceChangePercent24h: number;

  @Field(() => Float)
  @Column({
    name: 'volume_24h',
    type: 'decimal',
    precision: 20,
    scale: 6,
    default: 0,
  })
  volume24h: number;

  // Cache Metadata
  @Field()
  @Column({ type: 'varchar', length: 20, default: 'DFLOW_API' })
  source: PriceSource;

  @Field()
  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated: Date;

  @Field({ nullable: true })
  @Column({ name: 'expires_at', nullable: true })
  expiresAt?: Date;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
