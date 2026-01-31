# Sprint 4: Mobile-First UI Refactoring

## Sprint Information

**Sprint Number**: Sprint 4  
**Duration**: February 24, 2026 to March 9, 2026 (2 weeks)  
**Sprint Goal**: Refactor frontend codebase to mobile-first responsive design for optimal dApp experience on all devices  
**Status**: **PLANNING** 📋

---

## Strategic Context

### Mobile-First dApp Strategy 📱

> **Vision**: Prediction Terminal is a mobile-first dApp designed for users who trade prediction markets on the go. Our primary target is mobile wallet users (Phantom, Solflare mobile) accessing the platform from smartphones.

**Why Mobile-First?**

1. **User Behavior**: 70%+ of crypto users access dApps via mobile
2. **Wallet Integration**: Mobile wallets (Phantom, Solflare) are dominant
3. **Trading Patterns**: Quick trades require fast, touch-optimized UI
4. **Market Opportunity**: Most prediction market UIs are desktop-centric
5. **Progressive Enhancement**: Build for mobile, enhance for desktop

**Design Philosophy**:
- Design for 375px width first (iPhone SE)
- Progressive enhancement to tablet (768px) and desktop (1024px+)
- Touch-first interactions (44px minimum tap targets)
- Thumb-zone optimization for primary actions
- Performance-first (fast load on mobile networks)

---

## Sprint Startup Rules ⚠️

### Following Established Process

**Before any implementation work begins:**

1. **Reference Analysis Phase** (Day 1)
   - Audit current frontend components for mobile issues
   - Research mobile dApp UI patterns (Uniswap, Jupiter, etc.)
   - Document touch target and accessibility gaps
   - Analyze current breakpoint usage

2. **Design Phase** (Day 1-2)
   - Create mobile wireframes for all pages
   - Define responsive breakpoint strategy
   - Design mobile navigation pattern (bottom nav)
   - Establish touch-friendly component specifications

3. **Implementation Phase** (Day 3+)
   - Refactor components mobile-first
   - Add responsive breakpoints progressively
   - Implement mobile navigation
   - Test on actual mobile devices

---

## Sprint Goal & Success Criteria

### Primary Goal

> Transform the Prediction Terminal frontend from desktop-first to mobile-first responsive design, ensuring optimal user experience on smartphones while maintaining desktop functionality.

### Success Criteria ✅

- [ ] All pages render correctly on 375px mobile width
- [ ] Touch targets are minimum 44x44px on mobile
- [ ] Mobile bottom navigation implemented
- [ ] Desktop sidebar adapts to mobile hamburger/bottom nav
- [ ] Trading panel optimized for mobile interaction
- [ ] Portfolio page readable and usable on mobile
- [ ] Events list scrolls smoothly on mobile
- [ ] Performance: LCP < 2.5s on 4G mobile
- [ ] No horizontal scroll on any mobile viewport
- [ ] Wallet connection works seamlessly on mobile

---

## Team Capacity

**Available Working Days**: 10 days (2 weeks)  
**Estimated Velocity**: 34 story points  
**Focus Factor**: 0.85 (UI refactoring involves visual testing)

---

## Sprint Backlog

### User Stories

| Story ID | Title | Story Points | Priority | Status | Epic |
|----------|-------|--------------|----------|--------|------|
| US-M001 | Implement mobile-first Layout with bottom navigation | 5 | Critical | 📋 Planning | Mobile Navigation |
| US-M002 | Refactor Events page for mobile | 5 | Critical | 📋 Planning | Mobile Pages |
| US-M003 | Refactor Portfolio page for mobile | 5 | Critical | 📋 Planning | Mobile Pages |
| US-M004 | Refactor Markets page for mobile | 3 | High | 📋 Planning | Mobile Pages |
| US-M005 | Mobile-optimize Trading Panel component | 5 | Critical | 📋 Planning | Mobile Components |
| US-M006 | Create responsive Card components | 3 | High | 📋 Planning | Mobile Components |
| US-M007 | Mobile-optimize Event/Market Detail pages | 5 | High | 📋 Planning | Mobile Pages |
| US-M008 | Implement mobile wallet connection UX | 3 | High | 📋 Planning | Mobile Wallet |
| US-M009 | Add pull-to-refresh and mobile gestures | 2 | Medium | 📋 Planning | Mobile UX |
| US-M010 | Performance optimization for mobile | 3 | Medium | 📋 Planning | Mobile Performance |

