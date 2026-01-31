import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import {
  UserPosition,
  PositionMarketStatus,
} from './entities/user-position.entity';
import { RedemptionHistory } from './entities/redemption-history.entity';
import { RedemptionResult } from './dto/redemption.dto';
import { RedemptionRequestInput } from './dto/position-inputs.dto';
import { DFlowService } from '../dflow/dflow.service';

@Injectable()
export class RedemptionService {
  private readonly logger = new Logger(RedemptionService.name);

  constructor(
    @InjectRepository(UserPosition)
    private positionRepository: Repository<UserPosition>,
    @InjectRepository(RedemptionHistory)
    private redemptionHistoryRepository: Repository<RedemptionHistory>,
    private dflowService: DFlowService
  ) {}

  /**
   * Get all redeemable positions for a wallet
   */
  async getRedeemablePositions(walletAddress: string): Promise<UserPosition[]> {
    return this.positionRepository.find({
      where: {
        walletAddress,
        isRedeemable: true,
        balance: MoreThan(0),
      },
      order: { estimatedValue: 'DESC' },
    });
  }

  /**
   * Create a redemption order
   */
  async createRedemptionOrder(
    request: RedemptionRequestInput
  ): Promise<RedemptionResult> {
    try {
      this.logger.log(
        `Creating redemption order for position: ${request.positionId}`
      );

      const position = await this.positionRepository.findOne({
        where: { id: request.positionId },
      });

      if (!position) {
        return {
          success: false,
          error: 'Position not found',
        };
      }

      if (!position.isRedeemable) {
        return {
          success: false,
          error: 'Position is not redeemable',
        };
      }

      const amountToRedeem = request.amount || position.balance;

      if (amountToRedeem > position.balance) {
        return {
          success: false,
          error: 'Insufficient balance',
        };
      }

      // Create redemption order with DFlow
      const orderResponse = await this.dflowService.createRedemptionOrder({
        mint: position.mint,
        amount: amountToRedeem,
        userPublicKey: request.userPublicKey,
        slippageBps: request.slippageBps || 100,
      });

      if (!orderResponse.success) {
        return {
          success: false,
          error: orderResponse.error || 'Failed to create redemption order',
        };
      }

      return {
        success: true,
        orderId: orderResponse.orderId,
        amountRedeemed: amountToRedeem,
        amountReceived: orderResponse.expectedReceived,
      };
    } catch (error) {
      this.logger.error(`Error creating redemption order: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Redeem a position (execute the redemption)
   */
  async redeemPosition(
    positionId: string,
    amount?: number
  ): Promise<RedemptionResult> {
    try {
      this.logger.log(`Redeeming position: ${positionId}`);

      const position = await this.positionRepository.findOne({
        where: { id: positionId },
      });

      if (!position) {
        return {
          success: false,
          error: 'Position not found',
        };
      }

      const amountToRedeem = amount || position.balance;

      // Execute redemption through DFlow
      const redemptionResponse = await this.dflowService.executeRedemption({
        mint: position.mint,
        amount: amountToRedeem,
      });

      if (!redemptionResponse.success) {
        return {
          success: false,
          error: redemptionResponse.error || 'Redemption failed',
        };
      }

      // Update position balance
      position.balance -= amountToRedeem;
      position.balanceRaw = (
        parseFloat(position.balanceRaw) -
        amountToRedeem * Math.pow(10, position.decimals)
      ).toString();

      if (position.balance <= 0) {
        position.balance = 0;
        position.marketStatus = PositionMarketStatus.SETTLED;
      }

      await this.positionRepository.save(position);

      // Record redemption history
      await this.redemptionHistoryRepository.save({
        positionId: position.id,
        transactionSignature: redemptionResponse.transactionSignature!,
        amountRedeemed: amountToRedeem,
        amountReceived: redemptionResponse.amountReceived!,
        profitLoss:
          redemptionResponse.amountReceived! -
          position.entryPrice! * amountToRedeem,
        redemptionDate: new Date(),
      });

      return {
        success: true,
        transactionSignature: redemptionResponse.transactionSignature,
        amountRedeemed: amountToRedeem,
        amountReceived: redemptionResponse.amountReceived,
      };
    } catch (error) {
      this.logger.error(`Error redeeming position: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get redemption history for a wallet
   */
  async getRedemptionHistory(
    walletAddress: string
  ): Promise<RedemptionHistory[]> {
    return this.redemptionHistoryRepository
      .createQueryBuilder('redemption')
      .innerJoinAndSelect('redemption.position', 'position')
      .where('position.walletAddress = :walletAddress', { walletAddress })
      .orderBy('redemption.redemptionDate', 'DESC')
      .getMany();
  }

  /**
   * Calculate redemption value for a position
   */
  async calculateRedemptionValue(position: UserPosition): Promise<number> {
    if (!position.isRedeemable) return 0;

    // For resolved markets, redemption value is based on market resolution
    if (position.marketStatus === PositionMarketStatus.RESOLVED) {
      // TODO: Get actual resolution data
      const isWinning = Math.random() > 0.5; // Placeholder
      return isWinning ? position.balance : 0;
    }

    // For active markets, use current market price
    return position.balance * (position.currentPrice || 0);
  }

  /**
   * Estimate redemption fees
   */
  async estimateRedemptionFees(position: UserPosition): Promise<number> {
    const baseValue = await this.calculateRedemptionValue(position);
    const feeRate = 0.01; // 1% fee
    return baseValue * feeRate;
  }

  /**
   * Check redemption status by transaction signature
   */
  async checkRedemptionStatus(
    transactionSignature: string
  ): Promise<RedemptionResult> {
    try {
      const redemption = await this.redemptionHistoryRepository.findOne({
        where: { transactionSignature },
        relations: ['position'],
      });

      if (!redemption) {
        return {
          success: false,
          error: 'Redemption not found',
        };
      }

      return {
        success: true,
        transactionSignature: redemption.transactionSignature,
        amountRedeemed: redemption.amountRedeemed,
        amountReceived: redemption.amountReceived,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
