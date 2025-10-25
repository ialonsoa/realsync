import { useAuthStore } from '@/store/auth';
import AgentDashboard from './AgentDashboard';
import OwnerDashboard from './OwnerDashboard';
import BuyerDashboard from './BuyerDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (user?.role === 'AGENT' || user?.role === 'CO_AGENT' || user?.role === 'ADMIN_AGENCY') {
    return <AgentDashboard />;
  }

  if (user?.role === 'OWNER') {
    return <OwnerDashboard />;
  }

  if (user?.role === 'BUYER') {
    return <BuyerDashboard />;
  }

  return <div>Dashboard</div>;
}
