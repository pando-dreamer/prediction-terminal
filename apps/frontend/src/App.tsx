import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Events } from './pages/Events';
import { Markets } from './pages/Markets';
import { MarketDetail } from './pages/MarketDetail';
import { DFlowMarketDetail } from './pages/DFlowMarketDetail';
import { EventDetail } from './pages/EventDetail';
import { Portfolio } from './pages/Portfolio';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Layout>
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:ticker" element={<EventDetail />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/markets/:id" element={<MarketDetail />} />
          <Route
            path="/markets/dflow/:ticker"
            element={<DFlowMarketDetail />}
          />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
