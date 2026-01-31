# Sprint 3: Position Tracking & Portfolio Management + Events Discovery - PLANNING

## Sprint Information

**Sprint Number**: Sprint 3
**Duration**: February 10, 2026 to February 23, 2026 (2 weeks)
**Sprint Goal**: Enable users to track their prediction market positions and portfolio performance, plus discover events through category filtering
**Status**: **PLANNING** 📋

## Sprint Startup Rules ⚠️ **APPLYING SPRINT 2 LESSONS**

**Before any implementation work begins:**

1. **Reference Analysis Phase** (Day 1)
   - Review all provided references (position data, portfolio calculations, events discovery APIs)
   - Analyze existing position tracking patterns and data structures
   - Document current capabilities and limitations

2. **Data Design Phase** (Day 1-2)
   - Design TypeScript interfaces for all position and portfolio data structures
   - Define GraphQL schema extensions for position tracking operations
   - Create API endpoint specifications for position management
   - Design events discovery interfaces and category filtering
   - Validate data flows end-to-end

3. **Implementation Phase** (Day 3+)
   - Begin coding only after data types and APIs are approved
   - Follow established patterns from previous sprints
   - Maintain consistent error handling and caching patterns
   - **NEW**: Include automated testing from day one

**This rule applies to ALL future sprints - validated as highly effective in Sprint 2.**

## Sprint Goal Alignment

> **Primary Goal**: Implement comprehensive position tracking and portfolio management to show users their prediction market holdings, P&L, and performance metrics. **Secondary Goal**: Add events discovery with category filtering to help users find relevant prediction markets.

**Success Criteria:**

- [ ] Users can view all their open prediction market positions
- [ ] Position values update in real-time with market price changes
- [ ] Portfolio P&L calculations are accurate and up-to-date
- [ ] Position history and trade history are available
- [ ] Users can close/settle positions when markets resolve
- [ ] Portfolio performance analytics and charts
- [ ] Foundation set for settlement and redemption in Sprint 4
- [ ] **NEW**: Users can filter events by categories (Sports, Crypto, Politics, etc.)
- [ ] **NEW**: Events discovery follows DFlow API patterns for tags and series filtering
- [ ] **NEW**: Category filter UI integrated into events page

## Team Capacity

**Available Working Days**: 10 days (2 weeks)
**Estimated Velocity**: 32 story points (23% increase from Sprint 2 - adding events discovery features)
**Focus Factor**: 0.9 (higher due to experience gained and improved process)

## Sprint Backlog

### Selected User Stories

| Story ID   | Title                                     | Story Points | Priority | Status          | Epic                 |
| ---------- | ----------------------------------------- | ------------ | -------- | --------------- | -------------------- |
| US-012     | Fetch user positions from DFlow           | 5            | High     | 📋 Planning     | Position Tracking    |
| US-013     | Display position values and P&L           | 5            | High     | 📋 Planning     | Position Tracking    |
| US-014A    | Design position database schema           | 3            | High     | 📋 Planning     | Position Tracking    |
| US-014B    | Implement basic position sync             | 3            | High     | 📋 Planning     | Position Tracking    |
| US-014C    | Add conflict resolution and validation    | 2            | High     | 📋 Planning     | Position Tracking    |
| US-015     | Real-time position value updates          | 5            | High     | 📋 Planning     | Position Tracking    |
| US-016     | Position history and analytics            | 3            | Medium   | 📋 Planning     | Position Tracking    |
| **US-017** | **Fetch tags by categories from DFlow**   | **3**        | **High** | **📋 Planning** | **Events Discovery** |
| **US-018** | **Filter series by tags/categories**      | **3**        | **High** | **📋 Planning** | **Events Discovery** |
| **US-019** | **Filter events by series tickers**       | **3**        | **High** | **📋 Planning** | **Events Discovery** |
| **US-020** | **Add category filter UI to events page** | **2**        | **High** | **📋 Planning** | **Events Discovery** |

**Total Story Points**: 32
**Velocity Alignment**: Increased scope to include events discovery features ✅

## Sprint 2 Lessons Applied

### ✅ **Process Improvements**

**What Worked Well in Sprint 2:**

