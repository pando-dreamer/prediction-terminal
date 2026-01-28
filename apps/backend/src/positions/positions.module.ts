import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPosition } from './entities/user-position.entity';
import { PositionTrade } from './entities/position-trade.entity';
import { PortfolioHistory } from './entities/portfolio-history.entity';
import { RedemptionHistory } from './entities/redemption-history.entity';
import { PriceCache } from './entities/price-cache.entity';
import { PositionsResolver } from './positions.resolver';
import { PositionTrackingService } from './position-tracking.service';
import { RedemptionService } from './redemption.service';
import { DFlowModule } from '../dflow/dflow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPosition,
      PositionTrade,
      PortfolioHistory,
      RedemptionHistory,
      PriceCache,
    ]),
    DFlowModule,
  ],
  providers: [PositionsResolver, PositionTrackingService, RedemptionService],
  exports: [PositionTrackingService, RedemptionService],
})
export class PositionsModule {}
