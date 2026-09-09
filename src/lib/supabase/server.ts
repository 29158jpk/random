import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./client";

export async function verifyAuthToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "Missing or malformed Authorization header" };
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return { user: null, error: "Empty token" };
  }

  // If Supabase is not configured yet with real URL, return mock verify or error
  if (!isSupabaseConfigured()) {
    return {
      user: {
        id: "demo-authenticated-user",
        email: "demo@horizonpc.local",
        user_metadata: { username: "Demo User" },
      },
      error: null,
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const serverClient = createClient(supabaseUrl, supabaseAnonKey);
  const {
    data: { user },
    error,
  } = await serverClient.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: error?.message || "Invalid or expired token" };
  }

  return { user, error: null };
}
