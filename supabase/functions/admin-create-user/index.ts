// Edge function: admin creates a new student user.
// Verifies caller is admin, then uses service role to create the user.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: "No autenticado" }, 401);
    }

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "No autorizado" }, 403);

    const body = await req.json().catch(() => ({}));
    const { email, password, nombre, plan } = body as {
      email?: string;
      password?: string;
      nombre?: string;
      plan?: "basico" | "pro" | "premium" | null;
    };

    if (!email || !password || password.length < 6) {
      return json({ error: "Email y contraseña (mín. 6) son obligatorios" }, 400);
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre: nombre ?? "" },
    });
    if (createErr || !created.user) {
      return json({ error: createErr?.message ?? "Error creando usuario" }, 400);
    }

    if (plan) {
      await admin.from("user_plans").upsert(
        { user_id: created.user.id, plan, assigned_by: userData.user.id },
        { onConflict: "user_id" },
      );
    }

    return json({ ok: true, user_id: created.user.id });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
