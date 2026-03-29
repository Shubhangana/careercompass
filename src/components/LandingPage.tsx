import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Briefcase, FileText, GraduationCap, CheckCircle2, Star, Zap, Target, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { cn } from '../lib/utils';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-fg selection:bg-accent/30 font-sans overflow-hidden">
      {/* Hero Section */}
      <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-bg/80 backdrop-blur-md border-b border-border">
        <Link to="/" className="flex items-center gap-2 group">
          <Logo size={48} className="group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-400 to-gray-600 drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]">PATH4U</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-6 py-2 text-sm font-semibold text-fg/60 hover:text-fg transition-colors">
            Sign In
          </Link>
          <Link to="/signup" className="px-6 py-2.5 bg-accent text-white text-sm font-semibold rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative min-h-screen flex flex-col items-center justify-center px-8 text-center">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-12">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              <Sparkles className="w-3 h-3" />
              AI-Powered Career Orchestrator
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-7xl md:text-8xl font-black tracking-tight leading-[0.9] uppercase"
            >
              Orchestrate Your <br />
              <span className="gradient-text">Professional Future.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-fg/40 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed uppercase tracking-tight"
            >
              The minimalist AI toolkit that analyzes your resume, matches you with high-growth roles, and maps your path to mastery.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/signup" className="px-10 py-5 bg-accent text-white rounded-2xl font-bold text-sm flex items-center gap-3 hover:opacity-90 transition-all shadow-2xl shadow-accent/40 group">
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="px-10 py-5 bg-surface border border-border rounded-2xl font-bold text-sm hover:bg-border transition-all uppercase tracking-widest">
              Sign In
            </Link>
          </motion.div>

          {/* Function Animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-20 relative max-w-2xl mx-auto"
          >
            <div className="absolute -inset-10 bg-accent/5 blur-3xl rounded-full" />
            <div className="relative glass-card p-12 space-y-12 overflow-hidden">
              {/* Animated Sequence */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Connector Lines */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent hidden md:block" />
                
                {[
                  { icon: FileText, label: "Analyze", color: "text-accent", bg: "bg-accent/10" },
                  { icon: Briefcase, label: "Match", color: "text-green-500", bg: "bg-green-500/10" },
                  { icon: GraduationCap, label: "Upskill", color: "text-blue-500", bg: "bg-blue-500/10" }
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + (i * 0.3), duration: 0.5 }}
                    className="flex flex-col items-center gap-4 relative z-10"
                  >
                    <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl border border-border", step.bg, step.color)}>
                      <step.icon className="w-10 h-10" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-fg/40">{step.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="h-1 w-full bg-surface rounded-full overflow-hidden border border-border">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="h-full bg-accent shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                />
              </div>

              <div className="text-center space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-accent">Real-time Orchestration</div>
                <p className="text-[10px] text-fg/20 uppercase tracking-[0.2em]">Processing Resume • Identifying Gaps • Finding Opportunities</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full px-8 py-8 flex justify-between items-center text-[8px] font-bold uppercase tracking-[0.4em] text-fg/20 z-50">
        <span>© 2026 PATH4U</span>
        <div className="flex gap-8">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
      </footer>
    </div>
  );
};