- Reference Analysis → Data Design → Implementation workflow
- Complete API interface design before coding
- Comprehensive error handling and type safety
- Zero defects through quality focus

**Applied to Sprint 3:**

- Same startup process with added emphasis on automated testing
- Complete data design phase before implementation begins
- Include test-driven development practices
- Enhanced error handling and monitoring

### ✅ **Technical Improvements**

**Quality Enhancements:**

- Implement automated unit tests from day one
- Add integration tests for position tracking APIs
- Include performance monitoring and error tracking
- Code coverage targets: 80%+ for critical paths

**Architecture Patterns:**

- Follow established GraphQL and service layer patterns
- Implement proper caching for position data
- Real-time updates using GraphQL subscriptions
- Comprehensive error boundaries and fallbacks

### ✅ **Risk Mitigation**

**Based on Sprint 2 Experience:**

- API rate limiting: Implement client-side caching and rate limiting
- Performance monitoring: Add response time tracking from day one
- Error handling: Comprehensive error states for all position operations
- Testing: Automated tests prevent regression issues

## Reference Analysis (Pre-Implementation)

### Day 1 Reference Analysis Tasks

**Critical Research Questions:**

- [ ] Does DFlow provide a positions API endpoint?
- [ ] What data structure does DFlow use for position tracking?
- [ ] How should we calculate positions from trade history as fallback?
- [ ] What are the performance characteristics of position calculation?
- [ ] How do other prediction markets handle portfolio aggregation?
- [ ] **NEW**: What is the structure of DFlow's tags_by_categories API?
- [ ] **NEW**: How does series filtering work with tags?
- [ ] **NEW**: What are the performance characteristics of events filtering?

**Research Deliverables:**

- DFlow position API analysis document
- Position calculation algorithm specification
- Performance benchmarks and requirements
- Data flow diagrams for position sync
- **NEW**: Events discovery API analysis document
- **NEW**: Category filtering implementation specification

### Position Tracking Flow Analysis

Based on DFlow position data and trading history:

#### Key Position Components Identified:

1. **Position Data Structure**:

   ```typescript
   interface Position {
     marketId: string;
     outcome: 'YES' | 'NO';
     amount: number; // Token amount held
     entryPrice: number; // Average entry price
     currentPrice: number; // Current market price
     unrealizedPnL: number; // Current P&L
     marketStatus: 'active' | 'resolved' | 'settled';
   }
   ```

2. **Portfolio Aggregation**:
   - Total portfolio value across all positions
   - Realized P&L from closed positions
   - Unrealized P&L from open positions
   - Performance metrics and charts

3. **Real-time Updates**:
   - Price feed subscriptions for live P&L updates
   - Position status changes (active → resolved → settled)
   - Balance updates after trades

#### Data Sources:

- DFlow position API (if available)
- Local trade history and position calculations
- Real-time price feeds from markets
- Wallet balance monitoring

### Events Discovery Flow Analysis

Based on DFlow events discovery documentation: https://pond.dflow.net/quickstart/discover-prediction-tokens

#### Key Events Discovery Components Identified:

1. **Tags by Categories API**:

   ```typescript
   interface TagsByCategoriesResponse {
     tagsByCategories: Record<string, string[]>;
   }

   // Example response:
   {
     "tagsByCategories": {
       "Sports": ["Football", "Soccer", "Basketball"],
       "Crypto": ["BTC", "ETH", "Pre-Market"],
       "Politics": ["US Elections", "Trump", "Congress"]
     }
   }
   ```

2. **Series Filtering**:
   - Get series templates with category and tags
   - Filter series by selected tags/categories
   - Use series tickers to filter events

3. **Events Filtering by Series**:
   - Filter events using comma-separated series tickers
   - Maintain existing sorting and pagination
   - Support nested markets for trading data

#### Discovery Flow:

1. **Fetch Categories**: `GET /api/v1/tags_by_categories`
2. **Get Series by Tags**: `GET /api/v1/series?tags=football,soccer`
3. **Filter Events**: `GET /api/v1/events?series=serie1,serie2&withNestedMarkets=true`

#### UI Components:

