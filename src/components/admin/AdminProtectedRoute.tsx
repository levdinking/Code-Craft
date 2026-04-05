import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';

export function AdminProtectedRoute() {
  const { isAuthenticated, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Extract lang from URL
    const lang = window.location.pathname.split('/')[1] || 'ru';
    return <Navigate to={`/${lang}/admin`} replace />;
  }

  return <Outlet />;
}
