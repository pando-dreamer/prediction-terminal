import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  RefreshCw,
  Filter,
  Download,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

import { PortfolioOverview } from '../components/positions/PortfolioOverview';
import { PositionList } from '../components/positions/PositionCard';
import {
  GET_USER_POSITIONS,
  GET_PORTFOLIO_SUMMARY,
  GET_REDEEMABLE_POSITIONS,
  REFRESH_USER_POSITIONS,
  REDEEM_POSITION,
} from '../lib/graphql/positions';

export function Portfolio() {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const walletAddress = publicKey?.toBase58() || '';

  // GraphQL queries
  const {
    data: positionsData,
    loading: positionsLoading,
    refetch: refetchPositions,
  } = useQuery(GET_USER_POSITIONS, {
    variables: {
      walletAddress,
      filters:
        filterStatus !== 'all'
          ? { marketStatus: filterStatus.toUpperCase() }
          : undefined,
    },
    skip: !walletAddress,
    errorPolicy: 'all',
  });

  const {
    data: summaryData,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery(GET_PORTFOLIO_SUMMARY, {
    variables: { walletAddress },
    skip: !walletAddress,
    errorPolicy: 'all',
  });

  const { data: redeemableData, loading: redeemableLoading } = useQuery(
    GET_REDEEMABLE_POSITIONS,
    {
      variables: { walletAddress },
      skip: !walletAddress,
      errorPolicy: 'all',
    }
  );

  // Mutations
  const [refreshPositions, { loading: refreshing }] = useMutation(
    REFRESH_USER_POSITIONS,
    {
      onCompleted: data => {
        if (data.refreshUserPositions.success) {
          console.log(
            `Refreshed ${data.refreshUserPositions.positionsUpdated} positions`
          );
          refetchPositions();
          refetchSummary();
        } else {
          console.error('Failed to refresh positions');
        }
      },
      onError: error => {
        console.error(`Refresh failed: ${error.message}`);
      },
    }
  );

  const [redeemPosition, { loading: redeeming }] = useMutation(
    REDEEM_POSITION,
    {
      onCompleted: data => {
        if (data.redeemPosition.success) {
          console.log(
            `Successfully redeemed position for ${data.redeemPosition.amountReceived} USDC`
          );
          refetchPositions();
          refetchSummary();
        } else {
          console.error(`Redemption failed: ${data.redeemPosition.error}`);
        }
      },
      onError: error => {
        console.error(`Redemption error: ${error.message}`);
      },
    }
  );

  const handleRefresh = async () => {
    if (!walletAddress) {
      console.error('Please connect your wallet first');
      return;
    }

    await refreshPositions({ variables: { walletAddress } });
  };

  const handleRedeem = async (position: any) => {
    if (!walletAddress) {
      console.error('Please connect your wallet first');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to redeem your position in ${position.marketTitle}?`
    );

    if (confirmed) {
      await redeemPosition({
        variables: {
          positionId: position.id,
          amount: position.balance, // Redeem full position
        },
      });
    }
  };

  const handleViewDetails = (position: any) => {
    // TODO: Navigate to position detail page
    console.log('View position details:', position);
    console.log('Position details view coming soon!');
  };

  if (!walletAddress) {
    return (
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Portfolio</h1>

        <Card className="text-center py-8 md:py-12">
          <CardContent>
            <AlertTriangle className="h-10 w-10 md:h-12 md:w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2">
              Wallet Not Connected
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 px-4">
              Please connect your wallet to view your portfolio and positions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const positions = positionsData?.userPositions || [];
  const summary = summaryData?.portfolioSummary;
  const redeemablePositions = redeemableData?.redeemablePositions || [];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - Stack on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Portfolio</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-1 sm:flex-initial h-10 text-gray-900 border-gray-300 hover:bg-gray-100 bg-white touch-target"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled
            className="flex-1 sm:flex-initial h-10 text-gray-900 border-gray-300 bg-white touch-target"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4 md:space-y-6"
      >
        <TabsList className="grid grid-cols-3 w-full h-11 md:h-10 md:max-w-md">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="positions" className="text-xs sm:text-sm">
            Positions
            {positions.length > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                {positions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="redeemable" className="text-xs sm:text-sm">
            <span className="hidden xs:inline">Redeemable</span>
            <span className="xs:hidden">Redeem</span>
            {redeemablePositions.length > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                {redeemablePositions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          {summary ? (
            <PortfolioOverview summary={summary} loading={summaryLoading} />
          ) : (
            <Card className="text-center py-8 md:py-12">
              <CardContent>
                <TrendingUp className="h-10 w-10 md:h-12 md:w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-base md:text-lg font-semibold mb-2">
                  No Portfolio Data
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 px-4">
                  Start trading to see your portfolio overview here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="space-y-4 md:space-y-6">
          {/* Position Filters - Horizontal scroll on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-x -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0">
            <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex gap-2">
              {['all', 'active', 'resolved', 'settled'].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="capitalize whitespace-nowrap h-9 touch-target"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <PositionList
            positions={positions}
            loading={positionsLoading}
            onRedeem={handleRedeem}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        {/* Redeemable Tab */}
        <TabsContent value="redeemable" className="space-y-4 md:space-y-6">
          {redeemablePositions.length > 0 ? (
            <>
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2 text-base md:text-lg">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                    Redeemable Positions Available
                  </CardTitle>
                  <CardDescription className="text-green-700 text-sm">
                    You have {redeemablePositions.length} positions ready for
                    redemption. Total redeemable value:{' '}
                    {summary &&
                      new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(summary.redeemableValue)}
                  </CardDescription>
                </CardHeader>
              </Card>

              <PositionList
                positions={redeemablePositions}
                loading={redeemableLoading}
                onRedeem={handleRedeem}
                onViewDetails={handleViewDetails}
              />
            </>
          ) : (
            <Card className="text-center py-8 md:py-12">
              <CardContent>
                <TrendingUp className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base md:text-lg font-semibold mb-2">
                  No Redeemable Positions
                </h3>
                <p className="text-sm md:text-base text-gray-600 px-4">
                  Positions that can be redeemed will appear here when markets
                  resolve.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
