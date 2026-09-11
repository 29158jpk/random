import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { DailyChallengeDB } from "@/types/admin";

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

      const { data: challenges, error: dbError } = await client
        .from("daily_challenges")
        .select("*")
        .order("created_at", { ascending: false });

      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }

      // Populate participant count for each
      const list: DailyChallengeDB[] = [];
      for (const c of challenges || []) {
        const { count } = await client
          .from("challenge_participants")
          .select("*", { count: "exact", head: true })
          .eq("challenge_id", c.id);

        list.push({
          ...c,
          participants_count: count || 0,
        });
      }

      return NextResponse.json({ success: true, challenges: list });
    }

    return NextResponse.json({ success: true, challenges: [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const { user, error } = await verifyAdminToken(authHeader);

    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { challenge } = body as { challenge: Partial<DailyChallengeDB> };

    if (!challenge || !challenge.title || !challenge.budget) {
      return NextResponse.json({ error: "Missing title or budget" }, { status: 400 });
    }

    const id = challenge.id || `challenge-${Date.now()}`;
    const newChallenge: DailyChallengeDB = {
      id,
      title: challenge.title,
      description: challenge.description || "",
      budget: Number(challenge.budget),
      usage: challenge.usage || "gaming",
      target_score: Number(challenge.target_score || 70),
      start_date: challenge.start_date || new Date().toISOString().split("T")[0],
      end_date:
        challenge.end_date ||
        new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      status: challenge.status || "active",
      constraints: challenge.constraints || {},
      reward_title: challenge.reward_title || "Challenge Master",
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } },
      });

      const { error: insError } = await client.from("daily_challenges").insert(newChallenge);
      if (insError) {
        return NextResponse.json({ error: insError.message }, { status: 400 });
      }

      await client.from("admin_logs").insert({
        admin_id: user.id,
        admin_email: user.email,
        action: `Admin created Daily Challenge: ${newChallenge.title}`,
        target_resource: "daily_challenges",
        details: { challenge: newChallenge },
      });
    }

    return NextResponse.json({ success: true, challenge: newChallenge });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const { user, error } = await verifyAdminToken(authHeader);

    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, updates } = body as { id: string; updates: Partial<DailyChallengeDB> };

    if (!id || !updates) {
      return NextResponse.json({ error: "Missing challenge id or updates" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } },
      });

      const { data, error: upError } = await client
        .from("daily_challenges")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (upError) {
        return NextResponse.json({ error: upError.message }, { status: 400 });
      }

      await client.from("admin_logs").insert({
        admin_id: user.id,
        admin_email: user.email,
        action: `Admin updated Daily Challenge: ${id}`,
        target_resource: "daily_challenges",
        details: { id, updates },
      });

      return NextResponse.json({ success: true, challenge: data });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const { user, error } = await verifyAdminToken(authHeader);

    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing challenge id" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } },
      });

      await client.from("daily_challenges").delete().eq("id", id);

      await client.from("admin_logs").insert({
        admin_id: user.id,
        admin_email: user.email,
        action: `Admin deleted Daily Challenge: ${id}`,
        target_resource: "daily_challenges",
        details: { id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
