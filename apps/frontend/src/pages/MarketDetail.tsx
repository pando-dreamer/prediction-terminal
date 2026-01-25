import React from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';

const GET_MARKET = gql`
  query GetMarket($id: ID!) {
    market(id: $id) {
      id
      title
      description
      category
      status
      currentPrice
      totalVolume
      totalLiquidity
      expiryDate
      createdAt
      positions {
        id
        type
        entryPrice
        amount
        shares
        user {
          id
          username
        }
      }
    }
  }
`;

export function MarketDetail() {
  const { id } = useParams<{ id: string }>();
  const { loading, error, data } = useQuery(GET_MARKET, {
    variables: { id },
    skip: !id,
  });

  if (loading) return <div>Loading market...</div>;
  if (error) return <div>Error loading market: {error.message}</div>;
  if (!data?.market) return <div>Market not found</div>;

  const market = data.market;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{market.title}</h1>
          <p className="text-muted-foreground mt-2">{market.description}</p>
        </div>
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
          {market.category}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Price</CardTitle>
            <CardDescription>Market probability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${market.currentPrice}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Volume</CardTitle>
            <CardDescription>Amount traded</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${market.totalVolume}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liquidity</CardTitle>
            <CardDescription>Available liquidity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${market.totalLiquidity}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Place Bet</CardTitle>
            <CardDescription>Buy YES or NO shares</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-12 bg-green-600 hover:bg-green-700">
                Buy YES
              </Button>
              <Button className="h-12 bg-red-600 hover:bg-red-700">
                Buy NO
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">{market.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires:</span>
              <span className="font-medium">
                {new Date(market.expiryDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">
                {new Date(market.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Positions</CardTitle>
          <CardDescription>Latest trading activity</CardDescription>
        </CardHeader>
        <CardContent>
          {market.positions?.length > 0 ? (
            <div className="space-y-2">
              {market.positions.slice(0, 10).map((position: any) => (
                <div
                  key={position.id}
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <div>
                    <span className="font-medium">
                      {position.user.username}
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs ${
                        position.type === 'YES'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {position.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${position.amount}</div>
                    <div className="text-sm text-muted-foreground">
                      @ ${position.entryPrice}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No positions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
