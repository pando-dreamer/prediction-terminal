import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketsService } from './markets.service';
import { MarketsResolver } from './markets.resolver';
import { Market } from './entities/market.entity';
import { Position } from './entities/position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Market, Position])],
  providers: [MarketsResolver, MarketsService],
  exports: [MarketsService],
})
export class MarketsModule {}
