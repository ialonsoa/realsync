import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';

// Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import PropertyDetailsPage from './pages/properties/PropertyDetailsPage';
import TimelinePage from './pages/timeline/TimelinePage';
import DocumentsPage from './pages/documents/DocumentsPage';
import EstimatorPage from './pages/estimator/EstimatorPage';
import ChatPage from './pages/chat/ChatPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';

// Components
import Layout from './components/layout/Layout';

function App() {
  const { isAuthenticated, setAuth } = useAuthStore();

  // Demo mode: Auto-login with mock user on first load
  React.useEffect(() => {
    if (!isAuthenticated) {
      const mockUser = {
        id: 'demo-user-1',
        email: 'demo@realsync.pe',
        first_name: 'Demo',
        last_name: 'Usuario',
        role: 'AGENT' as const,
        phone: '+51 999 888 777',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setAuth(mockUser, 'demo-token', 'demo-refresh-token');
    }
  }, [isAuthenticated, setAuth]);

  return (
    <Router>
      <Routes>
        {/* Public routes - Hidden in demo mode */}
        <Route
          path="/login"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/register"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Main routes - Always accessible in demo mode */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/estimator" element={<EstimatorPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          {/* Legacy routes with parameters (redirect to simple routes) */}
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/transactions/:id/timeline" element={<Navigate to="/timeline" replace />} />
          <Route path="/transactions/:id/documents" element={<Navigate to="/documents" replace />} />
          <Route path="/transactions/:id/chat" element={<Navigate to="/chat" replace />} />
        </Route>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
