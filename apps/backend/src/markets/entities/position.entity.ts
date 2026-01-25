import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Market } from './market.entity';

export enum PositionType {
  YES = 'YES',
  NO = 'NO',
}

registerEnumType(PositionType, {
  name: 'PositionType',
});

@ObjectType()
@Entity('positions')
export class Position {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('User', 'positions')
  user: any;

  @Field(() => Market)
  @ManyToOne(() => Market, market => market.positions)
  market: Market;

  @Field(() => PositionType)
  @Column({ type: 'enum', enum: PositionType })
  type: PositionType;

  @Field()
  @Column('decimal', { precision: 10, scale: 2 })
  entryPrice: number;

  @Field()
  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Field()
  @Column('decimal', { precision: 15, scale: 2 })
  shares: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
