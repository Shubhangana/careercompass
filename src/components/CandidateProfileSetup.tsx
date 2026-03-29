import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, User, Sparkles, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Profile } from '../types';
import { updateProfile } from '../services/profiles';
import { extractProfileFromResume } from '../services/ai';
import { toast } from 'sonner';

interface CandidateProfileSetupProps {
  profile: Profile;
  onComplete: (updatedProfile: Profile) => void;
}

export const CandidateProfileSetup: React.FC<CandidateProfileSetupProps> = ({ profile, onComplete }) => {
  const [step, setStep] = useState<'choice' | 'manual' | 'resume'>('choice');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    skills: profile.skills?.join(', ') || '',
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateProfile({
        full_name: formData.full_name,
        bio: formData.bio,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
      });
      toast.success('Profile updated successfully!');
      onComplete(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setError(null);
    try {
      // First, parse the PDF/DOCX on the server
      const formData = new FormData();
      formData.append('resume', file);
      
      const parseResponse = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });
      
      if (!parseResponse.ok) {
        const errData = await parseResponse.json();
        throw new Error(errData.error || 'Failed to parse resume');
      }
      
      const { text } = await parseResponse.json();
      
      // Now use AI to extract profile data
      const extractedData = await extractProfileFromResume(text);
      
      // Update the form with extracted data
      setFormData({
        full_name: extractedData.fullName || '',
        bio: extractedData.bio || '',
        skills: extractedData.skills?.join(', ') || '',
      });
      
      setStep('manual');
      toast.success('Resume data extracted! Please review and save.');
    } catch (err: any) {
      setError(err.message || 'Failed to extract data from resume');
    } finally {
      setIsExtracting(false);
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
            Complete your <span className="gradient-text">Profile</span>
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-fg/40">
            Choose how you want to set up your candidate profile
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

        {step === 'choice' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setStep('resume')}
              className="group p-8 bg-surface border border-border rounded-3xl hover:border-accent transition-all text-center space-y-4"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Upload Resume</h3>
                <p className="text-xs text-fg/40 mt-1">Let AI extract your profile data automatically</p>
              </div>
            </button>

            <button
              onClick={() => setStep('manual')}
              className="group p-8 bg-surface border border-border rounded-3xl hover:border-accent transition-all text-center space-y-4"
            >
              <div className="w-16 h-16 bg-fg/5 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-fg/40" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Manual Entry</h3>
                <p className="text-xs text-fg/40 mt-1">Fill in your details manually</p>
              </div>
            </button>
          </div>
        )}

        {step === 'resume' && (
          <div className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
                isExtracting ? 'border-accent bg-accent/5' : 'border-border hover:border-accent'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleResumeUpload}
                className="hidden" 
                accept=".pdf,.docx"
              />
              {isExtracting ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold uppercase tracking-widest text-accent">AI is Extracting...</p>
                    <p className="text-[10px] text-fg/40 uppercase tracking-widest">Analyzing your resume structure</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Click to upload your resume</p>
                    <p className="text-[10px] text-fg/40 uppercase tracking-widest">PDF or DOCX (Max 5MB)</p>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => setStep('choice')}
              className="text-xs font-bold uppercase tracking-widest text-fg/40 hover:text-fg transition-colors"
            >
              Go Back
            </button>
          </div>
        )}

        {step === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-fg/40 ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-bg border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-fg/40 ml-1">Bio / Summary</label>
                <textarea
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-bg border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all h-32 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-fg/40 ml-1">Skills (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full bg-bg border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  placeholder="React, TypeScript, Node.js..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('choice')}
                className="flex-1 py-4 px-6 border border-border rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-fg/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-[2] py-4 px-6 bg-accent text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Save Profile
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
