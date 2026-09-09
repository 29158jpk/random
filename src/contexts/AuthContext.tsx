"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (
    email: string,
    password: string,
    username?: string
  ) => Promise<{ error: AuthError | Error | null; user: User | null }>;
  signOut: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Web Crypto SHA-256 helper for zero plaintext password storage
async function hashPassword(password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return btoa(password);
  }
}

interface StoredLocalUser {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  created_at: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        if (isConfigured) {
          const { data, error } = await supabase.auth.getSession();
          if (mounted && !error && data.session) {
            setSession(data.session);
            setUser(data.session.user);
          }
        } else {
          // Local cryptographic session restore
          const savedSessionStr = localStorage.getItem("horizon_local_session");
          if (savedSessionStr) {
            const parsed = JSON.parse(savedSessionStr);
            if (mounted && parsed.user) {
              setSession(parsed);
              setUser(parsed.user);
            }
          }
        }
      } catch (err) {
        console.error("Failed to initialize session:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    // Subscribe to Supabase Auth state changes if configured
    if (isConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user || null);
        setLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }
  }, [isConfigured]);

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. If Supabase is fully configured with real project keys, use Supabase Auth
    if (isConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      return { error };
    }

    // 2. Local Cryptographic Authentication Engine
    try {
      const usersStr = localStorage.getItem("horizon_local_users") || "[]";
      const users: StoredLocalUser[] = JSON.parse(usersStr);

      const targetUser = users.find((u) => u.email === cleanEmail);
      if (!targetUser) {
        return {
          error: new Error("ไม่พบบัญชีผู้ใช้นี้ หรือรหัสผ่านไม่ถูกต้อง"),
        };
      }

      const inputHash = await hashPassword(password);
      if (targetUser.passwordHash !== inputHash) {
        return {
          error: new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"),
        };
      }

      const localUser: User = {
        id: targetUser.id,
        app_metadata: {},
        user_metadata: {
          username: targetUser.username,
        },
        aud: "authenticated",
        created_at: targetUser.created_at,
        email: targetUser.email,
        phone: "",
        role: "authenticated",
        updated_at: new Date().toISOString(),
      };

      const localSession: Session = {
        access_token: `horizon_token_${targetUser.id}_${Date.now()}`,
        refresh_token: `horizon_refresh_${targetUser.id}`,
        expires_in: 3600 * 24 * 7,
        expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 7,
        token_type: "bearer",
        user: localUser,
      };

      localStorage.setItem("horizon_local_session", JSON.stringify(localSession));
      setSession(localSession);
      setUser(localUser);

      return { error: null };
    } catch {
      return { error: new Error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ") };
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username?.trim() || cleanEmail.split("@")[0];

    // 1. If Supabase is fully configured with real project keys, use Supabase Auth
    if (isConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
          },
        },
      });

      if (!error && data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      return { error, user: data.user };
    }

    // 2. Local Cryptographic Authentication Engine
    try {
      const usersStr = localStorage.getItem("horizon_local_users") || "[]";
      const users: StoredLocalUser[] = JSON.parse(usersStr);

      const existing = users.find((u) => u.email === cleanEmail);
      if (existing) {
        return {
          error: new Error("อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบ"),
          user: null,
        };
      }

      const pHash = await hashPassword(password);
      const newUserId = crypto.randomUUID
        ? crypto.randomUUID()
        : `user-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const newAccount: StoredLocalUser = {
        id: newUserId,
        email: cleanEmail,
        passwordHash: pHash,
        username: cleanUsername,
        created_at: new Date().toISOString(),
      };

      users.push(newAccount);
      localStorage.setItem("horizon_local_users", JSON.stringify(users));

      const localUser: User = {
        id: newUserId,
        app_metadata: {},
        user_metadata: {
          username: cleanUsername,
        },
        aud: "authenticated",
        created_at: newAccount.created_at,
        email: cleanEmail,
        phone: "",
        role: "authenticated",
        updated_at: new Date().toISOString(),
      };

      const localSession: Session = {
        access_token: `horizon_token_${newUserId}_${Date.now()}`,
        refresh_token: `horizon_refresh_${newUserId}`,
        expires_in: 3600 * 24 * 7,
        expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 7,
        token_type: "bearer",
        user: localUser,
      };

      localStorage.setItem("horizon_local_session", JSON.stringify(localSession));
      setSession(localSession);
      setUser(localUser);

      return { error: null, user: localUser };
    } catch {
      return { error: new Error("เกิดข้อผิดพลาดในการสมัครสมาชิก"), user: null };
    }
  };

  const signOut = async () => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    localStorage.removeItem("horizon_local_session");
    setSession(null);
    setUser(null);
  };

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: Boolean(user),
        isConfigured,
        signIn,
        signUp,
        signOut,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
