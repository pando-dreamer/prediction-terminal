import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { WalletContextProvider } from './contexts/WalletContext';

// Lazy load pages for better initial load performance
const Events = lazy(() =>
  import('./pages/Events').then(module => ({ default: module.Events }))
);
const EventDetail = lazy(() =>
  import('./pages/EventDetail').then(module => ({
    default: module.EventDetail,
  }))
);
const Portfolio = lazy(() =>
  import('./pages/Portfolio').then(module => ({ default: module.Portfolio }))
);

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-background">
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Events />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:ticker" element={<EventDetail />} />
              <Route path="/portfolio" element={<Portfolio />} />
            </Routes>
          </Suspense>
        </Layout>
      </div>
    </WalletContextProvider>
  );
}

export default App;
