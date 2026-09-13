import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireCompleteProfile?: boolean;
}

const ProtectedRoute = ({ children, requireCompleteProfile = true }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireCompleteProfile && !user.profileComplete) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