- Category filter dropdown/buttons
- Tag-based filtering within categories
- Clear filter options
- Filter state persistence

## Data Type Design (Required Before Implementation)

### Position Interfaces

```typescript
// ==============================================================================
// POSITION INTERFACES
// ==============================================================================

interface UserPosition {
  id: string;
  userId: string;
  marketId: string;
  marketTitle: string;
  outcome: OutcomeType;
  amount: number; // Token amount held
  entryPrice: number; // Average entry price (USDC)
  currentPrice: number; // Current market price (USDC)
  marketPrice: number; // Current market price for the outcome
  unrealizedPnL: number; // Current unrealized P&L
  unrealizedPnLPercent: number; // P&L percentage
  marketStatus: MarketStatus;
  lastUpdated: Date;
  createdAt: Date;
}

interface PortfolioSummary {
  totalValue: number; // Total portfolio value in USDC
  totalUnrealizedPnL: number; // Total unrealized P&L
  totalRealizedPnL: number; // Total realized P&L from closed positions
  totalInvested: number; // Total USDC invested
  winRate: number; // Percentage of winning positions
  activePositions: number; // Number of open positions
  closedPositions: number; // Number of closed positions
}

// ==============================================================================
// PORTFOLIO INTERFACES
// ==============================================================================

interface PortfolioPosition extends UserPosition {
  weight: number; // Percentage of total portfolio
  allocation: number; // USDC value allocation
}

interface PortfolioHistory {
  date: Date;
  totalValue: number;
  dailyPnL: number;
  cumulativePnL: number;
}

interface PositionTrade {
  id: string;
  positionId: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  timestamp: Date;
  transactionSignature: string;
}

// ==============================================================================
// EVENTS DISCOVERY INTERFACES
// ==============================================================================

interface TagsByCategoriesResponse {
  tagsByCategories: Record<string, string[]>;
}

interface SeriesTemplate {
  ticker: string;
  title: string;
  category: string;
  tags: string[];
  frequency: string;
}

interface SeriesFilter {
  tags?: string[];
  categories?: string[];
  limit?: number;
  offset?: number;
}

interface EventsBySeriesFilter {
  seriesTickers: string[]; // Comma-separated series tickers
  limit?: number;
  offset?: number;
  sort?: DFlowEventSort;
  status?: DFlowMarketStatus[];
  withNestedMarkets?: boolean;
}
```

### GraphQL Schema Extensions

```graphql
# Position tracking queries and mutations
type Query {
  userPositions(userId: String!): [UserPosition!]!
  portfolioSummary(userId: String!): PortfolioSummary!
  positionHistory(positionId: ID!): [PositionTrade!]!
  portfolioHistory(userId: String!, days: Int): [PortfolioHistory!]!

  # Events discovery queries
  tagsByCategories: TagsByCategoriesResponse!
  seriesByTags(
    tags: [String!]
    categories: [String!]
    limit: Float
    offset: Float
  ): [SeriesTemplate!]!
  dflowEventsBySeries(
    seriesTickers: [String!]!
    limit: Float
    offset: Float
    sort: DFlowEventSort
    status: DFlowMarketStatus
    withNestedMarkets: Boolean
  ): [DFlowEvent!]!
}

type Mutation {
  refreshPositions(userId: String!): Boolean!
  closePosition(positionId: ID!): PositionClosureResult!
  updatePositionPrices: Boolean!
}

type Subscription {
  positionUpdates(userId: String!): UserPosition
  portfolioUpdates(userId: String!): PortfolioSummary
}

# Events discovery types
type TagsByCategoriesResponse {
  tagsByCategories: JSONObject!
}

type SeriesTemplate {
  ticker: String!
  title: String!
  category: String!
  tags: [String!]!
  frequency: String!
}

# Position types
type UserPosition {
  id: ID!
  marketId: String!
  marketTitle: String!
  outcome: OutcomeType!
  amount: Float!
  entryPrice: Float!
  currentPrice: Float!
  unrealizedPnL: Float!
  unrealizedPnLPercent: Float!
  marketStatus: MarketStatus!
  lastUpdated: DateTime!
}

type PortfolioSummary {
  totalValue: Float!
  totalUnrealizedPnL: Float!
  totalRealizedPnL: Float!
  winRate: Float!
  activePositions: Int!
  closedPositions: Int!
}

enum OutcomeType {
  YES
  NO
}

enum MarketStatus {
  ACTIVE
  RESOLVED
  SETTLED
}
```

