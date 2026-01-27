import { Module } from '@nestjs/common';
import { DFlowService } from './dflow.service';
import { DFlowResolver } from './dflow.resolver';
import { DFlowTradingService } from './dflow-trading.service';
import { DFlowTradingResolver } from './dflow-trading.resolver';

@Module({
  providers: [
    DFlowService,
    DFlowResolver,
    DFlowTradingService,
    DFlowTradingResolver,
  ],
  exports: [DFlowService, DFlowTradingService],
})
export class DFlowModule {}
