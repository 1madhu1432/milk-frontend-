import React from 'react';
import { useLocation } from 'react-router-dom';
import { getAuthToken } from '../../services/api/apiClient';
import { useDairy } from '../../contexts/DairyContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectUrl?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const location = useLocation();
  const token = getAuthToken();
  const { currentUser, login } = useDairy();

  const path = location.pathname.toLowerCase();

  React.useEffect(() => {
    // 1. Customer Portal: Open directly with Customer session
    if (path.startsWith('/customer')) {
      if (!token || currentUser.role !== 'customer') {
        const demoPayload = {
          userId: 'user-cust-01',
          email: 'customer@dailydairy.demo',
          name: 'Rajesh Reddy',
          role: 'CUSTOMER',
          tenantId: 'tenant-harish-dairy',
          exp: Math.floor(Date.now() / 1000) + 86400 * 30,
        };
        const b64 = btoa(JSON.stringify(demoPayload));
        const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${b64}.mocksignature`;
        localStorage.setItem('milkerp_access_token', mockJwt);
        localStorage.setItem('milkerp_active_tenant_id', 'tenant-harish-dairy');
        login('customer', 'customer@dailydairy.demo', 'Rajesh Reddy', 'user-cust-01');
      }
    }

    // 2. Delivery Rider Portal: Open directly with Delivery Staff session
    if (path.startsWith('/employee') || path.startsWith('/delivery')) {
      if (!token || currentUser.role !== 'employee') {
        const demoPayload = {
          userId: 'user-deliv-01',
          email: 'delivery@dailydairy.demo',
          name: 'Suresh Kumar Goud (Route 2 Rider)',
          role: 'DELIVERY_BOY',
          tenantId: 'tenant-harish-dairy',
          exp: Math.floor(Date.now() / 1000) + 86400 * 30,
        };
        const b64 = btoa(JSON.stringify(demoPayload));
        const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${b64}.mocksignature`;
        localStorage.setItem('milkerp_access_token', mockJwt);
        localStorage.setItem('milkerp_active_tenant_id', 'tenant-harish-dairy');
        login('employee', 'delivery@dailydairy.demo', 'Suresh Kumar Goud', 'user-deliv-01');
      }
    }

    // 3. Admin Portal: Open directly with Admin session
    if (path.startsWith('/admin')) {
      if (!token || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
        const demoPayload = {
          userId: 'user-admin-01',
          email: 'admin@dailydairy.demo',
          name: 'Harish Rao (Dairy Owner)',
          role: 'ADMIN',
          tenantId: 'tenant-harish-dairy',
          exp: Math.floor(Date.now() / 1000) + 86400 * 30,
        };
        const b64 = btoa(JSON.stringify(demoPayload));
        const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${b64}.mocksignature`;
        localStorage.setItem('milkerp_access_token', mockJwt);
        localStorage.setItem('milkerp_active_tenant_id', 'tenant-harish-dairy');
        login('admin', 'admin@dailydairy.demo', 'Harish Rao (Dairy Owner)', 'user-admin-01');
      }
    }
  }, [path, token, currentUser.role, login]);

  return <>{children}</>;
};
