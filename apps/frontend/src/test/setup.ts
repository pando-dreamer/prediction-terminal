import '@testing-library/jest-dom';
import React from 'react';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Solana wallet adapter
vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    publicKey: null,
    connected: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    signTransaction: vi.fn(),
    signAllTransactions: vi.fn(),
    signMessage: vi.fn(),
  }),
  WalletProvider: ({ children }: { children: React.ReactNode }) => children,
  useConnection: () => ({
    connection: {
      getTokenAccountBalance: vi.fn(),
      getParsedTokenAccountsByOwner: vi.fn(),
      sendRawTransaction: vi.fn(),
      getSignatureStatuses: vi.fn(),
    },
  }),
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  useNavigate: vi.fn(),
  useLocation: vi.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
  })),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement('a', { href: to }, children),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ element }: { element: React.ReactNode }) => element,
}));

// Mock Apollo Client
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
  useMutation: vi.fn(() => [vi.fn(), { loading: false, error: null }]),
  useLazyQuery: vi.fn(() => [
    vi.fn(),
    { loading: false, error: null, data: null },
  ]),
  gql: vi.fn((template: TemplateStringsArray) => template.join('')),
  ApolloProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Calendar: () => 'Calendar',
  BarChart3: () => 'BarChart3',
  Settings: () => 'Settings',
  RefreshCw: () => 'RefreshCw',
  ChevronDown: () => 'ChevronDown',
  X: () => 'X',
  ArrowLeft: () => 'ArrowLeft',
  CheckCircle: () => 'CheckCircle',
  AlertCircle: () => 'AlertCircle',
  Wallet: () => 'Wallet',
  TrendingUp: () => 'TrendingUp',
  Filter: () => 'Filter',
  Download: () => 'Download',
  AlertTriangle: () => 'AlertTriangle',
  Search: () => 'Search',
  Zap: () => 'Zap',
  Clock: () => 'Clock',
  Bell: () => 'Bell',
  Shield: () => 'Shield',
  Palette: () => 'Palette',
  SettingsIcon: () => 'SettingsIcon',
}));
