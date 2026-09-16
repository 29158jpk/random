import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./client";
import { UserRole, UserStatus } from "@/types/admin";

export interface VerifiedAuthResult {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
  } | null;
  profile: {
    role: UserRole;
    status: UserStatus;
    username: string;
  } | null;
  error: string | null;
}

export async function verifyAuthToken(authHeader: string | null): Promise<VerifiedAuthResult> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, profile: null, error: "Missing or malformed Authorization header" };
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return { user: null, profile: null, error: "Empty token" };
  }

  // If Supabase is not configured yet with live project, provide local dev session verify
  if (!isSupabaseConfigured()) {
    const isAdmin = token.toLowerCase().includes("admin") || token.includes("horizon_admin");
    const isSuspended = token.toLowerCase().includes("suspended");
    return {
      user: {
        id: isAdmin ? "admin-user-id" : "demo-user-id",
        email: isAdmin ? "admin@horizonpc.local" : "user@horizonpc.local",
        user_metadata: { username: isAdmin ? "Horizon Admin" : "Demo Member" },
      },
      profile: {
        role: isAdmin ? "admin" : "user",
        status: isSuspended ? "suspended" : "active",
        username: isAdmin ? "Horizon Admin" : "Demo Member",
      },
      error: null,
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const serverClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error,
  } = await serverClient.auth.getUser(token);

  if (error || !user || !user.email) {
    return { user: null, profile: null, error: error?.message || "Invalid or expired token" };
  }

  // Fetch role and status from profiles table
  const { data: profileRow } = await serverClient
    .from("profiles")
    .select("role, status, username")
    .eq("id", user.id)
    .single();

  const role: UserRole = profileRow?.role === "admin" ? "admin" : "user";
  const status: UserStatus = profileRow?.status === "suspended" ? "suspended" : "active";
  const username: string = profileRow?.username || user.user_metadata?.username || user.email.split("@")[0];

  return {
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
    },
    profile: {
      role,
      status,
      username,
    },
    error: null,
  };
}

export async function verifyActiveUser(authHeader: string | null): Promise<VerifiedAuthResult> {
  const result = await verifyAuthToken(authHeader);
  if (result.error || !result.user) return result;

  if (result.profile?.status === "suspended") {
    return {
      user: null,
      profile: null,
      error: "Your account has been suspended.",
    };
  }

  return result;
}

export async function verifyAdminToken(authHeader: string | null): Promise<VerifiedAuthResult> {
  const result = await verifyAuthToken(authHeader);
  if (result.error || !result.user) return result;

  if (result.profile?.role !== "admin") {
    return {
      user: null,
      profile: null,
      error: "Access Denied: Admin privileges required (403)",
    };
  }

  if (result.profile?.status === "suspended") {
    return {
      user: null,
      profile: null,
      error: "Your account has been suspended.",
    };
  }

  return result;
}

export function getSupabaseAdminClient(authHeader?: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (serviceRoleKey && serviceRoleKey.length > 0) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }

  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader || "" } },
    auth: { persistSession: false },
  });
}
