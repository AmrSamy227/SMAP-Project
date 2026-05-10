import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store/authStore';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    const locale = window.location.pathname.split('/')[1] || 'en';
    return <Navigate to={`/${locale}/`} replace />;
  }

  return <>{children}</>;
};