**Total Story Points**: 39 (adjusted for complexity)

---

## Detailed User Stories

### US-M001: Mobile-First Layout with Bottom Navigation (5 SP)

**As a** mobile user  
**I want** easy navigation via bottom tabs  
**So that** I can access all sections with my thumb

**Acceptance Criteria**:
- [ ] Bottom navigation bar on mobile (< 768px)
- [ ] 4 main tabs: Events, Markets, Portfolio, Settings
- [ ] Active state clearly visible
- [ ] Icons + labels on bottom nav
- [ ] Smooth transitions between views
- [ ] Desktop sidebar hidden on mobile, visible on lg+
- [ ] Hamburger menu alternative for secondary items

**Technical Implementation**:
```typescript
// Responsive layout approach
<div className="min-h-screen bg-slate-900">
  {/* Desktop sidebar - hidden on mobile */}
  <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
    <DesktopSidebar />
  </aside>
  
  {/* Main content - full width mobile, offset on desktop */}
  <main className="lg:pl-64 pb-16 lg:pb-0">
    {children}
  </main>
  
  {/* Mobile bottom nav - visible only on mobile */}
  <nav className="fixed bottom-0 inset-x-0 lg:hidden">
    <MobileBottomNav />
  </nav>
</div>
```

**Tasks**:
- [ ] Create MobileBottomNav component (3h)
- [ ] Refactor Layout.tsx for responsive behavior (2h)
- [ ] Add safe area insets for notched devices (1h)
- [ ] Implement active state animations (1h)
- [ ] Test on iOS and Android (2h)

---

### US-M002: Mobile Events Page (5 SP)

**As a** mobile user  
**I want** to browse events in a scrollable list  
**So that** I can quickly find markets to trade

**Acceptance Criteria**:
- [ ] Single-column card layout on mobile
- [ ] Category filter tabs horizontally scrollable
- [ ] Search bar sticky at top
- [ ] Event cards show essential info (title, prices, volume)
- [ ] Tap to expand for more details or navigate
- [ ] Infinite scroll works smoothly
- [ ] Pull-to-refresh support

**Mobile Design Specs**:
```
┌─────────────────────────┐
│  🔍 Search...          │ <- Sticky header
├─────────────────────────┤
│ [All][Sports][Crypto]→  │ <- Horizontal scroll tabs
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Event Title         │ │
│ │ Yes: 0.65 | No: 0.35│ │
│ │ Vol: $12.5K         │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Event Title         │ │
│ │ ...                 │ │
│ └─────────────────────┘ │
│         ...             │
├─────────────────────────┤
│ [Events][Markets][Port] │ <- Bottom nav
└─────────────────────────┘
```

**Tasks**:
- [ ] Create MobileEventCard component (3h)
- [ ] Implement horizontal scrollable filter tabs (2h)
- [ ] Add sticky search header (1h)
- [ ] Optimize infinite scroll for mobile (2h)
- [ ] Add touch feedback and animations (2h)

---

### US-M003: Mobile Portfolio Page (5 SP)

**As a** mobile user  
**I want** to view my positions and P&L on my phone  
**So that** I can monitor my portfolio anywhere

**Acceptance Criteria**:
- [ ] Portfolio summary cards stack vertically
- [ ] Key metrics prominent (Total Value, P&L, Win Rate)
- [ ] Position list is scrollable with clear hierarchy
- [ ] Swipe actions on positions (view details, redeem)
- [ ] P&L colors clearly visible
- [ ] Refresh button accessible
- [ ] Quick actions prominent (Redeem winning positions)

