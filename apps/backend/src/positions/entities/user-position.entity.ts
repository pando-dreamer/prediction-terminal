import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import {
  ObjectType,
  Field,
  ID,
  Float,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { PositionTrade } from './position-trade.entity';

export enum OutcomeType {
  YES = 'YES',
  NO = 'NO',
}

export enum PositionMarketStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  SETTLED = 'SETTLED',
  CANCELLED = 'CANCELLED',
}

export enum PositionType {
  PREDICTION = 'PREDICTION',
  BINARY = 'BINARY',
  CATEGORICAL = 'CATEGORICAL',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

// Register enums for GraphQL
registerEnumType(OutcomeType, { name: 'OutcomeType' });
registerEnumType(PositionMarketStatus, { name: 'PositionMarketStatus' });
registerEnumType(PositionType, { name: 'PositionType' });
registerEnumType(RiskLevel, { name: 'RiskLevel' });

@ObjectType()
@Entity('user_positions')
@Index(['walletAddress', 'mint'], { unique: true })
@Index(['walletAddress'])
@Index(['marketId'])
@Index(['marketStatus'])
@Index(['isRedeemable'], { where: 'is_redeemable = true' })
export class UserPosition {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'user_id' })
  userId: string;

  @Field()
  @Column({ name: 'wallet_address', length: 44 })
  walletAddress: string;

  // Token Information
  @Field()
  @Column({ length: 44 })
  mint: string;

  @Field(() => Float)
  @Column('decimal', { precision: 20, scale: 9 })
  balance: number;

  @Field()
  @Column({ name: 'balance_raw', length: 100 })
  balanceRaw: string;

  @Field(() => Int)
  @Column('smallint')
  decimals: number;

  // Market Information
  @Field()
  @Column({ name: 'market_id', length: 100 })
  marketId: string;

  @Field()
  @Column({ name: 'market_title', type: 'text' })
  marketTitle: string;

  @Field(() => OutcomeType)
  @Column({ type: 'varchar', length: 3 })
  outcome: OutcomeType;

  @Field()
  @Column({ name: 'base_mint', length: 44 })
  baseMint: string;

  // Position Metrics
  @Field(() => Float, { nullable: true })
  @Column({
    name: 'entry_price',
    type: 'decimal',
    precision: 20,
    scale: 6,
    nullable: true,
  })
  entryPrice?: number;

  @Field(() => Float, { nullable: true })
  @Column({
    name: 'current_price',
    type: 'decimal',
    precision: 20,
    scale: 6,
    nullable: true,
  })
  currentPrice?: number;

  @Field(() => Float, { nullable: true })
  @Column({
    name: 'market_price',
    type: 'decimal',
    precision: 20,
    scale: 6,
    nullable: true,
  })
  marketPrice?: number;

  @Field(() => Float, { nullable: true })
  @Column({
    name: 'estimated_value',
    type: 'decimal',
    precision: 20,
    scale: 6,
    nullable: true,
  })
  estimatedValue?: number;

  @Field(() => Float, { nullable: true })
  @Column({
    name: 'unrealized_pnl',
    type: 'decimal',
    precision: 20,
    scale: 6,
    nullable: true,
  })
  unrealizedPnL?: number;

  @Field(() => Float, { nullable: true })
  @Column({
    name: 'unrealized_pnl_percent',
    type: 'decimal',
    precision: 8,
    scale: 4,
    nullable: true,
  })
  unrealizedPnLPercent?: number;

  // Status
  @Field(() => PositionMarketStatus)
  @Column({
    name: 'market_status',
    type: 'varchar',
    length: 20,
    default: 'ACTIVE',
  })
  marketStatus: PositionMarketStatus;

  @Field()
  @Column({ name: 'is_redeemable', default: false })
  isRedeemable: boolean;

  @Field(() => PositionType)
  @Column({
    name: 'position_type',
    type: 'varchar',
    length: 20,
    default: 'PREDICTION',
  })
  positionType: PositionType;

  // Risk & Performance
  @Field(() => Float, { nullable: true })
  @Column({
    name: 'cost_basis',
    type: 'decimal',
    precision: 20,
    scale: 6,
    nullable: true,
  })
  costBasis?: number;

  @Field(() => RiskLevel)
  @Column({
    name: 'risk_level',
    type: 'varchar',
    length: 10,
    default: 'MEDIUM',
  })
  riskLevel: RiskLevel;

  @Field(() => Int)
  @Column({ name: 'days_held', default: 0 })
  daysHeld: number;

  // Timestamps
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ name: 'last_price_update', nullable: true })
  lastPriceUpdate?: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => PositionTrade, trade => trade.position)
  trades: PositionTrade[];
}
