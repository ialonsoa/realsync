import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PropertiesListPage from './pages/properties/PropertiesListPage';
import PropertyDetailsPage from './pages/properties/PropertyDetailsPage';
import CreatePropertyPage from './pages/properties/CreatePropertyPage';
import EditPropertyPage from './pages/properties/EditPropertyPage';
import TimelinePage from './pages/timeline/TimelinePage';
import DocumentsPage from './pages/documents/DocumentsPage';
import EstimatorPage from './pages/estimator/EstimatorPage';
import ChatPage from './pages/chat/ChatPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import PricingPage from './pages/pricing/PricingPage';
import CreateProfile from './pages/profile/CreateProfile';
import ViewProfile from './pages/profile/ViewProfile';
import EditProfile from './pages/profile/EditProfile';
import PrivacySettings from './pages/profile/PrivacySettings';
import ManageSubscription from './pages/billing/ManageSubscription';

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

        {/* Profile creation - special route */}
        <Route
          path="/profile/create"
          element={isAuthenticated ? <CreateProfile /> : <Navigate to="/login" replace />}
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
          <Route path="/billing" element={<ManageSubscription />} />
          {/* Profile routes */}
          <Route path="/profile" element={<ViewProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/privacy" element={<PrivacySettings />} />
          {/* Property routes */}
          <Route path="/properties" element={<PropertiesListPage />} />
          <Route path="/properties/new" element={<CreatePropertyPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/properties/:id/edit" element={<EditPropertyPage />} />
          {/* Legacy routes with parameters (redirect to simple routes) */}
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
