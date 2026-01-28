import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface UserPosition {
  id: string;
  walletAddress: string;
  mint: string;
  balance: number;
  marketId: string;
  marketTitle: string;
  outcome: 'YES' | 'NO';
  entryPrice?: number;
  currentPrice?: number;
  estimatedValue?: number;
  unrealizedPnL?: number;
  unrealizedPnLPercent?: number;
  marketStatus: 'ACTIVE' | 'RESOLVED' | 'SETTLED' | 'CANCELLED';
  isRedeemable: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  daysHeld: number;
  createdAt: string;
}

interface PositionCardProps {
  position: UserPosition;
  onRedeem?: (position: UserPosition) => void;
  onViewDetails?: (position: UserPosition) => void;
}

export const PositionCard: React.FC<PositionCardProps> = ({
  position,
  onRedeem,
  onViewDetails,
}) => {
  const isProfitable = (position.unrealizedPnL ?? 0) >= 0;
  const isActive = position.marketStatus === 'ACTIVE';

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (percent?: number) => {
    if (percent === undefined || percent === null) return '-';
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOutcomeBadgeColor = (outcome: string) => {
    return outcome === 'YES'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Card
      className={cn(
        'hover:shadow-lg transition-all duration-200 cursor-pointer',
        isProfitable
          ? 'border-green-200 bg-green-50/30'
          : 'border-red-200 bg-red-50/30'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {position.marketTitle}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={getOutcomeBadgeColor(position.outcome)}
                variant="outline"
              >
                {position.outcome}
              </Badge>
              <Badge
                className={getRiskBadgeColor(position.riskLevel)}
                variant="outline"
              >
                {position.riskLevel}
              </Badge>
              <Badge
                variant={
                  position.marketStatus === 'ACTIVE' ? 'default' : 'secondary'
                }
                className="text-xs"
              >
                {position.marketStatus}
              </Badge>
            </div>
          </div>

          {position.isRedeemable && (
            <Button
              size="sm"
              variant="outline"
              className="ml-2 text-green-600 border-green-300 hover:bg-green-50"
              onClick={e => {
                e.stopPropagation();
                onRedeem?.(position);
              }}
            >
              Redeem
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent
        className="pt-0 cursor-pointer"
        onClick={() => onViewDetails?.(position)}
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Position Details */}
          <div>
            <div className="text-sm text-gray-600 mb-1">Balance</div>
            <div className="font-medium">
              {position.balance.toFixed(4)} tokens
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Current Value</div>
            <div className="font-medium">
              {formatCurrency(position.estimatedValue)}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Entry Price</div>
            <div className="font-medium">
              {formatCurrency(position.entryPrice)}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Current Price</div>
            <div className="font-medium">
              {formatCurrency(position.currentPrice)}
            </div>
          </div>
        </div>

        {/* P&L Section */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Unrealized P&L</div>
              <div
                className={cn(
                  'font-semibold text-lg',
                  isProfitable ? 'text-green-600' : 'text-red-600'
                )}
              >
                {formatCurrency(position.unrealizedPnL)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Return</div>
              <div
                className={cn(
                  'font-semibold text-lg',
                  isProfitable ? 'text-green-600' : 'text-red-600'
                )}
              >
                {formatPercent(position.unrealizedPnLPercent)}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm text-gray-500">
          <span>Held for {position.daysHeld} days</span>
          <span>Market: {position.marketId}</span>
        </div>
      </CardContent>
    </Card>
  );
};

interface PositionListProps {
  positions: UserPosition[];
  loading?: boolean;
  onRedeem?: (position: UserPosition) => void;
  onViewDetails?: (position: UserPosition) => void;
}

export const PositionList: React.FC<PositionListProps> = ({
  positions,
  loading = false,
  onRedeem,
  onViewDetails,
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No positions found</div>
        <div className="text-gray-400">
          Your prediction market positions will appear here once you place
          trades.
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {positions.map(position => (
        <PositionCard
          key={position.id}
          position={position}
          onRedeem={onRedeem}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
