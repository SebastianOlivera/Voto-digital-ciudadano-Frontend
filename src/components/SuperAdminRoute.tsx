import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

export const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isSuperAdmin } = useAuth();

  if (!isAuthenticated || !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};