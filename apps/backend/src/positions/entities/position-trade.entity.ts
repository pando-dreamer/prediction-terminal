import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import {
  ObjectType,
  Field,
  ID,
  Float,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { UserPosition } from './user-position.entity';

export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL',
  REDEMPTION = 'REDEMPTION',
}

export enum ExecutionMode {
  SYNC = 'SYNC',
  ASYNC = 'ASYNC',
}

// Register enums for GraphQL
registerEnumType(TradeType, { name: 'TradeType' });
registerEnumType(ExecutionMode, { name: 'ExecutionMode' });

@ObjectType()
@Entity('position_trades')
@Index(['positionId'])
@Index(['timestamp'])
@Index(['transactionSignature'])
export class PositionTrade {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'position_id' })
  positionId: string;

  @Field()
  @Column({ name: 'transaction_signature', length: 88 })
  transactionSignature: string;

  // Trade Information
  @Field(() => TradeType)
  @Column({ name: 'trade_type', type: 'varchar', length: 20 })
  tradeType: TradeType;

  @Field(() => Float)
  @Column('decimal', { precision: 20, scale: 9 })
  amount: number;

  @Field(() => Float)
  @Column('decimal', { precision: 20, scale: 6 })
  price: number;

  @Field(() => Float)
  @Column('decimal', { precision: 20, scale: 6, default: 0 })
  fee: number;

  // Order Information
  @Field({ nullable: true })
  @Column({ name: 'order_id', length: 100, nullable: true })
  orderId?: string;

  @Field(() => ExecutionMode)
  @Column({
    name: 'execution_mode',
    type: 'varchar',
    length: 10,
    default: 'SYNC',
  })
  executionMode: ExecutionMode;

  @Field(() => Int)
  @Column({ name: 'slippage_bps', default: 0 })
  slippageBps: number;

  @Field(() => Float, { nullable: true })
  @Column({
    name: 'price_impact',
    type: 'decimal',
    precision: 8,
    scale: 4,
    nullable: true,
  })
  priceImpact?: number;

  // Timestamps
  @Field()
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => UserPosition, position => position.trades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'position_id' })
  position: UserPosition;
}