**Mobile Design Specs**:
```
┌─────────────────────────┐
│ Portfolio      [Refresh]│
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Total Value         │ │
│ │ $1,234.56           │ │
│ │ ▲ +$45.20 (+3.8%)   │ │
│ └─────────────────────┘ │
│ ┌──────────┬──────────┐ │
│ │ Win Rate │ Positions│ │
│ │ 68%      │ 12 Active│ │
│ └──────────┴──────────┘ │
├─────────────────────────┤
│ Active Positions        │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ BTC > $100K? - YES  │ │
│ │ 50 tokens @ $0.65   │ │
│ │ P&L: +$12.50        │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Tasks**:
- [ ] Create MobilePortfolioSummary component (2h)
- [ ] Create MobilePositionCard with swipe actions (3h)
- [ ] Implement collapsible sections (Active/Closed) (2h)
- [ ] Add redemption quick action (2h)
- [ ] Test with various position counts (1h)

---

### US-M004: Mobile Markets Page (3 SP)

**As a** mobile user  
**I want** to browse all active markets  
**So that** I can find specific trading opportunities

**Acceptance Criteria**:
- [ ] Market list in compact cards
- [ ] Filter/sort options in bottom sheet
- [ ] Search functionality
- [ ] Market status badges visible
- [ ] Quick stats (price, volume, time remaining)

**Tasks**:
- [ ] Create MobileMarketCard component (2h)
- [ ] Implement filter bottom sheet (2h)
- [ ] Add market search (1h)
- [ ] Test sorting and filtering (1h)

---

### US-M005: Mobile Trading Panel (5 SP)

**As a** mobile user  
**I want** to place trades easily on my phone  
**So that** I can act quickly on market movements

**Acceptance Criteria**:
- [ ] Full-screen or bottom sheet trading modal
- [ ] Large, touch-friendly YES/NO buttons
- [ ] Amount input with quick preset buttons ($10, $50, $100)
- [ ] Slider for position size
- [ ] Clear order summary before confirmation
- [ ] Swipe to confirm trade (prevent accidental taps)
- [ ] Loading state during transaction
- [ ] Success/error feedback with haptics

**Mobile Design Specs**:
```
┌─────────────────────────┐
│ Trade: BTC > $100K?   X │
├─────────────────────────┤
│                         │
│  ┌────────┐ ┌────────┐  │
│  │  YES   │ │   NO   │  │
│  │ $0.65  │ │ $0.35  │  │
│  └────────┘ └────────┘  │
│                         │
│  Amount: $___________   │
│  [$10] [$50] [$100]     │
│                         │
│  ═══════════○══════     │ <- Slider
│  Buying: 76.9 tokens    │
│                         │
├─────────────────────────┤
│  Est. Payout: $76.90    │
│  Fee: $0.15             │
├─────────────────────────┤
│  ┌─────────────────────┐│
│  │ ➜ Swipe to Trade    ││
│  └─────────────────────┘│
└─────────────────────────┘
```

**Tasks**:
- [ ] Create MobileTradingSheet component (3h)
- [ ] Implement swipe-to-confirm gesture (2h)
- [ ] Add haptic feedback integration (1h)
- [ ] Create amount presets and slider (2h)
- [ ] Add loading and success states (2h)

---

### US-M006: Responsive Card Components (3 SP)

**As a** developer  
**I want** reusable responsive card components  
**So that** I can build consistent mobile UIs

**Acceptance Criteria**:
- [ ] Card component scales properly at all breakpoints
- [ ] Touch targets minimum 44x44px
- [ ] Text remains readable (min 16px on mobile)
- [ ] Proper spacing on small screens
- [ ] Dark theme optimized for OLED screens

**Tasks**:
- [ ] Audit and update Card component (2h)
- [ ] Update Button component touch targets (1h)
- [ ] Create responsive typography scale (2h)
- [ ] Update spacing utilities (1h)

---

### US-M007: Mobile Event/Market Detail Pages (5 SP)

**As a** mobile user  
**I want** to view full event/market details  
**So that** I can make informed trading decisions

**Acceptance Criteria**:
- [ ] Full-screen detail view
- [ ] Back navigation prominent
- [ ] Key info above fold (prices, status, time)
- [ ] Trade button fixed at bottom
- [ ] Market stats scrollable
- [ ] Charts optimized for mobile
- [ ] Share functionality

**Tasks**:
- [ ] Refactor EventDetail.tsx for mobile (3h)
- [ ] Refactor MarketDetail.tsx for mobile (3h)
- [ ] Add fixed bottom trade CTA (1h)
- [ ] Optimize chart rendering for mobile (2h)
- [ ] Add share functionality (1h)

---

### US-M008: Mobile Wallet Connection (3 SP)

**As a** mobile user  
**I want** seamless wallet connection  
**So that** I can start trading quickly

**Acceptance Criteria**:
- [ ] Deep link to Phantom/Solflare mobile apps
- [ ] Clear connection status
- [ ] Easy disconnect option
- [ ] Wallet address truncated appropriately
- [ ] Connection persists across sessions

**Tasks**:
- [ ] Update WalletButton for mobile (2h)
- [ ] Test deep linking with mobile wallets (2h)
- [ ] Add connection state indicators (1h)
- [ ] Handle connection errors gracefully (1h)

---

### US-M009: Mobile Gestures & Interactions (2 SP)

**As a** mobile user  
**I want** native-feeling interactions  
**So that** the app feels natural on my phone

**Acceptance Criteria**:
- [ ] Pull-to-refresh on lists
- [ ] Swipe gestures on cards (where appropriate)
- [ ] Haptic feedback on actions
- [ ] Smooth scroll with momentum
- [ ] Prevent accidental actions

**Tasks**:
- [ ] Implement pull-to-refresh hook (2h)
- [ ] Add swipe gesture handlers (2h)
- [ ] Integrate haptic feedback API (1h)
- [ ] Test on physical devices (1h)

---

### US-M010: Mobile Performance Optimization (3 SP)

**As a** mobile user  
**I want** fast page loads  
**So that** I can trade quickly on mobile networks

**Acceptance Criteria**:
- [ ] LCP < 2.5s on 4G
- [ ] Bundle size optimized (code splitting)
- [ ] Images lazy loaded and optimized
- [ ] Reduce JavaScript execution time
- [ ] Cache GraphQL queries appropriately

**Tasks**:
- [ ] Implement route-based code splitting (2h)
- [ ] Add image optimization (1h)
- [ ] Audit and reduce bundle size (2h)
- [ ] Add performance monitoring (1h)

---

## Technical Specifications

### Breakpoint Strategy

```typescript
// tailwind.config.js additions
screens: {
  'xs': '375px',    // iPhone SE, small phones
  'sm': '640px',    // Large phones, small tablets
  'md': '768px',    // Tablets
  'lg': '1024px',   // Desktop
  'xl': '1280px',   // Large desktop
  '2xl': '1536px',  // Extra large
}