## Detailed Story Breakdown

### US-012: Fetch user positions from DFlow (5 SP)

**Description**: Implement position fetching from DFlow APIs and local trade history

**Acceptance Criteria:**

- [ ] Positions fetched from DFlow position API (if available)
- [ ] Fallback to calculating positions from trade history
- [ ] Position data includes market info, amounts, entry prices
- [ ] Error handling for position fetch failures
- [ ] Caching implemented for performance

**Tasks:**

- [ ] Analyze DFlow position API availability and structure (2h)
- [ ] Implement position fetching service (3h)
- [ ] Add fallback position calculation from trades (4h)
- [ ] Implement caching layer for position data (2h)
- [ ] Add comprehensive error handling (2h)
- [ ] Write unit tests for position fetching (3h)

**Technical Notes:**

- Check if DFlow provides position API or if we need to calculate from trades
- Implement efficient caching to avoid repeated API calls
- Handle partial position data and error recovery

### US-013: Display position values and P&L (5 SP)

**Description**: Create UI components to display position information and P&L calculations

**Acceptance Criteria:**

- [ ] Position list shows all user positions with key metrics
- [ ] Real-time P&L calculations and percentage changes
- [ ] Position cards show market info, entry/exit prices
- [ ] Color-coded P&L indicators (green/red)
- [ ] Responsive design for mobile and desktop

**Tasks:**

- [ ] Design position card component (3h)
- [ ] Implement P&L calculation logic (2h)
- [ ] Create position list component (4h)
- [ ] Add real-time price updates (3h)
- [ ] Implement responsive design (2h)
- [ ] Add loading states and error handling (2h)

### US-014A: Design position database schema (3 SP)

**Description**: Design comprehensive database schema for position tracking and history

**Acceptance Criteria:**

- [ ] Complete database schema for positions, trades, and portfolio history
- [ ] Database migration scripts and versioning strategy
- [ ] Performance indexes for common query patterns
- [ ] Data integrity constraints and validation rules

**Tasks:**

- [ ] Design positions table with all required fields (2h)
- [ ] Create trade history and portfolio tables (2h)
- [ ] Add database indexes for performance (1h)
- [ ] Write migration scripts (1h)
- [ ] Document schema and relationships (1h)

### US-014B: Implement basic position sync (3 SP)

**Description**: Implement core position synchronization between DFlow and local database

**Acceptance Criteria:**

- [ ] Basic sync mechanism for position data
- [ ] Position updates trigger database updates
- [ ] Error handling for sync failures
- [ ] Sync status tracking and logging

**Tasks:**

- [ ] Implement position sync service (3h)
- [ ] Add sync trigger mechanisms (2h)
- [ ] Create sync status tracking (1h)
- [ ] Add error handling and logging (1h)
- [ ] Write unit tests for sync logic (2h)

### US-014C: Add conflict resolution and validation (2 SP)

**Description**: Add advanced conflict resolution and data validation for position sync

**Acceptance Criteria:**

- [ ] Conflict resolution for duplicate or inconsistent data
- [ ] Data validation and integrity checks
- [ ] Backup and recovery mechanisms
- [ ] Comprehensive error reporting

**Tasks:**

- [ ] Implement conflict resolution logic (2h)
- [ ] Add data validation checks (2h)
- [ ] Create backup and recovery features (1h)
- [ ] Write integration tests (2h)

### US-015: Real-time position value updates (5 SP)

**Description**: Implement real-time position value updates using GraphQL subscriptions

**Acceptance Criteria:**

- [ ] Position values update automatically with price changes
- [ ] GraphQL subscriptions for real-time position updates
- [ ] Efficient update mechanism without full page refreshes
- [ ] Connection handling and reconnection logic
- [ ] Performance optimized for multiple positions

**Tasks:**

