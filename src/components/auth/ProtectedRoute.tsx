import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken } from '../../services/api/apiClient';
import { authApi } from '../../services/api/authApi';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectUrl?: string;
}

function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectUrl,
}) => {
  const location = useLocation();
  const token = getAuthToken();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Determine fallback login URL based on role
  const getLoginRedirect = () => {
    if (redirectUrl) return redirectUrl;
    if (allowedRoles?.includes('SUPER_ADMIN')) return '/super-admin';
    if (allowedRoles?.includes('ADMIN')) return '/login/admin';
    if (allowedRoles?.includes('DELIVERY_BOY')) return '/login/delivery';
    if (allowedRoles?.includes('CUSTOMER')) return '/login/customer';
    return '/login';
  };

  if (!token) {
    return <Navigate to={getLoginRedirect()} state={{ from: location }} replace />;
  }

  // Parse JWT token claims
  const payload = parseJwt(token);
  if (!payload || !payload.role) {
    localStorage.removeItem('milkerp_access_token');
    return <Navigate to={getLoginRedirect()} state={{ from: location }} replace />;
  }

  // Check token expiry
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    // Token is expired; attempt refresh or redirect
    const refreshToken = localStorage.getItem('milkerp_refresh_token');
    if (!refreshToken) {
      localStorage.removeItem('milkerp_access_token');
      return <Navigate to={getLoginRedirect()} state={{ from: location }} replace />;
    }
  }

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = payload.role.toUpperCase();
    const isAllowed = allowedRoles.some(
      r => r.toUpperCase() === userRole || (userRole === 'SUPER_ADMIN')
    );

    if (!isAllowed) {
      // Role mismatch: redirect to the appropriate portal for the user's role
      if (userRole === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
      if (userRole === 'DELIVERY_BOY') return <Navigate to="/employee/deliveries" replace />;
      if (userRole === 'CUSTOMER') return <Navigate to="/customer/home" replace />;
      if (userRole === 'SUPER_ADMIN') return <Navigate to="/super-admin" replace />;
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

