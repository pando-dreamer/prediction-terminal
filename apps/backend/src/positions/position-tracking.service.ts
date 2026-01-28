import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  UserPosition,
  OutcomeType,
  PositionMarketStatus,
  RiskLevel,
} from './entities/user-position.entity';
import { PositionTrade, TradeType } from './entities/position-trade.entity';
import { PriceCache } from './entities/price-cache.entity';
import { PortfolioHistory } from './entities/portfolio-history.entity';
import {
  PortfolioSummary,
  RefreshResult,
  PriceData,
} from './dto/portfolio.dto';
import { DFlowService } from '../dflow/dflow.service';

export interface TokenAccountInfo {
  mint: string;
  owner: string;
  balance: string;
  decimals: number;
  uiAmount: number;
  isToken2022: boolean;
  associatedAccount?: string;
}

@Injectable()
export class PositionTrackingService {
  private readonly logger = new Logger(PositionTrackingService.name);

  constructor(
    @InjectRepository(UserPosition)
    private positionRepository: Repository<UserPosition>,
    @InjectRepository(PositionTrade)
    private tradeRepository: Repository<PositionTrade>,
    @InjectRepository(PriceCache)
    private priceCacheRepository: Repository<PriceCache>,
    @InjectRepository(PortfolioHistory)
    private portfolioHistoryRepository: Repository<PortfolioHistory>,
    private dflowService: DFlowService
  ) {}

  /**
   * Fetch all positions for a user
   */
  async fetchUserPositions(walletAddress: string): Promise<UserPosition[]> {
    this.logger.log(`Fetching positions for wallet: ${walletAddress}`);

    const positions = await this.positionRepository.find({
      where: { walletAddress, balance: MoreThan(0) },
      order: { estimatedValue: 'DESC' },
      relations: ['trades'],
    });

    // Update positions with latest prices
    await this.refreshPositionPrices(positions);

    return positions;
  }

