'use client';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAccessibleRoutes, getRoleHierarchy, UserRole } from '@/lib/roles';

export const RoleAccessInfo: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const userRole = user.role as UserRole;
  const accessibleRoutes = getAccessibleRoutes(userRole);
  const roleHierarchy = getRoleHierarchy(userRole);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return 'text-red-600 bg-red-100';
      case 'admin':
        return 'text-blue-600 bg-blue-100';
      case 'moderator':
        return 'text-purple-600 bg-purple-100';
      case 'user':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return 'pi pi-shield';
      case 'admin':
        return 'pi pi-user-plus';
      case 'moderator':
        return 'pi pi-user-check';
      case 'user':
        return 'pi pi-user';
      default:
        return 'pi pi-user';
    }
  };

  return (
    <div className="role-access-info">
      <div className="role-access-card">
        <div className="role-access-header">
          <div className="role-info">
            <div className={`role-badge ${getRoleColor(userRole)}`}>
              <i className={getRoleIcon(userRole)}></i>
              <span className="role-name">{userRole}</span>
            </div>
            <div className="user-info">
              <span className="username">{user.username}</span>
              <span className="role-description">
                {userRole === 'superadmin' && 'Full system access and control'}
                {userRole === 'admin' && 'Administrative access to most features'}
                {userRole === 'moderator' && 'Moderate access to system features'}
                {userRole === 'user' && 'Basic access to essential features'}
              </span>
            </div>
          </div>
        </div>

        <div className="access-summary">
          <div className="access-stats">
            <div className="stat-item">
              <span className="stat-label">Accessible Pages</span>
              <span className="stat-value">{accessibleRoutes.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Role Level</span>
              <span className="stat-value">{roleHierarchy}/4</span>
            </div>
          </div>

          <div className="accessible-features">
            <h6 className="features-title">Your Accessible Features:</h6>
            <div className="features-grid">
              {accessibleRoutes.slice(0, 6).map((route) => (
                <div key={route.path} className="feature-item">
                  <i className="pi pi-check-circle text-green-500"></i>
                  <span className="feature-name">{route.title}</span>
                </div>
              ))}
              {accessibleRoutes.length > 6 && (
                <div className="feature-item">
                  <i className="pi pi-ellipsis-h text-gray-400"></i>
                  <span className="feature-name">+{accessibleRoutes.length - 6} more</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 