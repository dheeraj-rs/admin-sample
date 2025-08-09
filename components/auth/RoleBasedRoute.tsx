'use client';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { hasPermission, getRoutePermission, UserRole } from '@/lib/roles';
import Loader from '../sample/loading/loader';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRole?: UserRole;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  fallback,
  requiredRole 
}) => {
  const { isAuthenticated, isLoading, user, error } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Check if user has permission for this route
      const hasRoutePermission = hasPermission(pathname, user.role as UserRole);
      
      if (!hasRoutePermission) {
        // Redirect to dashboard if user doesn't have permission
        router.push('/');
      }
    }
    // Note: We don't redirect to login here since InitialLoader handles that
  }, [isAuthenticated, isLoading, user, pathname, router]);

  // Show loading state only if we're still loading and not in initial loader phase
  if (isLoading) {
    return fallback || (
      <Loader finishLoading={() => {}} />
    );
  }

  // Check if user is authenticated and has permission
  if (isAuthenticated && user) {
    const hasRoutePermission = hasPermission(pathname, user.role as UserRole);
    
    if (hasRoutePermission) {
      return <>{children}</>;
    } else {
      // Show access denied message
      return (
        <div className="role-based-route-error">
          <div className="role-based-route-error-content">
            <div className="role-based-route-error-icon">
              <i className="pi pi-lock"></i>
            </div>
            <h1>Access Denied</h1>
            <p>
              You don&apos;t have permission to access this page. 
              {user.role && (
                <span className="role-based-route-user-role">
                  Your role: <span className="role-based-route-role-name">{user.role}</span>
                </span>
              )}
            </p>
            <button 
              onClick={() => router.push('/')}
              className="role-based-route-dashboard-btn"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  // If not authenticated, this should be handled by InitialLoader
  // But as a fallback, redirect to login
  if (!isAuthenticated) {
    router.push('/auth/pin');
    return null;
  }

  // This should not be reached due to the useEffect redirect
  return null;
}; 