import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ConferenceDetailPage from './pages/ConferenceDetailPage';

import AuthPage from './pages/AuthPage';
import SavedPage from './pages/SavedPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen">
        {/* Subtle global background noise/stars */}
        <div className="fixed inset-0 bg-star-pattern opacity-10 pointer-events-none" />
        
        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/conference/:slug" element={<ConferenceDetailPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

        <footer className="border-t border-white/5 py-12 bg-space-950">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
              © 2026 SpaceConf. Built for the global space exploration community.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
