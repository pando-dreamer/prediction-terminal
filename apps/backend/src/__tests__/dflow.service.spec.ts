import { Test, TestingModule } from '@nestjs/testing';
import { DFlowService } from '../dflow/dflow.service';
import { ConfigService } from '@nestjs/config';

describe('DFlowService (health)', () => {
  let service: DFlowService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DFlowService, ConfigService],
    }).compile();

    service = module.get<DFlowService>(DFlowService);
  });

  it('isHealthy should return true when markets are fetched', async () => {
    // Mock the private makeApiCall method to return a markets array
    jest.spyOn(service as any, 'makeApiCall').mockResolvedValue({ markets: [{ ticker: 'TEST-1' }] });

    const healthy = await service.isHealthy();
    expect(healthy).toBe(true);
  });
});
