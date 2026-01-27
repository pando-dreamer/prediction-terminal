import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';

const GET_ACTIVE_MARKETS = gql`
  query GetActiveMarkets {
    activeMarkets {
      id
      title
      description
      category
      currentPrice
      totalVolume
      expiryDate
      createdAt
    }
  }
`;

const GET_DFLOW_MARKETS = gql`
  query GetDFlowMarkets($limit: Float, $search: String, $category: String) {
    dflowMarkets(limit: $limit, search: $search, category: $category) {
      ticker
      title
      status
      category
      volume
      openInterest
      yesPrice
      noPrice
      isActive
      timeUntilClose
      closeTime
      yesSubTitle
      noSubTitle
    }
  }
`;

export function Markets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const {
    loading: localLoading,
    error: localError,
    data: localData,
  } = useQuery(GET_ACTIVE_MARKETS);

  const {
    loading: dflowLoading,
    error: dflowError,
    data: dflowData,
  } = useQuery(GET_DFLOW_MARKETS, {
    variables: {
      limit: 20,
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
    },
    errorPolicy: 'ignore', // Don't crash if DFlow API is unavailable
  });

  const renderLocalMarketCard = (market: any) => (
    <Card
      key={market.id}
      className="cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{market.title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{market.category}</Badge>
            <Badge variant="outline">Local</Badge>
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {market.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Current Price:
            </span>
            <span className="font-medium">${market.currentPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Volume:</span>
            <span className="font-medium">${market.totalVolume}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Expires:</span>
            <span className="font-medium">
              {new Date(market.expiryDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <Link to={`/markets/${market.id}`}>
            <Button className="w-full">View Market</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  const renderDFlowMarketCard = (market: any) => (
    <Card
      key={market.ticker}
      className="cursor-pointer hover:shadow-md transition-shadow border-blue-200"
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{market.title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{market.category}</Badge>
            <Badge variant="default" className="bg-blue-500">
              DFlow
            </Badge>
            {market.isActive && (
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                Active
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          YES: {market.yesSubTitle} | NO: {market.noSubTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {(market.yesPrice || market.noPrice) && (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  YES Price:
                </span>
                <span className="font-medium text-green-600">
                  {market.yesPrice ? `$${market.yesPrice.toFixed(2)}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">NO Price:</span>
                <span className="font-medium text-red-600">
                  {market.noPrice ? `$${market.noPrice.toFixed(2)}` : 'N/A'}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Volume:</span>
            <span className="font-medium">
              ${(market.volume / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Open Interest:
            </span>
            <span className="font-medium">
              ${(market.openInterest / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Closes:</span>
            <span className="font-medium">
              {new Date(market.closeTime * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <Link to={`/markets/dflow/${market.ticker}`}>
            <Button className="w-full">View Market</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  if (localLoading) return <div>Loading markets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Prediction Markets</h1>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search markets..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Categories</option>
          <option value="Politics">Politics</option>
          <option value="Sports">Sports</option>
          <option value="Crypto">Crypto</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Markets</TabsTrigger>
          <TabsTrigger value="local">Local Markets</TabsTrigger>
          <TabsTrigger value="dflow">DFlow Markets</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Local markets */}
            {localData?.activeMarkets?.map(renderLocalMarketCard)}

            {/* DFlow markets */}
            {!dflowLoading &&
              !dflowError &&
              dflowData?.dflowMarkets?.map(renderDFlowMarketCard)}
          </div>
        </TabsContent>

        <TabsContent value="local">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localData?.activeMarkets?.map(renderLocalMarketCard)}
          </div>
        </TabsContent>

        <TabsContent value="dflow">
          {dflowLoading && <div>Loading DFlow markets...</div>}
          {dflowError && (
            <div className="text-yellow-600 bg-yellow-50 p-4 rounded-md">
              DFlow markets unavailable: {dflowError.message}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!dflowLoading &&
              !dflowError &&
              dflowData?.dflowMarkets?.map(renderDFlowMarketCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty state */}
      {localData?.activeMarkets?.length === 0 &&
        (!dflowData?.dflowMarkets || dflowData.dflowMarkets.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No active markets found.</p>
            <Button className="mt-4">Create the first market</Button>
          </div>
        )}
    </div>
  );
}
