import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Globe, FileText, ArrowRight, AlertCircle, Upload } from 'lucide-react';
import { Profile } from '../types';
import { updateProfile } from '../services/profiles';
import { toast } from 'sonner';

interface CompanyProfileSetupProps {
  profile: Profile;
  onComplete: (updatedProfile: Profile) => void;
}

export const CompanyProfileSetup: React.FC<CompanyProfileSetupProps> = ({ profile, onComplete }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company_name: profile.company_name || '',
    website: profile.website || '',
    description: profile.description || '',
    logo_url: profile.logo_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateProfile({
        company_name: formData.company_name,
        website: formData.website,
        description: formData.description,
        logo_url: formData.logo_url,
      });
      toast.success('Company profile updated successfully!');
      onComplete(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to update company profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full glass-card p-8 md:p-12 space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tighter uppercase">
            Setup your <span className="gradient-text">Company</span>
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-fg/40">
            Tell candidates about your organization
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive text-xs font-bold uppercase tracking-widest"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-fg/40 ml-1">Company Name</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fg/20 group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full bg-bg border border-border rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-fg/40 ml-1">Website URL</label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fg/20 group-focus-within:text-accent transition-colors" />
                <input
                  type="url"
                  required
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-bg border border-border rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  placeholder="https://acme.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-fg/40 ml-1">Company Description</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-6 w-5 h-5 text-fg/20 group-focus-within:text-accent transition-colors" />
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-bg border border-border rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all h-32 resize-none"
                  placeholder="Briefly describe your company's mission and culture..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-fg/40 ml-1">Logo URL (Optional)</label>
              <div className="relative group">
                <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fg/20 group-focus-within:text-accent transition-colors" />
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full bg-bg border border-border rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  placeholder="https://acme.com/logo.png"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 px-6 bg-accent text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-2xl shadow-accent/20"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Complete Setup
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
