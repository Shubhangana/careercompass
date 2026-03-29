import React, { useState } from "react";
import { supabase } from "../../supabase";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../Logo";
import { motion } from "motion/react";
import { ArrowRight, Mail, Lock, AlertCircle, User, Building2 } from "lucide-react";
import { createProfile } from "../../services/profiles";
import { UserRole } from "../../types";
import { toast } from "sonner";

export const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("candidate");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signupError) throw signupError;
      
      if (data.user) {
        // Create the profile with the selected role
        await createProfile(role, { email });
      }

      navigate("/login");
      toast.success("Account created! Please sign in.");
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] animate-pulse-glow" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full space-y-8 glass-card p-10 relative z-10"
      >
        <div className="flex flex-col items-center space-y-4">
          <Link to="/">
            <Logo size={80} className="hover:scale-110 transition-transform duration-500" />
          </Link>
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black tracking-tighter text-fg uppercase">
              Join <span className="gradient-text">Path4U</span>
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-fg/40">Start your career orchestration</p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4">
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  role === "candidate"
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border bg-bg text-fg/40 hover:border-fg/20"
                }`}
              >
                <User className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("company")}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  role === "company"
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border bg-bg text-fg/40 hover:border-fg/20"
                }`}
              >
                <Building2 className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Company</span>
              </button>
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fg/20 group-focus-within:text-accent transition-colors" />
              <input
                type="email"
                required
                className="block w-full pl-12 pr-4 py-4 bg-bg border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-fg/20"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fg/20 group-focus-within:text-accent transition-colors" />
              <input
                type="password"
                required
                className="block w-full pl-12 pr-4 py-4 bg-bg border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-fg/20"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fg/20 group-focus-within:text-accent transition-colors" />
              <input
                type="password"
                required
                className="block w-full pl-12 pr-4 py-4 bg-bg border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-fg/20"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
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

          <div className="flex items-center justify-center px-2">
            <Link to="/login" className="text-[10px] font-bold uppercase tracking-widest text-fg/40 hover:text-accent transition-colors">
              Already have an account? <span className="text-accent">Sign In</span>
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 bg-accent text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all shadow-2xl shadow-accent/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                Create Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
