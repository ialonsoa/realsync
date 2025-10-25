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

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />
          }
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/properties/:id" element={<PropertyDetailsPage />} />
            <Route path="/transactions/:id/timeline" element={<TimelinePage />} />
            <Route path="/transactions/:id/documents" element={<DocumentsPage />} />
            <Route path="/transactions/:id/chat" element={<ChatPage />} />
            <Route path="/estimator" element={<EstimatorPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
