const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:4000/api/v1');

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ApiError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('milkerp_access_token');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('milkerp_refresh_token');
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const activeTenantId = localStorage.getItem('milkerp_active_tenant_id');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (activeTenantId) {
    headers['x-tenant-id'] = activeTenantId;
  }

  return headers;
}

let isRefreshing = false;
let refreshSubscribers: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

function subscribeTokenRefresh(
  resolve: (token: string) => void,
  reject: (err: any) => void
) {
  refreshSubscribers.push({ resolve, reject });
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach(sub => sub.resolve(token));
  refreshSubscribers = [];
}

function onRefreshFailed(err: any) {
  refreshSubscribers.forEach(sub => sub.reject(err));
  refreshSubscribers = [];
}

async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-DairyNexa-Client': 'true',
      },
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.success && data.data?.accessToken) {
      localStorage.setItem('milkerp_access_token', data.data.accessToken);
      if (data.data.refreshToken) {
        localStorage.setItem('milkerp_refresh_token', data.data.refreshToken);
      }
      return data.data.accessToken;
    }
  } catch {
    // Network failure during refresh
  }
  return null;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit & { _retry?: boolean } = {}
): Promise<T> {
  const token = getAuthToken();
  const activeTenantId = localStorage.getItem('milkerp_active_tenant_id');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-DairyNexa-Client': 'true',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (activeTenantId) {
    headers['x-tenant-id'] = activeTenantId;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });

    // Check for 401 Unauthorized to trigger automatic refresh token rotation
    if (res.status === 401 && !options._retry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise<T>((resolve, reject) => {
          subscribeTokenRefresh(
            async (newToken: string) => {
              try {
                headers['Authorization'] = `Bearer ${newToken}`;
                const retryRes = await fetch(url, { ...options, headers, _retry: true } as any);
                const retryJson: ApiResponse<T> = await retryRes.json().catch(() => ({
                  success: false,
                  message: `Failed to parse response (${retryRes.status})`,
                }));
                if (!retryRes.ok || !retryJson.success) {
                  reject(new ApiError(retryJson.message || 'Request failed after token refresh', retryRes.status));
                  return;
                }
                resolve(retryJson.data as T);
              } catch (err) {
                reject(err);
              }
            },
            (err) => {
              reject(err);
            }
          );
        });
      }

      options._retry = true;
      isRefreshing = true;

      const newToken = await attemptTokenRefresh();
      isRefreshing = false;

      if (newToken) {
        onRefreshed(newToken);
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryRes = await fetch(url, { ...options, headers });
        const retryJson: ApiResponse<T> = await retryRes.json().catch(() => ({
          success: false,
          message: `Failed to parse response (${retryRes.status})`,
        }));
        if (!retryRes.ok || !retryJson.success) {
          throw new ApiError(retryJson.message || 'Request failed after token refresh', retryRes.status);
        }
        return retryJson.data as T;
      } else {
        const refreshErr = new ApiError('Authentication session expired', 401);
        onRefreshFailed(refreshErr);
        // Refresh failed: clear credentials and notify application
        localStorage.removeItem('milkerp_access_token');
        localStorage.removeItem('milkerp_refresh_token');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('milkerp:auth_expired'));
        }
      }
    }

    const json: ApiResponse<T> = await res.json().catch(() => ({
      success: false,
      message: `Failed to parse response from server (${res.status})`,
    }));

    if (!res.ok || !json.success) {
      throw new ApiError(
        json.message || `Request failed with status ${res.status}`,
        res.status,
        json.errors
      );
    }

    return json.data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || 'Network error: Unable to reach MilkerP backend server',
      0
    );
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
