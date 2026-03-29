import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Briefcase, 
  FileText, 
  Target, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Zap,
  Layout,
  User,
  Settings,
  LogOut,
  Bell,
  X,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Star,
  AlertCircle,
  RefreshCw,
  Sun,
  Moon,
  Copy,
  DollarSign,
  Globe,
  TrendingUp,
  Download,
  GraduationCap
} from 'lucide-react';
import { Profile, JobPosting, Application, ApplicationStatus } from '../types';
import { getApplications, createApplication, deleteApplication } from '../services/applications';
import { getNotifications, markAsRead, Notification } from '../services/notifications';
import { analyzeResume, generateCoverLetter, Job, JobSearchParams } from '../services/ai';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { Logo } from './Logo';
import { Link } from 'react-router-dom';

interface CandidateDashboardProps {
  profile: Profile;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

const COVER_LETTER_TEMPLATES = [
  { id: 'professional', name: 'Professional', description: 'Standard, formal and balanced.' },
  { id: 'creative', name: 'Creative', description: 'Bold, personality-driven and unique.' },
  { id: 'modern', name: 'Modern', description: 'Clean, concise and results-oriented.' },
  { id: 'academic', name: 'Academic', description: 'Detailed, research-focused and scholarly.' },
];

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ profile, isDarkMode, setIsDarkMode, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'jobs' | 'courses' | 'cover-letter' | 'tracker'>('analysis');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [isEditingCoverLetter, setIsEditingCoverLetter] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(COVER_LETTER_TEMPLATES[0].id);
  const [searchParams, setSearchParams] = useState<JobSearchParams>({
    role: profile.skills?.[0] || '',
    company: '',
    workType: 'All',
    minSalary: 50000
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const [notifs, apps] = await Promise.all([
      getNotifications(),
      getApplications()
    ]);
    setNotifications(notifs);
    setApplications(apps);
  };

  const handleAnalyze = async () => {
    if (!profile.bio && !profile.skills?.length) {
      toast.error("Please complete your profile first!");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeResume(profile.bio || '', undefined, searchParams);
      setAnalysis(result.analysis);
      setJobs(result.jobs);
      setCourses(result.courses);
      setActiveTab('analysis');
      toast.success("Analysis complete!");
    } catch (error) {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateCoverLetter = async (job: Job) => {
    setIsAnalyzing(true);
    try {
      const letter = await generateCoverLetter(profile.bio || '', job.title, job.company, selectedTemplate);
      setCoverLetter(letter);
      setActiveTab('cover-letter');
      toast.success("Cover letter generated!");
    } catch (error) {
      toast.error("Failed to generate cover letter.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

  return (
    <div className={cn(
      "min-h-screen font-sans transition-colors duration-500",
      isDarkMode ? "bg-bg text-fg" : "bg-white text-slate-900"
    )}>
      <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-bg/80 backdrop-blur-md border-b border-border">
        <Link to="/" className="flex items-center gap-2 group">
          <Logo size={40} className="group-hover:scale-110 transition-transform" />
          <span className="text-xl font-black tracking-tighter uppercase">PATH4U</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-surface border border-border transition-all"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-surface border border-border transition-all relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-bg" />
              )}
            </button>
          </div>

          <button 
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-destructive/10 border border-border hover:border-destructive/20 text-fg/40 hover:text-destructive transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent font-black text-2xl">
                  {profile.full_name?.[0] || profile.email[0]}
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tighter uppercase">{profile.full_name || 'Candidate'}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-fg/40">Candidate Account</p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full py-4 bg-accent text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-accent/20"
                >
                  {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Analyze Profile
                </button>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-fg/40">Navigation</h3>
              <div className="space-y-2">
                {[
                  { id: 'analysis', icon: Target, label: 'AI Analysis' },
                  { id: 'jobs', icon: Briefcase, label: 'Job Matches' },
                  { id: 'courses', icon: GraduationCap, label: 'Skill Paths' },
                  { id: 'cover-letter', icon: FileText, label: 'Cover Letter' },
                  { id: 'tracker', icon: Layout, label: 'Application Tracker' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                      activeTab === tab.id ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-fg/40 hover:bg-surface hover:text-fg"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'analysis' && (
                <motion.div 
                  key="analysis"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {!analysis ? (
                    <div className="glass-card p-12 text-center space-y-6">
                      <div className="w-20 h-20 bg-accent/5 rounded-3xl flex items-center justify-center mx-auto">
                        <Sparkles className="w-10 h-10 text-accent/40" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black tracking-tighter uppercase">Ready for Analysis?</h3>
                        <p className="text-sm text-fg/40 max-w-md mx-auto leading-relaxed">
                          Our AI orchestrator will analyze your profile, match you with top jobs, and suggest skill paths to accelerate your career.
                        </p>
                      </div>
                      <button 
                        onClick={handleAnalyze}
                        className="px-8 py-4 bg-accent text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        Start AI Analysis
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Analysis Results UI (Simplified for brevity) */}
                      <div className="glass-card p-8 bg-accent/5 border-accent/20">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-2xl font-black tracking-tighter uppercase">Profile Score</h3>
                          <div className="text-5xl font-black text-accent">{analysis.atsScore}%</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-fg/40">Key Strengths</h4>
                            <div className="flex flex-wrap gap-2">
                              {analysis.skills.map((s: string) => (
                                <span key={s} className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold uppercase rounded-full">{s}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Other tabs would go here... */}
              {activeTab === 'jobs' && (
                <motion.div key="jobs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map((job, i) => (
                      <div key={i} className="glass-card p-6 space-y-4 hover:border-accent transition-all group">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg group-hover:text-accent transition-colors">{job.title}</h4>
                            <p className="text-xs text-fg/40">{job.company} • {job.location}</p>
                          </div>
                          <div className="text-xl font-black text-accent">{job.matchPercentage}%</div>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-surface text-[10px] font-bold uppercase rounded">{job.type}</span>
                        </div>
                        <button 
                          onClick={() => handleGenerateCoverLetter(job)}
                          className="w-full py-3 border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-accent hover:text-accent transition-all"
                        >
                          Generate Cover Letter
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};
