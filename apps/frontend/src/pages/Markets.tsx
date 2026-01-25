import React from 'react';
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

export function Markets() {
  const { loading, error, data } = useQuery(GET_ACTIVE_MARKETS);

  if (loading) return <div>Loading markets...</div>;
  if (error) return <div>Error loading markets: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Active Markets</h1>
        <Button>Create Market</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.activeMarkets?.map((market: any) => (
          <Card
            key={market.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{market.title}</CardTitle>
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                  {market.category}
                </span>
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
                  <span className="text-sm text-muted-foreground">
                    Expires:
                  </span>
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
        ))}
      </div>

      {data?.activeMarkets?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No active markets found.</p>
          <Button className="mt-4">Create the first market</Button>
        </div>
      )}
    </div>
  );
}