  /**
   * Discover and sync new positions from Token 2022 accounts
   */
  async discoverNewPositions(walletAddress: string): Promise<UserPosition[]> {
    this.logger.log(`Discovering positions for wallet: ${walletAddress}`);

    try {
      // Step 1: Get Token 2022 accounts (simulate based on reference analysis)
      const tokenAccounts = await this.getTokenAccounts(walletAddress);

      // Step 2: Filter outcome mints using DFlow API
      const outcomeMints = await this.filterOutcomeMints(
        tokenAccounts.map(t => t.mint)
      );

      // Step 3: Create position records for new mints
      const newPositions: UserPosition[] = [];

      for (const account of tokenAccounts) {
        if (outcomeMints.includes(account.mint) && account.uiAmount > 0) {
          const existingPosition = await this.positionRepository.findOne({
            where: { walletAddress, mint: account.mint },
          });

          if (!existingPosition) {
            const marketData = await this.dflowService.getMarketByMint(
              account.mint
            );

            const position = this.positionRepository.create({
              userId: await this.getUserIdFromWallet(walletAddress),
              walletAddress,
              mint: account.mint,
              balance: account.uiAmount,
              balanceRaw: account.balance,
              decimals: account.decimals,
              marketId: marketData.ticker,
              marketTitle: marketData.title,
              outcome: this.determineOutcome(marketData, account.mint),
              baseMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
              marketStatus: PositionMarketStatus.ACTIVE,
              positionType: 'PREDICTION' as any,
              riskLevel: RiskLevel.MEDIUM,
            });

            newPositions.push(await this.positionRepository.save(position));
          }
        }
      }

      return newPositions;
    } catch (error) {
      this.logger.error(`Error discovering positions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate position metrics including P&L
   */
  async calculatePositionMetrics(
    position: UserPosition
  ): Promise<UserPosition> {
    try {
      // Get current market price
      const priceData = await this.getCurrentPrice(
        position.marketId,
        position.outcome
      );
      position.currentPrice = priceData.currentPrice;
      position.marketPrice = priceData.currentPrice;

      // Calculate estimated value
      position.estimatedValue = position.balance * position.currentPrice;

      // Calculate entry price from trade history
      if (!position.entryPrice) {
        position.entryPrice = await this.calculateEntryPrice(position.id);
      }

      // Calculate cost basis if not set
      if (!position.costBasis) {
        position.costBasis = await this.calculateCostBasis(position.id);
      }

      // Calculate P&L
      if (position.entryPrice && position.currentPrice) {
        const pnlPerToken = position.currentPrice - position.entryPrice;
        position.unrealizedPnL = pnlPerToken * position.balance;
        position.unrealizedPnLPercent =
          (pnlPerToken / position.entryPrice) * 100;
      }

      // Calculate risk level
      position.riskLevel = this.calculateRiskLevel(position);

      // Update days held
      position.daysHeld = Math.floor(
        (Date.now() - position.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      position.lastPriceUpdate = new Date();
      return await this.positionRepository.save(position);
    } catch (error) {
      this.logger.error(`Error calculating position metrics: ${error.message}`);
      return position;
    }
  }

  /**
   * Refresh position prices for multiple positions
   */
  async refreshPositionPrices(
    positions: UserPosition[]
  ): Promise<UserPosition[]> {
    const marketIds = [...new Set(positions.map(p => p.marketId))];

    // Batch fetch prices
    await this.updatePriceCache(marketIds);

    // Update each position
    const updatedPositions = await Promise.all(
      positions.map(position => this.calculatePositionMetrics(position))
    );

    return updatedPositions;
  }

  /**
   * Calculate comprehensive portfolio summary
   */
  async calculatePortfolioSummary(
    walletAddress: string
  ): Promise<PortfolioSummary> {
    const positions = await this.fetchUserPositions(walletAddress);

    const summary: PortfolioSummary = {
      totalPositions: positions.length,
      activePositions: positions.filter(
        p => p.marketStatus === PositionMarketStatus.ACTIVE
      ).length,
      resolvedPositions: positions.filter(
        p => p.marketStatus === PositionMarketStatus.RESOLVED
      ).length,

      totalValue: positions.reduce(
        (sum, p) => sum + (p.estimatedValue || 0),
        0
      ),
      totalCostBasis: positions.reduce((sum, p) => sum + (p.costBasis || 0), 0),
      availableBalance: 0, // TODO: Get from wallet balance

      totalUnrealizedPnL: positions.reduce(
        (sum, p) => sum + (p.unrealizedPnL || 0),
        0
      ),
      totalRealizedPnL: 0, // TODO: Calculate from completed trades
      netPnL: 0,
      portfolioReturn: 0,

      redeemablePositions: positions.filter(p => p.isRedeemable).length,
      redeemableValue: positions
        .filter(p => p.isRedeemable)
        .reduce((sum, p) => sum + (p.estimatedValue || 0), 0),

      winRate: this.calculateWinRate(positions),
      averagePositionSize:
        positions.length > 0
          ? positions.reduce((sum, p) => sum + (p.estimatedValue || 0), 0) /
            positions.length
          : 0,
      largestPosition: Math.max(
        ...positions.map(p => p.estimatedValue || 0),
        0
      ),
      averageHoldingPeriod:
        positions.length > 0
          ? positions.reduce((sum, p) => sum + p.daysHeld, 0) / positions.length
          : 0,

      portfolioRisk: this.calculatePortfolioRisk(positions),
      diversificationScore: this.calculateDiversificationScore(positions),

      dailyPnL: 0, // TODO: Calculate from portfolio history
      weeklyPnL: 0,
      monthlyPnL: 0,
    };

    // Calculate derived metrics
    summary.netPnL = summary.totalUnrealizedPnL + summary.totalRealizedPnL;
    summary.portfolioReturn =
      summary.totalCostBasis > 0
        ? (summary.netPnL / summary.totalCostBasis) * 100
        : 0;

    return summary;
  }

  /**
   * Refresh all positions for a wallet
   */
  async refreshUserPositions(walletAddress: string): Promise<RefreshResult> {
    const startTime = Date.now();
    let positionsFound = 0;
    let positionsUpdated = 0;
    const errors: string[] = [];

    try {
      // Discover new positions
      const newPositions = await this.discoverNewPositions(walletAddress);
      positionsFound += newPositions.length;

      // Update existing positions
      const existingPositions = await this.positionRepository.find({
        where: { walletAddress },
      });

      for (const position of existingPositions) {
        try {
          await this.calculatePositionMetrics(position);
          positionsUpdated++;
        } catch (error) {
          errors.push(`Position ${position.id}: ${error.message}`);
        }
      }

      return {
        success: true,
        positionsFound,
        positionsUpdated,
        errors,
        lastRefresh: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        positionsFound,
        positionsUpdated,
        errors: [error.message],
        lastRefresh: new Date(),
      };
    }
  }

  // ===== CRON JOBS =====

  /**
   * Update price cache every 30 seconds
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async updatePriceCacheJob(): Promise<void> {
    this.logger.log('Running scheduled price cache update');

    try {
      // Get all unique market IDs from active positions
      const uniqueMarketIds = await this.positionRepository
        .createQueryBuilder('position')
        .select('DISTINCT position.marketId', 'marketId')
        .where('position.marketStatus = :status', {
          status: PositionMarketStatus.ACTIVE,
        })
        .getRawMany();

      const marketIds = uniqueMarketIds.map(row => row.marketId);

      if (marketIds.length > 0) {
        await this.updatePriceCache(marketIds);
        this.logger.log(`Updated prices for ${marketIds.length} markets`);
      }
    } catch (error) {
      this.logger.error(`Price cache update job failed: ${error.message}`);
    }
  }

  /**
   * Refresh position metrics every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async refreshPositionMetricsJob(): Promise<void> {
    this.logger.log('Running scheduled position metrics refresh');

    try {
      // Get all active positions
      const activePositions = await this.positionRepository.find({
        where: {
          marketStatus: PositionMarketStatus.ACTIVE,
          balance: MoreThan(0),
        },
        take: 100, // Limit to prevent overwhelming the system
      });

      let updatedCount = 0;
      for (const position of activePositions) {
        try {
          await this.calculatePositionMetrics(position);
          updatedCount++;
        } catch (error) {
          this.logger.warn(
            `Failed to update position ${position.id}: ${error.message}`
          );
        }
      }

      this.logger.log(`Updated metrics for ${updatedCount} positions`);
    } catch (error) {
      this.logger.error(
        `Position metrics refresh job failed: ${error.message}`
      );
    }
  }

  /**
   * Discover new positions for active wallets every 10 minutes
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async discoverNewPositionsJob(): Promise<void> {
    this.logger.log('Running scheduled position discovery');

    try {
      // Get unique wallet addresses from active positions
      const uniqueWallets = await this.positionRepository
        .createQueryBuilder('position')
        .select('DISTINCT position.walletAddress', 'walletAddress')
        .where('position.marketStatus = :status', {
          status: PositionMarketStatus.ACTIVE,
        })
        .limit(10) // Limit to prevent API rate limiting
        .getRawMany();

      let totalNewPositions = 0;
      for (const wallet of uniqueWallets) {
        try {
          const newPositions = await this.discoverNewPositions(
            wallet.walletAddress
          );
          totalNewPositions += newPositions.length;
        } catch (error) {
          this.logger.warn(
            `Failed to discover positions for ${wallet.walletAddress}: ${error.message}`
          );
        }
      }

      this.logger.log(`Discovered ${totalNewPositions} new positions`);
    } catch (error) {
      this.logger.error(`Position discovery job failed: ${error.message}`);
    }
  }

  /**
   * Update portfolio history snapshots every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async updatePortfolioHistoryJob(): Promise<void> {
    this.logger.log('Running scheduled portfolio history update');

    try {
      // Get unique wallet addresses
      const uniqueWallets = await this.positionRepository
        .createQueryBuilder('position')
        .select('DISTINCT position.walletAddress', 'walletAddress')
        .getRawMany();

      let snapshotsCreated = 0;
      for (const wallet of uniqueWallets) {
        try {
          const summary = await this.calculatePortfolioSummary(
            wallet.walletAddress
          );

          // Create portfolio history snapshot
          const historyEntry = this.portfolioHistoryRepository.create({
            userId: await this.getUserIdFromWallet(wallet.walletAddress),
            walletAddress: wallet.walletAddress,
            snapshotDate: new Date(),
            totalValue: summary.totalValue,
            cumulativePnL: summary.netPnL,
            portfolioReturn: summary.portfolioReturn,
            positionCount: summary.totalPositions,
            winRate: summary.winRate,
            netDeposits: 0, // TODO: Track actual deposits
          });

          await this.portfolioHistoryRepository.save(historyEntry);
          snapshotsCreated++;
        } catch (error) {
          this.logger.warn(
            `Failed to create portfolio snapshot for ${wallet.walletAddress}: ${error.message}`
          );
        }
      }

      this.logger.log(
        `Created ${snapshotsCreated} portfolio history snapshots`
      );
    } catch (error) {
      this.logger.error(`Portfolio history job failed: ${error.message}`);
    }
  }

  /**
   * Clean up expired price cache entries daily
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupPriceCacheJob(): Promise<void> {
    this.logger.log('Running scheduled price cache cleanup');

    try {
      const result = await this.priceCacheRepository
        .createQueryBuilder()
        .delete()
        .where('expiresAt < :now', { now: new Date() })
        .execute();

      this.logger.log(
        `Cleaned up ${result.affected} expired price cache entries`
      );
    } catch (error) {
      this.logger.error(`Price cache cleanup job failed: ${error.message}`);
    }
  }

  /**
   * Manual trigger for all position updates (useful for development/debugging)
   */
  @Cron('0 0 1 1 *') // Runs once a year (January 1st at midnight) - effectively disabled
  async fullPositionRefreshJob(): Promise<void> {
    this.logger.log('Running full position refresh (manual trigger only)');

    // This is primarily for manual triggering via GraphQL mutation
    // The cron is set to rarely run automatically
  }

  /**
   * Manual method to trigger full refresh for a specific wallet
   */
  async triggerFullRefresh(walletAddress: string): Promise<RefreshResult> {
    this.logger.log(`Triggering full refresh for wallet: ${walletAddress}`);
    return this.refreshUserPositions(walletAddress);
  }

  /**
   * Manual method to trigger full refresh for all wallets (use with caution)
   */
  async triggerFullRefreshAll(): Promise<RefreshResult[]> {
    this.logger.log('Triggering full refresh for all wallets');

    const uniqueWallets = await this.positionRepository
      .createQueryBuilder('position')
      .select('DISTINCT position.walletAddress', 'walletAddress')
      .getRawMany();

    const results: RefreshResult[] = [];
    for (const wallet of uniqueWallets) {
      try {
        const result = await this.refreshUserPositions(wallet.walletAddress);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          positionsFound: 0,
          positionsUpdated: 0,
          errors: [error.message],
          lastRefresh: new Date(),
        });
      }
    }

    return results;
  }

  // ===== HELPER METHODS =====

  private async getTokenAccounts(
    walletAddress: string
  ): Promise<TokenAccountInfo[]> {
    // Simulate Token 2022 account fetching (would integrate with Solana RPC)
    return [
      {
        mint: 'JDJxu7NWnJHckdDPcbuxzokGUQg82RGaJNWpVBrzv8dM',
        owner: walletAddress,
        balance: '1000000',
        decimals: 6,
        uiAmount: 1.0,
        isToken2022: true,
      },
    ];
  }

  private async filterOutcomeMints(mints: string[]): Promise<string[]> {
    return this.dflowService.filterOutcomeMints(mints);
  }

  private async getUserIdFromWallet(walletAddress: string): Promise<string> {
    // TODO: Implement user lookup
    return 'temp-user-id';
  }

  private determineOutcome(marketData: any, mint: string): OutcomeType {
    // TODO: Determine YES/NO based on market data and mint
    return OutcomeType.YES;
  }

  private async getCurrentPrice(
    marketId: string,
    outcome: OutcomeType
  ): Promise<PriceData> {
    // Check cache first
    const cached = await this.priceCacheRepository.findOne({
      where: { marketId, outcome },
    });

    if (cached && cached.expiresAt && cached.expiresAt > new Date()) {
      return {
        marketId: cached.marketId,
        outcome: cached.outcome,
        currentPrice: cached.currentPrice,
        priceChange24h: cached.priceChange24h,
        priceChangePercent24h: cached.priceChangePercent24h,
        volume24h: cached.volume24h,
        lastUpdated: cached.lastUpdated,
        source: cached.source,
      };
    }

    // Fetch from API
    const marketData = await this.dflowService.getMarketByTicker(marketId);
    const currentPrice =
      outcome === OutcomeType.YES
        ? marketData.yesBid || marketData.yesAsk || 0.5
        : marketData.noBid || marketData.noAsk || 0.5;

    // Update cache
    await this.priceCacheRepository.save({
      marketId,
      outcome,
      currentPrice,
      expiresAt: new Date(Date.now() + 30000), // 30 seconds
      source: 'DFLOW_API' as any,
    });

    return {
      marketId,
      outcome,
      currentPrice,
      priceChange24h: 0,
      priceChangePercent24h: 0,
      volume24h: 0,
      lastUpdated: new Date(),
      source: 'DFLOW_API',
    };
  }

  private async updatePriceCache(marketIds: string[]): Promise<void> {
    // Batch update prices for multiple markets
    for (const marketId of marketIds) {
      try {
        await this.getCurrentPrice(marketId, OutcomeType.YES);
        await this.getCurrentPrice(marketId, OutcomeType.NO);
      } catch (error) {
        this.logger.error(
          `Failed to update price for ${marketId}: ${error.message}`
        );
      }
    }
  }

  private async calculateEntryPrice(positionId: string): Promise<number> {
    const trades = await this.tradeRepository.find({
      where: { positionId, tradeType: TradeType.BUY },
      order: { timestamp: 'ASC' },
    });

    if (trades.length === 0) return 0;

    // Calculate weighted average entry price
    const totalAmount = trades.reduce((sum, trade) => sum + trade.amount, 0);
    const totalCost = trades.reduce(
      (sum, trade) => sum + trade.amount * trade.price,
      0
    );

    return totalAmount > 0 ? totalCost / totalAmount : 0;
  }

  private async calculateCostBasis(positionId: string): Promise<number> {
    const trades = await this.tradeRepository.find({
      where: { positionId, tradeType: TradeType.BUY },
    });

    return trades.reduce((sum, trade) => sum + trade.amount * trade.price, 0);
  }

  private calculateRiskLevel(position: UserPosition): RiskLevel {
    // Risk based on position size, market volatility, time to expiry
    const value = position.estimatedValue || 0;

    if (value < 100) return RiskLevel.LOW;
    if (value < 1000) return RiskLevel.MEDIUM;
    return RiskLevel.HIGH;
  }

  private calculateWinRate(positions: UserPosition[]): number {
    const resolvedPositions = positions.filter(
      p => p.marketStatus === PositionMarketStatus.RESOLVED
    );
    if (resolvedPositions.length === 0) return 0;

    const winningPositions = resolvedPositions.filter(
      p => (p.unrealizedPnL || 0) > 0
    );
    return (winningPositions.length / resolvedPositions.length) * 100;
  }

  private calculatePortfolioRisk(positions: UserPosition[]): RiskLevel {
    const riskScores = positions.map(p => {
      switch (p.riskLevel) {
        case RiskLevel.HIGH:
          return 3;
        case RiskLevel.MEDIUM:
          return 2;
        case RiskLevel.LOW:
          return 1;
        default:
          return 2;
      }
    });

    const avgRisk =
      riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;

    if (avgRisk >= 2.5) return RiskLevel.HIGH;
    if (avgRisk >= 1.5) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  private calculateDiversificationScore(positions: UserPosition[]): number {
    const markets = new Set(positions.map(p => p.marketId));
    const maxScore = 100;
    const diversificationRatio = Math.min(markets.size / 10, 1); // Optimal at 10+ markets
    return diversificationRatio * maxScore;
  }
}
