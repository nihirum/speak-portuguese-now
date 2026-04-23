import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAdmin = async (userId: string) => {
      console.log("[Auth] Checking admin role for:", userId);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error("[Auth] checkAdmin error:", error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    };

    let lastUserId: string | null = null;
    let adminCheckedFor: string | null = null;

    const applySession = (nextSession: Session | null) => {
      if (!isMounted) return;

      const nextUserId = nextSession?.user?.id ?? null;
      const userChanged = nextUserId !== lastUserId;

      // Always update token/session reference silently, but only trigger
      // re-renders / admin re-check when the actual user identity changes.
      if (userChanged) {
        console.log("[Auth] User changed:", { from: lastUserId, to: nextUserId });
        lastUserId = nextUserId;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
      } else {
        // Same user (token refresh, tab refocus): keep refs stable to avoid
        // unmounting children and losing local UI state.
        setSession((prev) => (prev?.access_token === nextSession?.access_token ? prev : nextSession));
      }

      setLoading(false);

      if (nextSession?.user && adminCheckedFor !== nextSession.user.id) {
        adminCheckedFor = nextSession.user.id;
        void checkAdmin(nextSession.user.id);
      } else if (!nextSession?.user) {
        adminCheckedFor = null;
        setIsAdmin(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      console.log("[Auth] onAuthStateChange:", event, {
        hasSession: !!nextSession,
      });
      applySession(nextSession);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      console.log("[Auth] Initial getSession:", {
        hasSession: !!data.session,
        error,
      });

      if (error) {
        console.error("[Auth] getSession error:", error);
      }

      applySession(data.session ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
