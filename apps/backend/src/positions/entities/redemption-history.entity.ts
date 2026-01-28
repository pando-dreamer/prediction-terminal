import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { UserPosition } from './user-position.entity';

@ObjectType()
@Entity('redemption_history')
@Index(['positionId'])
@Index(['redemptionDate'])
export class RedemptionHistory {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'position_id' })
  positionId: string;

  @Field()
  @Column({ name: 'transaction_signature', length: 88 })
  transactionSignature: string;

  // Redemption Details
  @Field(() => Float)
  @Column({ name: 'amount_redeemed', type: 'decimal', precision: 20, scale: 9 })
  amountRedeemed: number;

  @Field(() => Float)
  @Column({ name: 'amount_received', type: 'decimal', precision: 20, scale: 6 })
  amountReceived: number;

  @Field(() => Float, { nullable: true })
  @Column({
    name: 'profit_loss',
    type: 'decimal',
    precision: 20,
    scale: 6,
    nullable: true,
  })
  profitLoss?: number;

  // Dates
  @Field()
  @Column({ name: 'redemption_date', default: () => 'CURRENT_TIMESTAMP' })
  redemptionDate: Date;

  @Field({ nullable: true })
  @Column({ name: 'market_resolution_date', nullable: true })
  marketResolutionDate?: Date;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => UserPosition, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'position_id' })
  position: UserPosition;
}
