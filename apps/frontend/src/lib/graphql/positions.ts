import { gql } from '@apollo/client';

// Fragment for position data
export const USER_POSITION_FRAGMENT = gql`
  fragment UserPositionFragment on UserPosition {
    id
    userId
    walletAddress
    mint
    balance
    balanceRaw
    decimals
    marketId
    marketTitle
    outcome
    baseMint
    entryPrice
    currentPrice
    marketPrice
    estimatedValue
    unrealizedPnL
    unrealizedPnLPercent
    marketStatus
    isRedeemable
    positionType
    costBasis
    riskLevel
    daysHeld
    createdAt
    updatedAt
    lastPriceUpdate
  }
`;

// Fragment for portfolio summary
export const PORTFOLIO_SUMMARY_FRAGMENT = gql`
  fragment PortfolioSummaryFragment on PortfolioSummary {
    totalPositions
    activePositions
    resolvedPositions
    totalValue
    totalCostBasis
    availableBalance
    totalUnrealizedPnL
    totalRealizedPnL
    netPnL
    portfolioReturn
    redeemablePositions
    redeemableValue
    winRate
    averagePositionSize
    largestPosition
    averageHoldingPeriod
    portfolioRisk
    diversificationScore
    dailyPnL
    weeklyPnL
    monthlyPnL
  }
`;

// Query to get user positions
export const GET_USER_POSITIONS = gql`
  ${USER_POSITION_FRAGMENT}
  query GetUserPositions(
    $walletAddress: String!
    $filters: PositionFiltersInput
  ) {
    userPositions(walletAddress: $walletAddress, filters: $filters) {
      ...UserPositionFragment
    }
  }
`;

// Query to get portfolio summary
export const GET_PORTFOLIO_SUMMARY = gql`
  ${PORTFOLIO_SUMMARY_FRAGMENT}
  query GetPortfolioSummary($walletAddress: String!) {
    portfolioSummary(walletAddress: $walletAddress) {
      ...PortfolioSummaryFragment
    }
  }
`;

// Query to get redeemable positions
export const GET_REDEEMABLE_POSITIONS = gql`
  ${USER_POSITION_FRAGMENT}
  query GetRedeemablePositions($walletAddress: String!) {
    redeemablePositions(walletAddress: $walletAddress) {
      ...UserPositionFragment
    }
  }
`;

// Query to get position history
export const GET_POSITION_HISTORY = gql`
  query GetPositionHistory($positionId: ID!, $limit: Int, $offset: Int) {
    positionHistory(positionId: $positionId, limit: $limit, offset: $offset) {
      id
      transactionSignature
      tradeType
      amount
      price
      fee
      orderId
      executionMode
      slippageBps
      priceImpact
      timestamp
      createdAt
    }
  }
`;

// Mutation to refresh positions
export const REFRESH_USER_POSITIONS = gql`
  mutation RefreshUserPositions($walletAddress: String!) {
    refreshUserPositions(walletAddress: $walletAddress) {
      success
      positionsFound
      positionsUpdated
      errors
      lastRefresh
    }
  }
`;

// Mutation to redeem position
export const REDEEM_POSITION = gql`
  mutation RedeemPosition($positionId: ID!, $amount: Float) {
    redeemPosition(positionId: $positionId, amount: $amount) {
      success
      transactionSignature
      amountRedeemed
      amountReceived
      error
      orderId
    }
  }
`;

// Mutation to create redemption order
export const CREATE_REDEMPTION_ORDER = gql`
  mutation CreateRedemptionOrder($request: RedemptionRequestInput!) {
    createRedemptionOrder(request: $request) {
      success
      transactionSignature
      amountRedeemed
      amountReceived
      error
      orderId
    }
  }
`;

// Subscription for position updates
export const POSITION_UPDATES_SUBSCRIPTION = gql`
  ${USER_POSITION_FRAGMENT}
  subscription PositionUpdates($walletAddress: String!) {
    positionUpdates(walletAddress: $walletAddress) {
      ...UserPositionFragment
    }
  }
`;

// Subscription for portfolio updates
export const PORTFOLIO_UPDATES_SUBSCRIPTION = gql`
  ${PORTFOLIO_SUMMARY_FRAGMENT}
  subscription PortfolioUpdates($walletAddress: String!) {
    portfolioUpdates(walletAddress: $walletAddress) {
      ...PortfolioSummaryFragment
    }
  }
`;

// Subscription for price updates
export const PRICE_UPDATES_SUBSCRIPTION = gql`
  subscription PriceUpdates($mints: [String!]!) {
    priceUpdates(mints: $mints) {
      marketId
      outcome
      currentPrice
      priceChange24h
      priceChangePercent24h
      volume24h
      lastUpdated
      source
    }
  }
`;
