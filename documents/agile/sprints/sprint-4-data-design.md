# Sprint 4: Data Design - Mobile-First UI Components

## Design Date: January 31, 2026

---

## 1. Responsive Breakpoint Strategy

### Tailwind Configuration Update

```typescript
// tailwind.config.js - screens extension
screens: {
  'xs': '375px',    // iPhone SE, small phones
  'sm': '640px',    // Large phones, phablets
  'md': '768px',    // Tablets portrait
  'lg': '1024px',   // Tablets landscape, small laptops
  'xl': '1280px',   // Desktop
  '2xl': '1536px',  // Large desktop
}
```

### Mobile-First CSS Class Pattern

```tsx
// ❌ Desktop-first (AVOID)
className="flex lg:block"

// ✅ Mobile-first (USE)
className="block lg:flex"

// Default styles = mobile
// Add breakpoint modifiers to enhance for larger screens
```

---

## 2. New CSS Utilities

### Safe Area Insets

```css
/* For notched devices (iPhone X+) */
.safe-top {
  padding-top: env(safe-area-inset-top);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-left {
  padding-left: env(safe-area-inset-left);
}

.safe-right {
  padding-right: env(safe-area-inset-right);
}

.safe-x {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.safe-y {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Touch Target Utilities

```css
/* Minimum touch target (44px as per Apple HIG) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Larger touch target (48px recommended) */
.touch-target-lg {
  min-height: 48px;
  min-width: 48px;
}
```

### Scrollbar Utilities

```css
/* Hide scrollbar while maintaining scroll functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Horizontal scroll container */
.scroll-x {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}
```

### Selection Prevention

```css
/* Prevent text selection on interactive elements */
.no-select {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
```

---

## 3. Component Specifications

### 3.1 MobileBottomNav Component

**File:** `src/components/layout/MobileBottomNav.tsx`

```typescript
interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface MobileBottomNavProps {
  items: NavItem[];
}
```

**Visual Specs:**
- Height: 64px + safe-area-inset-bottom
- Background: slate-800 with backdrop blur
- Border-top: 1px slate-700
- Icons: 24x24px
- Labels: 10px, medium weight
- Touch target: 48px minimum per tab
- Active state: blue-500 color

**Layout:**
```
┌─────────────────────────────────────────┐
│  [Icon]   [Icon]   [Icon]   [Icon]      │ 64px
│  Events   Markets  Portfolio  More      │
├─────────────────────────────────────────┤
│              safe-area                   │ env(safe-area-inset-bottom)
└─────────────────────────────────────────┘
```

### 3.2 MobileHeader Component

**File:** `src/components/layout/MobileHeader.tsx`

```typescript
interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}
```

**Visual Specs:**
- Height: 56px + safe-area-inset-top
- Background: slate-900/95 with backdrop blur
- Title: 18px, semibold, center-aligned
- Back button: left, 44x44px touch target
- Right action slot: optional

### 3.3 Responsive Layout Component

**File:** `src/components/layout/Layout.tsx` (refactor)

```typescript
interface LayoutProps {
  children: React.ReactNode;
}

// Structure
<div className="min-h-screen bg-slate-900">
  {/* Desktop sidebar - hidden on mobile */}
  <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
    <DesktopSidebar />
  </aside>

  {/* Mobile header - visible only on mobile */}
  <header className="lg:hidden fixed top-0 inset-x-0 z-40">
    <MobileHeader />
  </header>

  {/* Main content area */}
  <main className="
    pt-14 pb-20        /* Mobile: header + bottom nav */
    lg:pt-0 lg:pb-0    /* Desktop: no padding needed */
    lg:pl-64           /* Desktop: offset for sidebar */
  ">
    {children}
  </main>

  {/* Mobile bottom navigation - visible only on mobile */}
  <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40">
    <MobileBottomNav />
  </nav>
