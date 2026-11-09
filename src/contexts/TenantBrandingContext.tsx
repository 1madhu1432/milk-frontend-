import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { api } from '../services/api/apiClient';

export interface TenantBranding {
  id?: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  logoEmoji: string;
  faviconUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  contactPhone?: string | null;
  supportEmail?: string | null;
  businessAddress?: string | null;
  address?: string | null;
}

interface TenantBrandingContextType {
  branding: TenantBranding;
  isLoading: boolean;
  error: string | null;
  updateBranding: (updates: Partial<TenantBranding>) => Promise<TenantBranding>;
  uploadLogo: (file: File) => Promise<string>;
  uploadFavicon: (file: File) => Promise<string>;
  refreshBranding: () => Promise<void>;
}

const DEFAULT_BRANDING: TenantBranding = {
  slug: 'dairy',
  name: 'DairyNexa',
  logoEmoji: '🥛',
  logoUrl: null,
  faviconUrl: null,
  primaryColor: '#059669',
  secondaryColor: '#10b981',
  accentColor: '#10b981',
  contactPhone: '+91 98000 00000',
  supportEmail: 'support@dairynexa.com',
  businessAddress: 'Dairy Operations Center',
  address: 'Dairy Operations Center',
};

export const TenantBrandingContext = createContext<TenantBrandingContextType | undefined>(undefined);

function formatDairyName(slug: string): string {
  if (!slug) return 'DairyNexa';
  const cleaned = slug.replace(/[-_]+/g, ' ').trim();
  const words = cleaned
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  if (
    words.toLowerCase().includes('dairy') ||
    words.toLowerCase().includes('milk') ||
    words.toLowerCase().includes('farm')
  ) {
    return words;
  }
  return `${words} Dairy Farm`;
}

