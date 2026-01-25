import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Markets } from './pages/Markets';
import { MarketDetail } from './pages/MarketDetail';
import { Portfolio } from './pages/Portfolio';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Layout>
        <Routes>
          <Route path="/" element={<Markets />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/markets/:id" element={<MarketDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
