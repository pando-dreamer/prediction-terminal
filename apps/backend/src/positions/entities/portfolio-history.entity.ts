import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { RiskLevel } from './user-position.entity';

@ObjectType()
@Entity('portfolio_history')
@Index(['walletAddress', 'snapshotDate'], { unique: true })
export class PortfolioHistory {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'user_id' })
  userId: string;

  @Field()
  @Column({ name: 'wallet_address', length: 44 })
  walletAddress: string;

  // Daily Snapshot
  @Field()
  @Column({ name: 'snapshot_date', type: 'date' })
  snapshotDate: Date;

  @Field(() => Float)
  @Column({ name: 'total_value', type: 'decimal', precision: 20, scale: 6 })
  totalValue: number;

  @Field(() => Float)
  @Column({
    name: 'daily_pnl',
    type: 'decimal',
    precision: 20,
    scale: 6,
    default: 0,
  })
  dailyPnL: number;

  @Field(() => Float)
  @Column({
    name: 'cumulative_pnl',
    type: 'decimal',
    precision: 20,
    scale: 6,
    default: 0,
  })
  cumulativePnL: number;

  @Field(() => Int)
  @Column({ name: 'position_count', default: 0 })
  positionCount: number;

  @Field(() => Float)
  @Column({
    name: 'net_deposits',
    type: 'decimal',
    precision: 20,
    scale: 6,
    default: 0,
  })
  netDeposits: number;

  // Performance Metrics
  @Field(() => Float, { nullable: true })
  @Column({
    name: 'win_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  winRate?: number;

  @Field(() => Float, { nullable: true })
  @Column({
    name: 'portfolio_return',
    type: 'decimal',
    precision: 8,
    scale: 4,
    nullable: true,
  })
  portfolioReturn?: number;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
