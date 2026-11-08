import React, { useState, useEffect } from 'react';
import { useTenantBranding } from '../../contexts/TenantBrandingContext';
import {
  Palette,
  Upload,
  Image as ImageIcon,
  Building,
  Mail,
  Phone,
  MapPin,
  Check,
  RefreshCw,
  AlertCircle,
  Eye,
  FileText,
} from 'lucide-react';

const PRESET_PALETTES = [
  { name: 'Emerald Forest (Default)', primary: '#059669', secondary: '#10b981' },
  { name: 'Royal Sapphire', primary: '#2563eb', secondary: '#3b82f6' },
  { name: 'Imperial Violet', primary: '#7c3aed', secondary: '#8b5cf6' },
  { name: 'Warm Amber Herd', primary: '#d97706', secondary: '#f59e0b' },
  { name: 'Classic Teal', primary: '#0d9488', secondary: '#14b8a6' },
  { name: 'Ruby Crimson', primary: '#e11d48', secondary: '#f43f5e' },
];

export const BrandingSettingsPage: React.FC = () => {
  const { branding, updateBranding, uploadLogo, uploadFavicon, isLoading } = useTenantBranding();

  const [form, setForm] = useState({
    name: branding.name || '',
    primaryColor: branding.primaryColor || '#059669',
    secondaryColor: branding.secondaryColor || '#10b981',
    supportEmail: branding.supportEmail || '',
    contactPhone: branding.contactPhone || '',
    businessAddress: branding.businessAddress || branding.address || '',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(branding.logoUrl || null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(branding.faviconUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setForm({
      name: branding.name || '',
      primaryColor: branding.primaryColor || '#059669',
      secondaryColor: branding.secondaryColor || '#10b981',
      supportEmail: branding.supportEmail || '',
      contactPhone: branding.contactPhone || '',
      businessAddress: branding.businessAddress || branding.address || '',
    });
    setLogoPreview(branding.logoUrl || null);
    setFaviconPreview(branding.faviconUrl || null);
  }, [branding]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPG, SVG, or WebP).' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Logo image exceeds 2MB limit.' });
      return;
    }

    // Local instant preview
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);

    try {
      setIsUploadingLogo(true);
      setStatusMessage(null);
      const uploadedUrl = await uploadLogo(file);
      setLogoPreview(uploadedUrl);
      setStatusMessage({ type: 'success', text: 'Logo uploaded and updated successfully.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to upload logo.' });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/x-icon'].includes(file.type)) {
      setStatusMessage({ type: 'error', text: 'Please select a valid favicon file (ICO, PNG, or SVG).' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Favicon file exceeds 2MB limit.' });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFaviconPreview(objectUrl);

    try {
      setIsUploadingFavicon(true);
      setStatusMessage(null);
      const uploadedUrl = await uploadFavicon(file);
      setFaviconPreview(uploadedUrl);
      setStatusMessage({ type: 'success', text: 'Favicon uploaded and updated successfully.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to upload favicon.' });
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      await updateBranding({
        name: form.name.trim(),
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.secondaryColor,
        supportEmail: form.supportEmail.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        businessAddress: form.businessAddress.trim() || undefined,
        address: form.businessAddress.trim() || undefined,
      });

      setStatusMessage({
        type: 'success',
        text: 'White-label branding settings saved and applied across all portals!',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to save branding settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Palette className="w-7 h-7 text-emerald-400" />
            <span>White-Label Tenant Branding</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize your dairy brand identity. Changes apply live to subscriber portals, login screens, headers, and printable receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 font-mono text-emerald-400">
            Subdomain: {branding.slug}.dairynexa.com
          </span>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Branding Form (Left 2 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Card 1: Dairy Business Identity */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Building className="w-5 h-5 text-emerald-400" />
              <span>Dairy Business Details</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Dairy Business Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Green Valley Farm"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Shown in customer login, SMS/WhatsApp receipts, navigation headers, and bills.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Customer Support Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={form.supportEmail}
                      onChange={e => setForm({ ...form, supportEmail: e.target.value })}
                      placeholder="support@yourdairy.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Contact Helpline Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="tel"
                      value={form.contactPhone}
                      onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                      placeholder="+91 98490 00000"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Registered Dairy Farm Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <textarea
                    rows={2}
                    value={form.businessAddress}
                    onChange={e => setForm({ ...form, businessAddress: e.target.value })}
                    placeholder="Plot 42, Dairy Circle, Main Road..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Logo & Favicon Uploads */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <ImageIcon className="w-5 h-5 text-emerald-400" />
              <span>Logo & Favicon Media</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  Dairy Logo (Header & Receipts)
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-slate-950/50 transition-colors relative group">
                  {logoPreview ? (
                    <div className="space-y-2 flex flex-col items-center">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-16 max-w-full object-contain rounded-lg p-1 bg-white/5 border border-slate-700"
                      />
                      <span className="text-[11px] text-emerald-400 font-semibold">Custom Logo Active</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-8 h-8 text-slate-500 mx-auto group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-medium text-slate-400">Click to upload logo</p>
                      <p className="text-[10px] text-slate-500">PNG, JPG, SVG, WebP (max 2MB)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoChange}
                    disabled={isUploadingLogo}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {isUploadingLogo && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading & applying logo...
                  </p>
                )}
              </div>

              {/* Favicon Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  Browser Tab Favicon
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-slate-950/50 transition-colors relative group">
                  {faviconPreview ? (
                    <div className="space-y-2 flex flex-col items-center">
                      <img
                        src={faviconPreview}
                        alt="Favicon Preview"
                        className="w-10 h-10 object-contain rounded-lg p-1 bg-white/5 border border-slate-700"
                      />
                      <span className="text-[11px] text-emerald-400 font-semibold">Custom Favicon Active</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-8 h-8 text-slate-500 mx-auto group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-medium text-slate-400">Click to upload favicon</p>
                      <p className="text-[10px] text-slate-500">ICO, PNG, SVG (max 2MB)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/x-icon,image/png,image/svg+xml"
                    onChange={handleFaviconChange}
                    disabled={isUploadingFavicon}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {isUploadingFavicon && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading favicon...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Color Customization */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Palette className="w-5 h-5 text-emerald-400" />
              <span>Theme Colours & Palettes</span>
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Primary Brand Colour
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-950 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={form.primaryColor}
                      onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Secondary Accent Colour
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.secondaryColor}
                      onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-950 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={form.secondaryColor}
                      onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">Preset Palettes:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_PALETTES.map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          primaryColor: p.primary,
                          secondaryColor: p.secondary,
                        })
                      }
                      className="p-2 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800/60 flex items-center gap-2 transition-all text-left cursor-pointer"
                    >
                      <div className="flex -space-x-1">
                        <span
                          className="w-4 h-4 rounded-full border border-slate-800"
                          style={{ backgroundColor: p.primary }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-slate-800"
                          style={{ backgroundColor: p.secondary }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-slate-300 truncate">
                        {p.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving & Applying Branding...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save White-Label Branding</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live White-Label Preview Card (Right Col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 sticky top-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Eye className="w-5 h-5 text-emerald-400" />
              <span>Live White-Label Preview</span>
            </h2>

            {/* Preview 1: Customer Login Card Mock */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Customer Login Screen
              </span>
              <div className="rounded-2xl border border-slate-800 bg-[#090A0C] p-4 text-center space-y-3">
                <div className="flex justify-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-10 object-contain" />
                  ) : (
                    <span className="text-2xl">{branding.logoEmoji || '🥛'}</span>
                  )}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-extrabold text-white">
                    Welcome to {form.name || 'Your Dairy'}
                  </h3>
                  <p className="text-[10px] text-slate-400">Sign in to Customer Doorstep Portal</p>
                </div>
                <div
                  className="py-2 rounded-xl text-white font-bold text-xs shadow-md"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  Sign In
                </div>
              </div>
            </div>

            {/* Preview 2: Dashboard Header Bar */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Dashboard Header
              </span>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-6 object-contain" />
                  ) : (
                    <span className="text-lg">🥛</span>
                  )}
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">
                    {form.name || 'Your Dairy'}
                  </span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow"
                  style={{ backgroundColor: form.secondaryColor }}
                >
                  Active Tenant
                </span>
              </div>
            </div>

            {/* Preview 3: Printable Receipt Header */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Monthly Bill & Receipt</span>
              </span>
              <div className="rounded-2xl border border-slate-700 bg-white text-slate-900 p-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h4
                      className="text-xs font-black uppercase tracking-tight"
                      style={{ color: form.primaryColor }}
                    >
                      {form.name || 'Your Dairy Farm'}
                    </h4>
                    <p className="text-[9px] text-slate-500">
                      {form.businessAddress || 'Plot 42, Dairy Circle Road'}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">#INV-2026</span>
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-700">
                  <span>Farm Fresh Cow Milk (1L/day)</span>
                  <span>₹2,100</span>
                </div>
                <div
                  className="text-[10px] font-bold text-white text-center py-1 rounded"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  Paid via Razorpay UPI
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
