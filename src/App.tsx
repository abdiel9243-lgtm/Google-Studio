import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import MatchSetup from './pages/MatchSetup';
import Game from './pages/Game';
import Results from './pages/Results';
import Questions from './pages/Questions';
import Settings from './pages/Settings';
import Instructions from './pages/Instructions';
import History from './pages/History';
import Layout from './components/Layout';
import Splash from './components/Splash';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="teams" element={<Teams />} />
          <Route path="setup" element={<MatchSetup />} />
          <Route path="game/:id" element={<Game />} />
          <Route path="results/:id" element={<Results />} />
          <Route path="questions" element={<Questions />} />
          <Route path="settings" element={<Settings />} />
          <Route path="history" element={<History />} />
          <Route path="instructions" element={<Instructions />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
