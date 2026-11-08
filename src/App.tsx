import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider } from './contexts/TenantContext';
import { DairyProvider } from './contexts/DairyContext';
import { IntegrationsProvider } from './contexts/IntegrationsContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { EmployeeLayout } from './components/layout/EmployeeLayout';
import { CustomerLayout } from './components/layout/CustomerLayout';

// Auth Pages
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { DeliveryLoginPage } from './pages/auth/DeliveryLoginPage';
import { CustomerLoginPage } from './pages/auth/CustomerLoginPage';
import { SuperAdminLoginPage } from './pages/auth/SuperAdminLoginPage';
import DemoMain from './components/ui/demo';

// Super Admin Module (Phase 1 Platform SaaS Console)
import { SuperAdminPortal } from './pages/superadmin/SuperAdminPortal';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CustomerManagement } from './pages/admin/CustomerManagement';
import { EmployeeManagement } from './pages/admin/EmployeeManagement';
import { RouteManagement } from './pages/admin/RouteManagement';
import { VendorManagement } from './pages/admin/VendorManagement';
import { MilkPurchases } from './pages/admin/MilkPurchases';
import { StockManagement } from './pages/admin/StockManagement';
import { PauseManagement } from './pages/admin/PauseManagement';
import { DailyDeliveries } from './pages/admin/DailyDeliveries';
import { ProductCatalogue } from './pages/admin/ProductCatalogue';
import { ProductOrders } from './pages/admin/ProductOrders';
import { MonthlyBilling } from './pages/admin/MonthlyBilling';
import { PaymentManagement } from './pages/admin/PaymentManagement';
import { WhatsAppNotifications } from './pages/admin/WhatsAppNotifications';
import { ReportsAnalytics } from './pages/admin/ReportsAnalytics';
import { AdminSettings } from './pages/admin/AdminSettings';

// Employee Portal
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';

// Customer Portal
import { CustomerPortal } from './pages/customer/CustomerPortal';

import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <TenantProvider>
        <DairyProvider>
          <IntegrationsProvider>
            <BrowserRouter>
              <Routes>
                {/* 1. Public Landing Page */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<LandingPage />} />

                {/* 2. Dedicated Role Logins */}
                <Route path="/demo" element={<DemoMain />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login/admin" element={<AdminLoginPage />} />
                <Route path="/login/delivery" element={<DeliveryLoginPage />} />
                <Route path="/login/customer" element={<CustomerLoginPage />} />
                <Route path="/login/super-admin" element={<SuperAdminLoginPage />} />
                <Route path="/admin/login" element={<Navigate to="/login/admin" replace />} />
                <Route path="/employee/login" element={<Navigate to="/login/delivery" replace />} />
                <Route path="/delivery/login" element={<Navigate to="/login/delivery" replace />} />
                <Route path="/customer/login" element={<Navigate to="/login/customer" replace />} />
                <Route path="/super-admin/login" element={<Navigate to="/login/super-admin" replace />} />

                {/* 2. Module 1: Super Admin Platform Module */}
                <Route path="/super-admin" element={<SuperAdminPortal />} />
                <Route path="/super-admin/*" element={<SuperAdminPortal />} />

                {/* 3. Module 2: Admin Business Workspace */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="customers" element={<CustomerManagement />} />
                  <Route path="employees" element={<EmployeeManagement />} />
                  <Route path="routes" element={<RouteManagement />} />
                  <Route path="vendors" element={<VendorManagement />} />
                  <Route path="purchases" element={<MilkPurchases />} />
                  <Route path="inventory" element={<StockManagement />} />
                  <Route path="pauses" element={<PauseManagement />} />
                  <Route path="deliveries" element={<DailyDeliveries />} />
                  <Route path="products" element={<ProductCatalogue />} />
                  <Route path="orders" element={<ProductOrders />} />
                  <Route path="billing" element={<MonthlyBilling />} />
                  <Route path="payments" element={<PaymentManagement />} />
                  <Route path="notifications" element={<WhatsAppNotifications />} />
                  <Route path="reports" element={<ReportsAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* 4. Module 3: Delivery Boy Portal */}
                <Route
                  path="/employee"
                  element={
                    <ProtectedRoute allowedRoles={['DELIVERY_BOY', 'ADMIN', 'SUPER_ADMIN']}>
                      <EmployeeLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/employee/home" replace />} />
                  <Route path="home" element={<EmployeeDashboard defaultTab="home" />} />
                  <Route path="route" element={<EmployeeDashboard defaultTab="route" />} />
                  <Route path="deliveries" element={<EmployeeDashboard defaultTab="deliveries" />} />
                  <Route path="history" element={<EmployeeDashboard defaultTab="history" />} />
                  <Route path="profile" element={<EmployeeDashboard defaultTab="profile" />} />
                </Route>

                {/* 5. Module 4: Customer / User Portal */}
                <Route
                  path="/customer"
                  element={
                    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']}>
                      <CustomerLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/customer/home" replace />} />
                  <Route path="home" element={<CustomerPortal defaultTab="home" />} />
                  <Route path="bills" element={<CustomerPortal defaultTab="bills" />} />
                  <Route path="deliveries" element={<CustomerPortal defaultTab="deliveries" />} />
                  <Route path="pause" element={<CustomerPortal defaultTab="pause" />} />
                  <Route path="profile" element={<CustomerPortal defaultTab="profile" />} />
                  <Route path="portal" element={<CustomerPortal defaultTab="home" />} />
                </Route>

                {/* Quick Shortcuts */}
                <Route path="/delivery" element={<Navigate to="/employee/deliveries" replace />} />

                {/* Root Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </IntegrationsProvider>
        </DairyProvider>
      </TenantProvider>
    </ErrorBoundary>
  );
};

export default App;
