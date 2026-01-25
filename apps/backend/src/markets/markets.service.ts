import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Market, MarketStatus } from './entities/market.entity';
import { CreateMarketInput } from './dto/create-market.input';

@Injectable()
export class MarketsService {
  constructor(
    @InjectRepository(Market)
    private marketRepository: Repository<Market>
  ) {}

  async create(createMarketInput: CreateMarketInput): Promise<Market> {
    const market = this.marketRepository.create(createMarketInput);
    return this.marketRepository.save(market);
  }

  async findAll(): Promise<Market[]> {
    return this.marketRepository.find({
      relations: ['positions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Market> {
    return this.marketRepository.findOne({
      where: { id },
      relations: ['positions', 'positions.user'],
    });
  }

  async findActive(): Promise<Market[]> {
    return this.marketRepository.find({
      where: { status: MarketStatus.ACTIVE },
      relations: ['positions'],
      order: { createdAt: 'DESC' },
    });
  }

  async updatePrice(id: string, newPrice: number): Promise<Market> {
    await this.marketRepository.update(id, { currentPrice: newPrice });
    return this.findOne(id);
  }

  async resolveMarket(id: string, outcome: boolean): Promise<Market> {
    await this.marketRepository.update(id, {
      status: MarketStatus.RESOLVED,
      outcome,
      resolvedAt: new Date(),
    });
    return this.findOne(id);
  }
}
