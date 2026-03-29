import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let _supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!_supabase) {
    const url = supabaseUrl?.trim();
    const key = supabaseAnonKey?.trim();

    if (!url || !key) {
      const missing = [];
      if (!url) missing.push("VITE_SUPABASE_URL");
      if (!key) missing.push("VITE_SUPABASE_ANON_KEY");
      
      throw new Error(
        `Supabase configuration is incomplete. Missing: ${missing.join(", ")}. Please set these in the AI Studio Settings panel.`
      );
    }
    
    try {
      _supabase = createClient(url, key);
    } catch (err: any) {
      throw new Error(`Failed to initialize Supabase client: ${err.message}`);
    }
  }
  return _supabase;
};

// For backward compatibility with existing imports.
// This Proxy will only initialize the client when accessed,
// providing a clear error message if environment variables are missing.
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabase();
    return (client as any)[prop];
  }
});
