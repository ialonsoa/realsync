import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PropertyDetailsPage from './pages/properties/PropertyDetailsPage';
import TimelinePage from './pages/timeline/TimelinePage';
import DocumentsPage from './pages/documents/DocumentsPage';
import EstimatorPage from './pages/estimator/EstimatorPage';
import ChatPage from './pages/chat/ChatPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import PricingPage from './pages/pricing/PricingPage';

// Components
import Layout from './components/layout/Layout';

function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  // Initialize auth on app load
  React.useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />

        {/* Protected routes - require authentication */}
        <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/estimator" element={<EstimatorPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          {/* Legacy routes with parameters (redirect to simple routes) */}
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/transactions/:id/timeline" element={<Navigate to="/timeline" replace />} />
          <Route path="/transactions/:id/documents" element={<Navigate to="/documents" replace />} />
          <Route path="/transactions/:id/chat" element={<Navigate to="/chat" replace />} />
        </Route>

        {/* Redirect root to dashboard or login */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
