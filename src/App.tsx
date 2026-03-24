import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ImporterPage from './pages/ImporterPage';
import TripPage from './pages/TripPage';
import ItinerariesPage from './pages/ItinerariesPage';
import SessionSync from '@/components/SessionSync';
import { AuthProvider } from '@/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <SessionSync />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/importer" element={<ImporterPage />} />
          <Route path="/trips" element={<ItinerariesPage />} />
          <Route path="/trips/:id" element={<TripPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
