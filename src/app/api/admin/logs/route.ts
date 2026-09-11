import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const { user, error } = await verifyAdminToken(authHeader);

    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
    }

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } },
      });

      const { data: logs, error: dbError } = await client
        .from("admin_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, logs: logs || [] });
    }

    return NextResponse.json({ success: true, logs: [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