</div>
```

### 3.4 MobileSheet Component (Bottom Sheet)

**File:** `src/components/mobile/MobileSheet.tsx`

```typescript
interface MobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];  // e.g., [0.5, 0.9] for 50% and 90%
}
```

**Visual Specs:**
- Backdrop: black/50 opacity
- Sheet: slate-800, rounded-t-2xl
- Handle: 32px wide, 4px tall, slate-600
- Animation: slide up with spring physics
- Swipe down to dismiss
- Max height: 90vh

### 3.5 MobileTradingSheet Component

**File:** `src/components/trading/MobileTradingSheet.tsx`

```typescript
interface MobileTradingSheetProps {
  market: {
    ticker: string;
    title: string;
    yesPrice: number;
    noPrice: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTradeComplete?: (result: TradeResult) => void;
}

interface TradeFormState {
  side: 'yes' | 'no';
  type: 'buy' | 'sell';
  amount: number;
}
```

**Visual Specs:**
```
┌─────────────────────────────────────────┐
│ ─────          (handle)                 │
│                                         │
│  Trade: BTC > $100K?              [X]   │
├─────────────────────────────────────────┤
│                                         │
│   ┌──────────────┐  ┌──────────────┐    │
│   │     YES      │  │      NO      │    │
│   │    $0.65     │  │    $0.35     │    │
│   └──────────────┘  └──────────────┘    │
│                                         │
│   Amount                                │
│   ┌─────────────────────────────────┐   │
│   │  $                        50.00 │   │
│   └─────────────────────────────────┘   │
│                                         │
│   [$10]   [$25]   [$50]   [$100]        │
│                                         │
│   ────────────────●─────────────────    │
│   Buying: 76.9 tokens                   │
│                                         │
├─────────────────────────────────────────┤
│   Est. Payout     │   Fee               │
│   $76.90          │   $0.15             │
├─────────────────────────────────────────┤
│   ┌─────────────────────────────────┐   │
│   │      ➜ Swipe to Trade           │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Interactions:**
- YES/NO buttons: 48px height, full width each half
- Amount presets: 44px height buttons
- Slider: 44px touch target
- Swipe to confirm: 56px height, requires 70% swipe

### 3.6 Mobile Event Card

**File:** `src/components/mobile/MobileEventCard.tsx`

```typescript
interface MobileEventCardProps {
  event: {
    ticker: string;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    volume: number;
    volume24h: number;
    markets: Market[];
  };
  onClick?: () => void;
}
```

**Visual Specs:**
```
┌───────────────────────────────────────────┐
│ ┌────┐                                    │
│ │IMG │  Event Title That Might Wrap       │
│ │48px│  Category • $12.5K volume          │
│ └────┘                                    │
├───────────────────────────────────────────┤
│ Market 1: Yes $0.65 | No $0.35        >   │
│ Market 2: Yes $0.72 | No $0.28        >   │
└───────────────────────────────────────────┘
```

**Touch Specs:**
- Card: Full-width, minimum height 100px
- Market rows: 44px height each
- Tap anywhere to navigate

### 3.7 Mobile Position Card

**File:** `src/components/mobile/MobilePositionCard.tsx`

```typescript
interface MobilePositionCardProps {
  position: {
    id: string;
    marketTitle: string;
    side: 'yes' | 'no';
    balance: number;
    averagePrice: number;
    currentPrice: number;
    pnl: number;
    pnlPercent: number;
    isRedeemable: boolean;
  };
  onSwipeAction?: (action: 'details' | 'redeem') => void;
}
```

**Swipe Actions:**
- Swipe right: View details (blue)
- Swipe left: Redeem (green, if redeemable)

---

## 4. Responsive Grid System

### Events Page Grid

```tsx
// Mobile: single column
// Tablet: 2 columns
// Desktop: 3 columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

### Portfolio Summary Cards

```tsx
// Mobile: stacked
// Tablet+: side by side
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
```

---

## 5. Typography Scale (Mobile-Optimized)

### Heading Sizes

| Element | Mobile | Tablet+ | Class |
|---------|--------|---------|-------|
| Page Title | 24px | 30px | `text-2xl lg:text-3xl` |
| Section Title | 20px | 24px | `text-xl lg:text-2xl` |
| Card Title | 16px | 18px | `text-base lg:text-lg` |
| Subtitle | 14px | 14px | `text-sm` |
| Body | 16px | 16px | `text-base` |
| Caption | 12px | 12px | `text-xs` |

### Line Height for Readability

- Headings: 1.2 (`leading-tight`)
- Body: 1.5 (`leading-normal`)
- Long text: 1.625 (`leading-relaxed`)

---

## 6. Spacing System (Mobile-Adjusted)

### Page Padding

```tsx
// Mobile: 16px padding
// Tablet+: 24px padding
className="p-4 md:p-6"
```

### Card Padding

```tsx
// Mobile: 12px padding
// Tablet+: 16-24px padding
className="p-3 md:p-4 lg:p-6"
```

### Gap Between Elements

```tsx
// Mobile: 12px gap
// Tablet+: 16-24px gap
className="space-y-3 md:space-y-4 lg:space-y-6"
```

---

## 7. Button Variants Update

### New Touch-Friendly Sizes

```typescript
// button.tsx variants addition
size: {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
  // NEW: Mobile-optimized
  touch: 'h-12 px-6 py-3 text-base',  // 48px height
  'touch-icon': 'h-12 w-12',           // 48px square
}
```

---

## 8. Navigation State Management

### Mobile Navigation Context

```typescript
interface MobileNavContext {
  isOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showSheet: (content: React.ReactNode) => void;
  hideSheet: () => void;
}
```

### URL-Based Tab State

```tsx
// Tabs map to routes
const navItems = [
  { name: 'Events', href: '/', icon: Calendar },
  { name: 'Markets', href: '/markets', icon: TrendingUp },
  { name: 'Portfolio', href: '/portfolio', icon: BarChart3 },
  { name: 'More', href: '#more', icon: MoreHorizontal },  // Opens menu
];
```

---

## 9. Animation Specifications

### Sheet Animations

```css
/* Bottom sheet slide up */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Timing: spring-like */
animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
```

### Tab Transitions

```css
/* Active indicator */
transition: all 0.2s ease-out;
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Performance Considerations

### Code Splitting Strategy

```typescript
// Route-based splitting
const Events = lazy(() => import('./pages/Events'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Markets = lazy(() => import('./pages/Markets'));
const EventDetail = lazy(() => import('./pages/EventDetail'));

// Component-based splitting
const TradingPanel = lazy(() => import('./components/TradingPanel'));
const MobileTradingSheet = lazy(() => import('./components/trading/MobileTradingSheet'));
```

### Image Loading

```tsx
// Lazy load images below fold
<img
  src={imageUrl}
  loading="lazy"
  decoding="async"
  width={48}
  height={48}
  alt={title}
/>
```

---

## 11. Testing Viewport Matrix

### Required Test Viewports

| Device | Width | Height | Priority |
|--------|-------|--------|----------|
| iPhone SE | 375px | 667px | Critical |
| iPhone 14 | 390px | 844px | Critical |
| iPhone 14 Pro Max | 430px | 932px | High |
| Samsung Galaxy S21 | 360px | 800px | High |
| iPad Mini | 744px | 1133px | Medium |
| iPad Pro | 1024px | 1366px | Medium |
| Desktop | 1440px | 900px | High |

---

## 12. File Structure

### New Files to Create

```
src/components/
├── layout/
│   ├── Layout.tsx              # REFACTOR
│   ├── DesktopSidebar.tsx      # NEW - Extract from Layout
│   ├── MobileBottomNav.tsx     # NEW
│   └── MobileHeader.tsx        # NEW
├── mobile/
│   ├── MobileSheet.tsx         # NEW
│   ├── MobileEventCard.tsx     # NEW
│   ├── MobilePositionCard.tsx  # NEW
│   ├── PullToRefresh.tsx       # NEW
│   └── SwipeAction.tsx         # NEW
└── trading/
    └── MobileTradingSheet.tsx  # NEW
```

### Files to Modify

```
src/
├── index.css                   # Add utilities
├── pages/
│   ├── Events.tsx              # Mobile layout
│   ├── Portfolio.tsx           # Mobile layout
│   ├── Markets.tsx             # Mobile layout
│   └── EventDetail.tsx         # Mobile layout
└── components/
    ├── TradingPanel.tsx        # Responsive
    └── ui/
        └── button.tsx          # Touch sizes
```

### Config Files to Update

```
apps/frontend/
└── tailwind.config.js          # Breakpoints, utilities
```

---

## 13. Implementation Order

### Day 1-2: Foundation
1. Update tailwind.config.js with breakpoints
2. Add CSS utilities to index.css
3. Create MobileBottomNav component
4. Refactor Layout.tsx for responsive

### Day 3-4: Pages
5. Mobile Events page layout
6. Mobile Portfolio page layout
7. Mobile Markets page layout

### Day 5-6: Trading
8. Create MobileTradingSheet
9. Update TradingPanel for responsive

### Day 7-8: Polish
10. Event/Market detail pages
11. Swipe gestures and animations
12. Performance optimization

### Day 9-10: Testing
13. Device testing
14. Bug fixes
15. Final polish

---

## 14. Success Validation Checklist

### Visual Validation
- [ ] No horizontal scroll at 375px
- [ ] All text readable without zoom
- [ ] Touch targets >= 44px
- [ ] Proper spacing on mobile

### Functional Validation
- [ ] Navigation works on mobile
- [ ] Trading flow completes on mobile
- [ ] Wallet connects on mobile
- [ ] Lists scroll smoothly

### Performance Validation
- [ ] LCP < 2.5s on 4G
- [ ] No layout shift during load
- [ ] Bundle < 300KB initial

---

**Document Status**: ✅ Complete  
**Ready for Implementation**: Yes  
**Created**: January 31, 2026
