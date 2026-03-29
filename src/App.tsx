import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ImporterPage from './pages/ImporterPage';
import TripPage from './pages/TripPage';
import ItinerariesPage from './pages/ItinerariesPage';
import SessionSync from '@/components/SessionSync';
import { AuthProvider } from '@/context/AuthContext';
import { TopNavBar } from '@/components/TopNavBar';

function AnimatedContent() {
  const location = useLocation();
  const showNav = location.pathname !== '/login';

  return (
    <>
      {showNav && <TopNavBar />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, filter: 'blur(6px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ willChange: 'opacity, filter', transform: 'translateZ(0)' }}
          className="flex-1 flex flex-col"
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/importer" element={<ImporterPage />} />
            <Route path="/trips" element={<ItinerariesPage />} />
            <Route path="/trips/:id" element={<TripPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <SessionSync />
        <AnimatedContent />
      </Router>
    </AuthProvider>
  );
}