// Mobile-first classes
// Default: mobile (< 640px)
// sm: tablet portrait
// md: tablet landscape
// lg: desktop
// xl+: large screens
```

### Component Architecture

```
src/components/
├── layout/
│   ├── Layout.tsx           # Responsive layout wrapper
│   ├── DesktopSidebar.tsx   # Desktop navigation
│   ├── MobileBottomNav.tsx  # Mobile navigation
│   └── MobileHeader.tsx     # Mobile top bar
├── mobile/
│   ├── MobileCard.tsx       # Touch-optimized cards
│   ├── MobileSheet.tsx      # Bottom sheet component
│   ├── SwipeAction.tsx      # Swipe gesture handler
│   └── PullToRefresh.tsx    # Pull-to-refresh wrapper
├── trading/
│   ├── TradingPanel.tsx     # Desktop trading
│   └── MobileTradingSheet.tsx # Mobile trading
└── ui/
    └── ... (existing shadcn components)
```

### CSS Utilities to Add

```css
/* Safe area handling for notched devices */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-top {
  padding-top: env(safe-area-inset-top);
}

/* Touch-friendly spacing */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Hide scrollbar but allow scroll */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

---

## Testing Strategy

### Device Testing Matrix

| Device | Screen Size | Priority | Test Method |
|--------|-------------|----------|-------------|
| iPhone SE | 375x667 | Critical | Physical device |
| iPhone 14 | 390x844 | Critical | Physical device |
| iPhone 14 Pro Max | 430x932 | High | Simulator |
| Samsung Galaxy S21 | 360x800 | High | Physical device |
| iPad Mini | 744x1133 | Medium | Simulator |
| iPad Pro | 1024x1366 | Medium | Simulator |

### Testing Checklist

