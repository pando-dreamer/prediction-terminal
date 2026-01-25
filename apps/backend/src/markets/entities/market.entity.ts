import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum MarketStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  RESOLVED = 'RESOLVED',
}

export enum MarketCategory {
  SPORTS = 'SPORTS',
  POLITICS = 'POLITICS',
  CRYPTO = 'CRYPTO',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHER = 'OTHER',
}

registerEnumType(MarketStatus, {
  name: 'MarketStatus',
});

registerEnumType(MarketCategory, {
  name: 'MarketCategory',
});

@ObjectType()
@Entity('markets')
export class Market {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column('text')
  description: string;

  @Field(() => MarketCategory)
  @Column({ type: 'enum', enum: MarketCategory })
  category: MarketCategory;

  @Field(() => MarketStatus)
  @Column({ type: 'enum', enum: MarketStatus, default: MarketStatus.ACTIVE })
  status: MarketStatus;

  @Field()
  @Column('timestamp')
  expiryDate: Date;

  @Field({ nullable: true })
  @Column('timestamp', { nullable: true })
  resolvedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  outcome: boolean;

  @Field()
  @Column('decimal', { precision: 10, scale: 2, default: 50.0 })
  currentPrice: number;

  @Field()
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalVolume: number;

  @Field()
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalLiquidity: number;

  @OneToMany('Position', 'market')
  positions: any[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
