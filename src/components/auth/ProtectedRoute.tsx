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
        const email = currentUser.email || 'customer@milkerp.com';
        const name = currentUser.name && currentUser.name !== 'Guest' ? currentUser.name : 'Customer';
        const demoPayload = {
          userId: 'user-cust-01',
          email,
          name,
          role: 'CUSTOMER',
          tenantId: 'tenant-dairynexa',
          exp: Math.floor(Date.now() / 1000) + 86400 * 30,
        };
        const b64 = btoa(JSON.stringify(demoPayload));
        const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${b64}.mocksignature`;
        localStorage.setItem('milkerp_access_token', mockJwt);
        localStorage.setItem('milkerp_active_tenant_id', 'tenant-dairynexa');
        login('customer', email, name, 'user-cust-01');
      }
    }

    // 2. Delivery Rider Portal: Open directly with Delivery Staff session
    if (path.startsWith('/employee') || path.startsWith('/delivery')) {
      if (!token || currentUser.role !== 'employee') {
        const email = currentUser.email || 'delivery@dairynexa.com';
        const name = currentUser.name && currentUser.name !== 'Guest' ? currentUser.name : 'Delivery Staff';
        const demoPayload = {
          userId: 'user-deliv-01',
          email,
          name,
          role: 'DELIVERY_BOY',
          tenantId: 'tenant-dairynexa',
          exp: Math.floor(Date.now() / 1000) + 86400 * 30,
        };
        const b64 = btoa(JSON.stringify(demoPayload));
        const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${b64}.mocksignature`;
        localStorage.setItem('milkerp_access_token', mockJwt);
        localStorage.setItem('milkerp_active_tenant_id', 'tenant-dairynexa');
        login('employee', email, name, 'user-deliv-01');
      }
    }

    // 3. Admin Portal: Open directly with Admin session
    if (path.startsWith('/admin')) {
      if (!token || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
        const email = currentUser.email || 'admin@dairynexa.com';
        const name = currentUser.name && currentUser.name !== 'Guest' ? currentUser.name : 'Administrator';
        const demoPayload = {
          userId: 'user-admin-vally',
          email,
          name,
          role: 'ADMIN',
          tenantId: 'tenant-dairynexa',
          exp: Math.floor(Date.now() / 1000) + 86400 * 30,
        };
        const b64 = btoa(JSON.stringify(demoPayload));
        const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${b64}.mocksignature`;
        localStorage.setItem('milkerp_access_token', mockJwt);
        localStorage.setItem('milkerp_active_tenant_id', 'tenant-dairynexa');
        login('admin', email, name, 'user-admin-vally');
      }
    }
  }, [path, token, currentUser.role, login]);

  return <>{children}</>;
};
