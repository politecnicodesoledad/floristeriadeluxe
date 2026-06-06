import { createClient } from "@supabase/supabase-js";

// Fallbacks hardcodeados (la anon key es pública por diseño de Supabase + RLS).
// Así la app funciona en preview y en Vercel aunque no estén las env vars.
const FALLBACK_URL = "https://vihoymsyhgvyhexcslko.supabase.co";
const FALLBACK_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpaG95bXN5aGd2eWhleGNzbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDI2NjIsImV4cCI6MjA5NjE3ODY2Mn0.tbc848oEFn04wE2z8yeQWtT-KK7LtszvviP3Y0IDI6c";

const url = (import.meta.env.VITE_SUPABASE_URL as string) || FALLBACK_URL;
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || FALLBACK_ANON;

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "fdx.auth",
    detectSessionInUrl: true,
  },
});

export const SUPABASE_READY = Boolean(url && key);