- [ ] All pages render without horizontal scroll
- [ ] Touch targets are accessible (44px minimum)
- [ ] Text is readable without zooming
- [ ] Forms are usable (keyboard doesn't cover inputs)
- [ ] Modals/sheets work correctly
- [ ] Navigation is thumb-reachable
- [ ] Performance metrics within targets
- [ ] Wallet connection works on mobile browsers
- [ ] Deep links work with mobile wallets

---

## Risk Assessment

### High Risk

1. **Wallet Connection on Mobile Browsers**
   - Risk: Some mobile browsers restrict wallet deep links
   - Mitigation: Test extensively, provide fallback instructions
   
2. **Performance on Low-End Devices**
   - Risk: Complex UI may be slow on older phones
   - Mitigation: Performance budget, code splitting, lazy loading

### Medium Risk

1. **Touch Target Conflicts**
   - Risk: Dense UIs may have overlapping touch areas
   - Mitigation: Strict 44px minimum, spacing audit

2. **Different Mobile Browsers**
   - Risk: Safari/Chrome differences
   - Mitigation: Cross-browser testing, polyfills

### Low Risk

1. **Breakpoint Edge Cases**
   - Risk: Some viewports may look awkward
   - Mitigation: Test range of sizes, fluid design

---

## Sprint Schedule

### Week 1 (Feb 24-28)

| Day | Focus | Stories | Deliverables |
|-----|-------|---------|--------------|
| Mon | Analysis & Design | - | Mobile audit, wireframes |
| Tue | Layout & Navigation | US-M001 | MobileBottomNav, responsive Layout |
| Wed | Events Page | US-M002 | Mobile events list |
| Thu | Portfolio Page | US-M003 | Mobile portfolio view |
| Fri | Review & Testing | - | Week 1 review, device testing |

### Week 2 (Mar 3-7)

| Day | Focus | Stories | Deliverables |
|-----|-------|---------|--------------|
| Mon | Markets & Cards | US-M004, US-M006 | Markets page, card components |
| Tue | Trading Panel | US-M005 | Mobile trading sheet |
| Wed | Detail Pages | US-M007 | Event/Market detail mobile |
| Thu | Wallet & Polish | US-M008, US-M009 | Wallet UX, gestures |
| Fri | Performance & QA | US-M010 | Optimization, final testing |

---

## Definition of Done

### For Each User Story

- [ ] Works on 375px viewport
- [ ] Touch targets >= 44px
- [ ] No horizontal scroll
- [ ] Text readable without zoom
- [ ] Dark theme looks good
- [ ] Tested on physical device
- [ ] Code reviewed
- [ ] No console errors

### For Sprint

- [ ] All critical pages mobile-optimized
- [ ] LCP < 2.5s on 4G
- [ ] Mobile navigation complete
- [ ] Trading flow works on mobile
- [ ] Wallet connection works on mobile
- [ ] Documentation updated

---

## Dependencies

### External Dependencies

- [ ] Mobile wallet testing access (Phantom, Solflare)
- [ ] Physical test devices available
- [ ] Design mockups approved (if designer involved)

### Technical Dependencies

- [ ] No backend changes required
- [ ] Tailwind config updates
- [ ] New mobile-specific components

---

## Success Metrics

### Quantitative

- **Page Load**: LCP < 2.5s on 4G
- **Touch Targets**: 100% >= 44px
- **Viewport Fit**: 0 horizontal scroll issues
- **Bundle Size**: < 300KB initial load

### Qualitative

- App feels native on mobile
- Trading is easy with one hand
- Information hierarchy is clear
- Users can complete core tasks quickly

---

## Notes & Decisions

### Design Decisions

1. **Bottom Navigation over Hamburger Menu**: More discoverable, thumb-friendly
2. **Swipe-to-Confirm for Trades**: Prevents accidental trades
3. **Sheet-Based Trading**: Full-screen focus for important actions
4. **Progressive Enhancement**: Mobile-first CSS, enhance for desktop

### Deferred to Future Sprint

- PWA / Add to Home Screen
- Offline support
- Push notifications
- Biometric authentication
- Native app (React Native) consideration

---

## References

### Mobile dApp Inspiration

- **Uniswap Mobile**: Clean trading interface
- **Jupiter**: Mobile-optimized Solana DEX
- **Polymarket**: Prediction market mobile UX
- **Synthesis.trade**: Prediction market mobile UX
- **Phantom Wallet**: Mobile-first crypto UX

### Technical References

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile Touch Guidelines](https://developer.apple.com/design/human-interface-guidelines/components/menus-and-actions/buttons)
- [Web Vitals](https://web.dev/vitals/)

---

**Sprint Status**: ✅ **READY FOR IMPLEMENTATION**  
**Sprint Start**: February 24, 2026  
**Sprint End**: March 9, 2026  
**Created**: January 31, 2026

---

## Testing Sprint Integration Note

> **Note**: Automated testing (from original Sprint 4 plan) is deferred to Sprint 5. Mobile-first is prioritized as it directly impacts user experience and dApp adoption. Testing infrastructure will build upon the mobile-first codebase.

**Sprint 5 Focus**: Automated testing + any mobile polish needed
