import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  accepted_terms_at: string | null;
};

type Ctx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (input: { email: string; password: string; full_name: string; phone: string; accept_terms: boolean }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  reload: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadExtras = async (uid: string | null) => {
    if (!uid) { setProfile(null); setIsAdmin(false); return; }
    const [{ data: prof }, { data: admin }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.rpc("has_role", { _user_id: uid, _role: "admin" }),
    ]);
    setProfile(prof as Profile | null);
    setIsAdmin(Boolean(admin));
  };

  useEffect(() => {
    // 1) Subscribe synchronously
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      // Defer extra DB calls to avoid deadlocks
      setTimeout(() => loadExtras(s?.user.id ?? null), 0);
    });
    // 2) Then check existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadExtras(data.session?.user.id ?? null).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn: Ctx["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signUp: Ctx["signUp"] = async ({ email, password, full_name, phone, accept_terms }) => {
    if (!accept_terms) return { error: "Debes aceptar los términos y condiciones." };
    const redirectTo = `${window.location.origin}/mi-cuenta`;
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: redirectTo, data: { full_name, phone } },
    });
    if (error) return { error: error.message };
    // Best-effort: ensure profile row reflects T&C acceptance (trigger creates row from raw_user_meta_data)
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name, phone,
        accepted_terms_at: new Date().toISOString(),
      });
    }
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null); setProfile(null); setIsAdmin(false);
  };

  const reload = async () => loadExtras(session?.user.id ?? null);

  return (
    <AuthCtx.Provider value={{
      user: session?.user ?? null, session, profile, isAdmin, loading,
      signIn, signUp, signOut, reload,
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}