export const TenantBrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [branding, setBranding] = useState<TenantBranding>(() => {
    // Immediate synchronous resolution from URL query or hostname so zero wrong name appears!
    let slug = '';
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryParam = urlParams.get('dairy') || urlParams.get('tenant');
      if (queryParam) {
        slug = queryParam.toLowerCase().trim();
      } else {
        const hostParts = window.location.hostname.split('.');
        if (hostParts.length > 2 && !['www', 'api', 'app'].includes(hostParts[0])) {
          slug = hostParts[0].toLowerCase().trim();
        } else if (hostParts.length === 2 && hostParts[1] === 'localhost' && hostParts[0] !== 'localhost') {
          slug = hostParts[0].toLowerCase().trim();
        }
      }
    }

    if (slug) {
      const derivedName = formatDairyName(slug);
      return {
        ...DEFAULT_BRANDING,
        slug,
        name: derivedName,
        supportEmail: `support@${slug}.com`,
      };
    }
    return DEFAULT_BRANDING;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Apply CSS Variables, Document Title & Favicon
  const applyBrandingToDom = useCallback((brand: TenantBranding) => {
    if (typeof document === 'undefined') return;

    // 1. CSS Custom Properties
    const root = document.documentElement;
    root.style.setProperty('--tenant-primary', brand.primaryColor);
    root.style.setProperty('--tenant-secondary', brand.secondaryColor || brand.accentColor);
    root.style.setProperty('--tenant-accent', brand.accentColor || brand.secondaryColor);

    // 2. Document Title
    document.title = `${brand.name} | Dairy ERP SaaS`;

    // 3. Dynamic Favicon
    if (brand.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = brand.faviconUrl;
    }
  }, []);

  // Fetch verified tenant branding from backend API
  const fetchBranding = useCallback(async () => {
    // 1. Resolve slug from search params or hostname
    const querySlug = searchParams.get('dairy') || searchParams.get('tenant');
    let targetSlug = querySlug ? querySlug.toLowerCase().trim() : '';

    if (!targetSlug && typeof window !== 'undefined') {
      const hostParts = window.location.hostname.split('.');
      if (hostParts.length > 2 && !['www', 'api', 'app'].includes(hostParts[0])) {
        targetSlug = hostParts[0].toLowerCase().trim();
      } else if (hostParts.length === 2 && hostParts[1] === 'localhost' && hostParts[0] !== 'localhost') {
        targetSlug = hostParts[0].toLowerCase().trim();
      }
    }

    // Immediately update local name synchronously if query parameter exists to prevent showing wrong name
    if (targetSlug && branding.slug !== targetSlug) {
      const dynamicName = formatDairyName(targetSlug);
      const intermediateBrand: TenantBranding = {
        ...branding,
        slug: targetSlug,
        name: dynamicName,
        supportEmail: `support@${targetSlug}.com`,
      };
      setBranding(intermediateBrand);
      applyBrandingToDom(intermediateBrand);
    }

    try {
      setIsLoading(true);
      setError(null);

      const endpoint = targetSlug
        ? `/tenant/branding?subdomain=${encodeURIComponent(targetSlug)}`
        : '/tenant/branding';

      const res: any = await api.get(endpoint);
      if (res) {
        const loaded: TenantBranding = {
          id: res.id,
          slug: res.slug || targetSlug || 'dairy',
          name: res.name || formatDairyName(targetSlug || 'dairy'),
          logoUrl: res.logoUrl || null,
          logoEmoji: res.logoEmoji || '🥛',
          faviconUrl: res.faviconUrl || null,
          primaryColor: res.primaryColor || '#059669',
          secondaryColor: res.secondaryColor || res.accentColor || '#10b981',
          accentColor: res.accentColor || '#10b981',
          contactPhone: res.contactPhone || res.ownerPhone,
          supportEmail: res.supportEmail || res.ownerEmail,
          businessAddress: res.businessAddress || res.address,
          address: res.address,
        };
        setBranding(loaded);
        applyBrandingToDom(loaded);
      }
    } catch (err: any) {
      // If backend is resolving offline or tenant not yet in DB, preserve the dynamic name from query
      if (targetSlug) {
        const fallbackName = formatDairyName(targetSlug);
        const fallbackBrand: TenantBranding = {
          ...branding,
          slug: targetSlug,
          name: fallbackName,
          supportEmail: `support@${targetSlug}.com`,
        };
        setBranding(fallbackBrand);
        applyBrandingToDom(fallbackBrand);
      }
      setError(err?.message || 'Could not load tenant branding');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, location.search, branding, applyBrandingToDom]);

  useEffect(() => {
    fetchBranding();
  }, [location.search, searchParams]);

  useEffect(() => {
    applyBrandingToDom(branding);
  }, [branding, applyBrandingToDom]);

  // Update branding on backend & local state
  const updateBranding = async (updates: Partial<TenantBranding>): Promise<TenantBranding> => {
    const res: any = await api.patch('/tenant/branding', updates);
    const updated: TenantBranding = {
      ...branding,
      ...res,
      primaryColor: res.primaryColor || updates.primaryColor || branding.primaryColor,
      secondaryColor: res.secondaryColor || updates.secondaryColor || branding.secondaryColor,
      accentColor: res.accentColor || updates.accentColor || branding.accentColor,
      name: res.name || updates.name || branding.name,
      logoUrl: res.logoUrl !== undefined ? res.logoUrl : branding.logoUrl,
      faviconUrl: res.faviconUrl !== undefined ? res.faviconUrl : branding.faviconUrl,
    };
    setBranding(updated);
    applyBrandingToDom(updated);
    return updated;
  };

  // Upload logo
  const uploadLogo = async (file: File): Promise<string> => {
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      throw new Error('Only PNG, JPEG, SVG, and WebP image formats are supported.');
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Image size exceeds 2MB limit.');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res: any = await api.post('/tenant/branding/upload', {
            assetType: 'logo',
            base64Data,
            filename: file.name,
            mimetype: file.type,
          });
          const url = res?.url || base64Data;
          setBranding(prev => ({ ...prev, logoUrl: url }));
          resolve(url);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Upload favicon
  const uploadFavicon = async (file: File): Promise<string> => {
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/x-icon'].includes(file.type)) {
      throw new Error('Only PNG, JPEG, SVG, WebP, and ICO formats are supported.');
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Favicon size exceeds 2MB limit.');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res: any = await api.post('/tenant/branding/upload', {
            assetType: 'favicon',
            base64Data,
            filename: file.name,
            mimetype: file.type,
          });
          const url = res?.url || base64Data;
          setBranding(prev => ({ ...prev, faviconUrl: url }));
          resolve(url);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const refreshBranding = async () => {
    await fetchBranding();
  };

  return (
    <TenantBrandingContext.Provider
      value={{
        branding,
        isLoading,
        error,
        updateBranding,
        uploadLogo,
        uploadFavicon,
        refreshBranding,
      }}
    >
      {children}
    </TenantBrandingContext.Provider>
  );
};

export const useTenantBranding = () => {
  const context = useContext(TenantBrandingContext);
  if (!context) {
    throw new Error('useTenantBranding must be used within a TenantBrandingProvider');
  }
  return context;
};

