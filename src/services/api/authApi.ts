import { api } from './apiClient';

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId?: string | null;
    tenant?: {
      id: string;
      name: string;
      slug: string;
      logoEmoji: string;
      primaryColor: string;
    } | null;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  login: async (email: string, passwordPlain: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', {
      email,
      password: passwordPlain,
    });
    if (res.tokens?.accessToken) {
      localStorage.setItem('milkerp_access_token', res.tokens.accessToken);
      localStorage.setItem('milkerp_refresh_token', res.tokens.refreshToken);
      if (res.user.tenantId) {
        localStorage.setItem('milkerp_active_tenant_id', res.user.tenantId);
      }
    }
    return res;
  },

  loginWithGoogle: async (
    idToken: string
  ): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/google', {
      idToken,
    });
    if (res.tokens?.accessToken) {
      localStorage.setItem('milkerp_access_token', res.tokens.accessToken);
      localStorage.setItem('milkerp_refresh_token', res.tokens.refreshToken);
      if (res.user.tenantId) {
        localStorage.setItem('milkerp_active_tenant_id', res.user.tenantId);
      }
    }
    return res;
  },

  refreshToken: async (token?: string): Promise<{ accessToken: string; refreshToken?: string }> => {
    const currentRefreshToken = token || localStorage.getItem('milkerp_refresh_token');
    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }
    const res = await api.post<{ accessToken: string; refreshToken?: string }>('/auth/refresh', {
      refreshToken: currentRefreshToken,
    });
    if (res.accessToken) {
      localStorage.setItem('milkerp_access_token', res.accessToken);
      if (res.refreshToken) {
        localStorage.setItem('milkerp_refresh_token', res.refreshToken);
      }
    }
    return res;
  },

  registerOnboarding: async (data: {
    businessName: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    requestedSlug: string;
    requestedPlan: string;
    message?: string;
  }) => {
    return await api.post('/auth/onboarding', data);
  },

  getProfile: async () => {
    return await api.get('/auth/me');
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('milkerp_access_token');
      localStorage.removeItem('milkerp_refresh_token');
      localStorage.removeItem('milkerp_active_tenant_id');
      localStorage.removeItem('harish_dairy_session');
    }
  },
};
