import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Portfolio } from './pages/Portfolio';
import { WalletContextProvider } from './contexts/WalletContext';

function App() {
  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-background">
        <Layout>
          <Routes>
            <Route path="/" element={<Events />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:ticker" element={<EventDetail />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>
        </Layout>
      </div>
    </WalletContextProvider>
  );
}

export default App;
