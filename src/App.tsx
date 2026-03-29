import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { 
  Upload, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  ChevronRight, 
  Star, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Sun,
  Moon,
  ArrowRight,
  Copy,
  ExternalLink,
  Filter,
  FileUp,
  X,
  Search,
  DollarSign,
  Globe,
  Layout,
  Download,
  LogOut,
  Bell,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  User,
  Settings,
  Target,
  Zap
} from 'lucide-react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { Logo } from './components/Logo';
import { Login } from './components/Auth/Login';
import { Signup } from './components/Auth/Signup';
import { ForgotPassword } from './components/Auth/ForgotPassword';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { supabase } from './supabase';
import { 
  analyzeResume, 
  generateCoverLetter,
  type Job,
  type JobSearchParams
} from './services/ai';
import { 
  getNotifications, 
  markAsRead, 
  notifyJobMatches,
  type Notification 
} from './services/notifications';
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
  type Application,
  type ApplicationStatus
} from './services/applications';
import { startJobAlertPolling } from './services/jobAlerts';
import { getProfile } from './services/profiles';
import { CompanyDashboard } from './components/CompanyDashboard';
import { CandidateDashboard } from './components/CandidateDashboard';
import { CandidateProfileSetup } from './components/CandidateProfileSetup';
import { CompanyProfileSetup } from './components/CompanyProfileSetup';
import { Profile } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AnalysisResult = {
  atsScore: number;
  skills: string[];
  improvements: string[];
  actionableSuggestions: string[];
  comparison: string;
  improvedResume: string;
};

const COVER_LETTER_TEMPLATES = [
  { id: 'professional', name: 'Professional', description: 'Standard, formal and balanced.' },
  { id: 'creative', name: 'Creative', description: 'Bold, personality-driven and unique.' },
  { id: 'modern', name: 'Modern', description: 'Clean, concise and results-oriented.' },
  { id: 'academic', name: 'Academic', description: 'Detailed, research-focused and scholarly.' },
];

export default function App() {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [isEditingCoverLetter, setIsEditingCoverLetter] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(COVER_LETTER_TEMPLATES[0].id);
  const [activeTab, setActiveTab] = useState<'analysis' | 'jobs' | 'courses' | 'cover-letter' | 'tracker'>('analysis');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isAddingApplication, setIsAddingApplication] = useState(false);
  const [newApp, setNewApp] = useState({ company: '', role: '', status: 'Applied' as ApplicationStatus });
  
  // Job Search Filters
  const [searchParams, setSearchParams] = useState<JobSearchParams>({
    role: '',
    company: '',
    workType: 'All',
    minSalary: 50000
  });
  
  const [jobFilter, setJobFilter] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      setResumeText('');
      setAnalysis(null);
      setJobs([]);
      setCourses([]);
      setCoverLetter(null);
      setFileName(null);
      setSelectedFile(null);
      setError(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const fetchApplications = async () => {
    const data = await getApplications();
    setApplications(data);
  };

  const fetchNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsProfileLoading(true);
      const p = await getProfile();
      setProfile(p);
      setIsProfileLoading(false);
      
      fetchNotifications();
      
      const apps = await getApplications();
      setApplications(apps);
    };
    
    fetchInitialData();

    // Set up real-time subscription for notifications
    const notifChannel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications' 
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    // Set up real-time subscription for applications
    const appChannel = supabase
      .channel('applications_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'applications' 
      }, () => {
        fetchApplications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(appChannel);
    };
  }, []);

  useEffect(() => {
    if (analysis?.skills?.[0]) {
      const stopPolling = startJobAlertPolling(analysis.skills[0]);
      return () => stopPolling();
    }
  }, [analysis]);

  const handleAddApplication = async () => {
    if (!newApp.company || !newApp.role) return;
    await createApplication(newApp);
    setNewApp({ company: '', role: '', status: 'Applied' });
    setIsAddingApplication(false);
    fetchApplications();
  };

  const handleFileUpload = async (file: File) => {
    setFileName(file.name);
    setSelectedFile(file);
    // We don't parse on frontend anymore as per multi-agent architecture
    setResumeText(`File selected: ${file.name}. Click Analyze to process.`);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() && !selectedFile) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeResume(
        resumeText, 
        selectedFile || undefined,
        searchParams
      );
      
      setResumeText(result.resumeText);
      setAnalysis(result.analysis);
      setJobs(result.jobs);
      setCourses(result.courses);
      
      // Trigger notifications for high matches
      await notifyJobMatches(result.jobs);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!resumeText || !companyName) return;
    setIsAnalyzing(true);
    try {
      const res = await generateCoverLetter(resumeText, companyName, selectedTemplate);
      setCoverLetter(res);
      setActiveTab('cover-letter');
    } catch (error) {
      console.error("Cover letter generation failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(jobFilter.toLowerCase()) ||
    job.company.toLowerCase().includes(jobFilter.toLowerCase()) ||
    job.location.toLowerCase().includes(jobFilter.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error("Logout failed:", error);
      // Even if Supabase fails (e.g. missing config), we should probably redirect or handle it
      setError(error.message || "Logout failed. Please check your configuration.");
    }
  };

  // Add notification when new job match is found
  useEffect(() => {
    const jobMatches = notifications.filter(n => n.type === 'job_match');
    if (jobMatches.length > 0) {
      const latestMatch = jobMatches[0];
      // Only toast if it's within the last 5 seconds (to avoid spamming on load)
      const isRecent = new Date().getTime() - new Date(latestMatch.created_at).getTime() < 5000;
      if (isRecent) {
        toast.success("New Job Match Found!", {
          description: latestMatch.message,
          action: latestMatch.metadata?.job_link ? {
            label: "View",
            onClick: () => window.open(latestMatch.metadata.job_link, '_blank')
          } : undefined,
        });
      }
    }
  }, [notifications.length]);

  return (
    <>
      <Toaster position="top-right" theme={isDarkMode ? "dark" : "light"} richColors />
      <Routes>
        <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            {isProfileLoading ? (
              <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
              </div>
            ) : profile?.role === 'company' ? (
              !profile.company_name ? (
                <CompanyProfileSetup profile={profile} onComplete={(updated) => setProfile(updated)} />
              ) : (
                <CompanyDashboard profile={profile} onLogout={handleLogout} />
              )
            ) : (
              !profile?.full_name ? (
                <CandidateProfileSetup profile={profile!} onComplete={(updated) => setProfile(updated)} />
              ) : (
                <CandidateDashboard 
                  profile={profile!} 
                  isDarkMode={isDarkMode} 
                  setIsDarkMode={setIsDarkMode} 
                  onLogout={handleLogout} 
                />
              )
            )}
          </ProtectedRoute>
        } 
      />
    </Routes>
    </>
  );
}

// End of file cleanup
