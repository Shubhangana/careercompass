import React, { useState } from "react";
import { supabase } from "../../supabase";
import { Link } from "react-router-dom";
import { Logo } from "../Logo";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setMessage("Check your email for the password reset link!");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 glass-card p-10">
        <div className="flex flex-col items-center">
          <Logo size={80} />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-fg">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-fg/60">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleReset}>
          <div className="rounded-md shadow-sm">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-2xl relative block w-full px-3 py-4 border border-border bg-surface placeholder-fg/40 text-fg focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {message && <div className="text-green-500 text-sm text-center">{message}</div>}

          <div className="flex items-center justify-center">
            <div className="text-sm">
              <Link to="/login" title="Login" id="login-link" className="font-medium text-accent hover:underline">
                Back to Sign In
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 transition-all shadow-lg shadow-accent/20"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
