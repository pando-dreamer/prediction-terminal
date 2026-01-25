# API Documentation

## GraphQL Schema

### Authentication

#### Register User

```graphql
mutation Register($registerInput: RegisterInput!) {
  register(registerInput: $registerInput) {
    id
    email
    username
    balance
    createdAt
  }
}
```

**Input:**

```typescript
{
  email: string
  username: string
  password: string (min 6 chars)
}
```

#### Login

```graphql
mutation Login($loginInput: LoginInput!) {
  login(loginInput: $loginInput) {
    id
    email
    username
    balance
  }
}
```

**Input:**

```typescript
{
  email: string;
  password: string;
}
```

### Markets

#### Get All Active Markets

```graphql
query GetActiveMarkets {
  activeMarkets {
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
  }
}
```

#### Get Specific Market

```graphql
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
    outcome
    resolvedAt
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
      createdAt
    }
  }
}
```

#### Create Market

```graphql
mutation CreateMarket($createMarketInput: CreateMarketInput!) {
  createMarket(createMarketInput: $createMarketInput) {
    id
    title
    description
    category
    currentPrice
    expiryDate
    status
  }
}
```

**Input:**

```typescript
{
  title: string
  description: string
  category: MarketCategory
  expiryDate: Date
  currentPrice?: number
}
```

#### Resolve Market

```graphql
mutation ResolveMarket($id: ID!, $outcome: Boolean!) {
  resolveMarket(id: $id, outcome: $outcome) {
    id
    status
    outcome
    resolvedAt
  }
}
```

### Users

#### Get User Profile

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    email
    username
    balance
    positions {
      id
      type
      entryPrice
      amount
      shares
      market {
        id
        title
        status
      }
    }
    createdAt
  }
}
```

## Enums

### MarketCategory

```typescript
enum MarketCategory {
  SPORTS = "SPORTS"
  POLITICS = "POLITICS"
  CRYPTO = "CRYPTO"
  ENTERTAINMENT = "ENTERTAINMENT"
  OTHER = "OTHER"
}
```

### MarketStatus

```typescript
enum MarketStatus {
  ACTIVE = "ACTIVE"
  CLOSED = "CLOSED"
  RESOLVED = "RESOLVED"
}
```

### PositionType

```typescript
enum PositionType {
  YES = "YES"
  NO = "NO"
}
```

## Error Handling

### Common Error Responses

```json
{
  "errors": [
    {
      "message": "Invalid credentials",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### Error Codes

- `UNAUTHENTICATED`: Invalid login credentials
- `FORBIDDEN`: Insufficient permissions
- `BAD_USER_INPUT`: Invalid input data
- `INTERNAL_SERVER_ERROR`: Server-side error

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Market queries**: 100 requests per minute
- **Trading operations**: 10 requests per minute

## Pagination

For endpoints returning lists, use:

```graphql
query GetMarkets($limit: Int, $offset: Int) {
  markets(limit: $limit, offset: $offset) {
    # ... fields
  }
}
```

## Real-time Subscriptions

### Market Price Updates

```graphql
subscription MarketPriceUpdated($marketId: ID!) {
  marketPriceUpdated(marketId: $marketId) {
    id
    currentPrice
    totalVolume
    updatedAt
  }
}
```

### New Positions

```graphql
subscription NewPosition($marketId: ID!) {
  newPosition(marketId: $marketId) {
    id
    type
    entryPrice
    amount
    user {
      username
    }
    createdAt
  }
}
```

## Usage Examples

### Frontend Apollo Client Setup

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://localhost:3001/graphql',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
```

### Making Queries

```typescript
import { useQuery } from '@apollo/client';
import { GET_ACTIVE_MARKETS } from './queries';

function Markets() {
  const { loading, error, data } = useQuery(GET_ACTIVE_MARKETS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data.activeMarkets.map(market => (
        <div key={market.id}>{market.title}</div>
      ))}
    </div>
  );
}
```

### Making Mutations

```typescript
import { useMutation } from '@apollo/client';
import { CREATE_MARKET } from './mutations';

function CreateMarketForm() {
  const [createMarket] = useMutation(CREATE_MARKET);

  const handleSubmit = async formData => {
    try {
      const { data } = await createMarket({
        variables: { createMarketInput: formData },
      });
      console.log('Market created:', data.createMarket);
    } catch (error) {
      console.error('Error creating market:', error);
    }
  };

  // ... form implementation
}
```
