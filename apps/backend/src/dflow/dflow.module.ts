import { Module } from '@nestjs/common';
import { DFlowService } from './dflow.service';
import { DFlowResolver } from './dflow.resolver';

@Module({
  providers: [DFlowService, DFlowResolver],
  exports: [DFlowService],
})
export class DFlowModule {}
