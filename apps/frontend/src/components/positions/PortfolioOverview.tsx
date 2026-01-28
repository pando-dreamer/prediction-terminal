import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  PieChart,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PortfolioSummary {
  totalPositions: number;
  activePositions: number;
  resolvedPositions: number;
  totalValue: number;
  totalCostBasis: number;
  availableBalance: number;
  totalUnrealizedPnL: number;
  totalRealizedPnL: number;
  netPnL: number;
  portfolioReturn: number;
  redeemablePositions: number;
  redeemableValue: number;
  winRate: number;
  averagePositionSize: number;
  largestPosition: number;
  averageHoldingPeriod: number;
  portfolioRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  diversificationScore: number;
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
}

interface PortfolioOverviewProps {
  summary: PortfolioSummary;
  loading?: boolean;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  summary,
  loading = false,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'text-red-600 bg-red-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const isProfitable = summary.netPnL >= 0;

  return (
    <div className="space-y-6">
      {/* Main Portfolio Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Portfolio Value */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(summary.totalValue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total P&L */}
        <Card
          className={cn(
            'border-2',
            isProfitable
              ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200'
              : 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200'
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={cn(
                    'text-sm font-medium mb-1',
                    isProfitable ? 'text-green-700' : 'text-red-700'
                  )}
                >
                  Total P&L
                </p>
                <p
                  className={cn(
                    'text-2xl font-bold',
                    isProfitable ? 'text-green-900' : 'text-red-900'
                  )}
                >
                  {formatCurrency(summary.netPnL)}
                </p>
                <p
                  className={cn(
                    'text-sm font-medium',
                    isProfitable ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {formatPercent(summary.portfolioReturn)}
                </p>
              </div>
              {isProfitable ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Positions */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">
                  Active Positions
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {summary.activePositions}
                </p>
                <p className="text-sm text-purple-600">
                  of {summary.totalPositions} total
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">
                  Win Rate
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {summary.winRate.toFixed(1)}%
                </p>
                <Progress
                  value={summary.winRate}
                  className="mt-2 h-2"
                  // className="bg-amber-200"
                />
              </div>
              <PieChart className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Redeemable Positions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Redeemable Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Count:</span>
                <span className="font-medium">
                  {summary.redeemablePositions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Value:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(summary.redeemableValue)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Risk */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              Risk Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Risk Level:</span>
                <Badge
                  className={getRiskColor(summary.portfolioRisk)}
                  variant="outline"
                >
                  {summary.portfolioRisk}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Diversification:</span>
                <span className="font-medium">
                  {summary.diversificationScore.toFixed(0)}%
                </span>
              </div>
              <Progress
                value={summary.diversificationScore}
                className="mt-2 h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Daily P&L:</span>
                <span
                  className={cn(
                    'font-medium',
                    summary.dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {formatCurrency(summary.dailyPnL)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Weekly P&L:</span>
                <span
                  className={cn(
                    'font-medium',
                    summary.weeklyPnL >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {formatCurrency(summary.weeklyPnL)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Hold Time:</span>
                <span className="font-medium">
                  {summary.averageHoldingPeriod.toFixed(0)} days
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Portfolio Details */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Position Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Position Size:</span>
                  <span>{formatCurrency(summary.averagePositionSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Largest Position:</span>
                  <span>{formatCurrency(summary.largestPosition)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resolved Positions:</span>
                  <span>{summary.resolvedPositions}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Value Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Cost Basis:</span>
                  <span>{formatCurrency(summary.totalCostBasis)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unrealized P&L:</span>
                  <span
                    className={
                      summary.totalUnrealizedPnL >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {formatCurrency(summary.totalUnrealizedPnL)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Realized P&L:</span>
                  <span
                    className={
                      summary.totalRealizedPnL >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {formatCurrency(summary.totalRealizedPnL)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Recent Performance</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month:</span>
                  <span
                    className={
                      summary.monthlyPnL >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {formatCurrency(summary.monthlyPnL)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Balance:</span>
                  <span>{formatCurrency(summary.availableBalance)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