- [ ] Implement GraphQL subscription for positions (3h)
- [ ] Add real-time price feed integration (3h)
- [ ] Implement position update calculations (2h)
- [ ] Add connection management and error handling (2h)
- [ ] Performance optimization for multiple subscriptions (2h)

### US-016: Position history and analytics (3 SP)

**Description**: Add position history viewing and basic analytics

**Acceptance Criteria:**

- [ ] Trade history for each position
- [ ] Position performance charts and metrics
- [ ] Entry/exit points visualization
- [ ] Basic analytics (win rate, average P&L)

**Tasks:**

- [ ] Implement position history queries (2h)
- [ ] Create analytics calculation service (2h)
- [ ] Design history UI components (3h)
- [ ] Add chart visualization (2h)

**Technical Notes:**

- Use existing chart library for visualization
- Focus on key metrics: win rate, average P&L, position duration
- Implement efficient queries for historical data

## Quality & Testing Strategy

### Automated Testing (NEW for Sprint 3)

**Unit Tests:**

- Position calculation logic
- P&L computation algorithms
- Database synchronization
- API error handling

**Integration Tests:**

- Position fetching from DFlow
- Database sync operations
- Real-time update subscriptions
- GraphQL query performance

**Code Coverage Target:** 80% for position tracking logic

### Performance Requirements

- Position list loads in <2 seconds
- Real-time updates <500ms latency
- Database queries <100ms
- Support for 100+ positions per user

### Monitoring & Observability

- API response time tracking
- Error rate monitoring
- Database performance metrics
- Real-time update success rates

## Risk Assessment

### High Risk Items

- **Position Calculation Accuracy**: Complex P&L calculations must be precise
  - **Mitigation**: Comprehensive unit tests, manual verification
- **Real-time Update Performance**: Multiple subscriptions may impact performance
  - **Mitigation**: Connection pooling, efficient update algorithms
- **Data Consistency**: Sync between DFlow and local database
  - **Mitigation**: Transactional updates, consistency checks

### Medium Risk Items

- **Database Schema Design**: Position history storage requirements
- **GraphQL Subscription Complexity**: Real-time update implementation
- **Mobile Performance**: Position list on mobile devices

## Sprint Success Metrics

### Functional Metrics

- ✅ All position data displays accurately
- ✅ P&L calculations are correct within 0.01 USDC
- ✅ Real-time updates work without manual refresh
- ✅ Database schema supports all position tracking requirements
- ✅ Position sync completes within 30 seconds with conflict resolution
- ✅ Portfolio analytics display meaningful insights

### Quality Metrics

- ✅ 80%+ code coverage for position logic
- ✅ Zero data inconsistency issues
- ✅ <2 second load times for position lists
- ✅ <500ms real-time update latency

### Process Metrics

- ✅ Complete Day 1 reference analysis with DFlow position API research
- ✅ Data design phase completed before any implementation starts
- ✅ Automated tests implemented from day one
- ✅ Database schema validated before sync implementation
- ✅ Daily standups and progress tracking
- ✅ Sprint review and retrospective conducted

---

**Sprint 3 Planning Complete - Ready for Reference Analysis Phase** ✅
**Next Steps**: Begin Day 1 reference analysis and data type design before any implementation

---

## Sprint 2 Retrospective Actions Applied

### ✅ **Process Improvements**

- **Same Startup Process**: Reference Analysis → Data Design → Implementation
- **Quality Focus**: Automated testing from day one
- **Complete Planning**: All interfaces designed before coding

### ✅ **Technical Enhancements**

- **Testing Strategy**: Unit and integration tests included in planning
- **Performance Monitoring**: Built-in from sprint start
- **Error Handling**: Comprehensive error states planned

### ✅ **Risk Mitigation**

- **Data Accuracy**: Rigorous testing and verification planned
- **Performance**: Monitoring and optimization included
- **Scalability**: Architecture designed for growth

**Created By**: Development Team
**Date**: January 28, 2026
**Sprint Start**: February 10, 2026
**Next Action**: Begin reference analysis and data type design</content>
<parameter name="filePath">/Users/ducdt/Workspace/learning/prediction-market/prediction-terminal/documents/agile/sprints/sprint-3-plan.md
