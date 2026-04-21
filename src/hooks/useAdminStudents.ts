import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type UserPlan = Database["public"]["Enums"]["user_plan"];

export interface StudentRow {
  user_id: string;
  nombre: string;
  email: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  certificates: number;
  plan: UserPlan | null;
}

export function useAdminStudents() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);

    const [profilesRes, lessonsRes, progressRes, certsRes, rolesRes, plansRes] = await Promise.all([
      supabase.from("profiles").select("user_id, nombre, email"),
      supabase.from("lessons").select("id"),
      supabase.from("progress").select("user_id, completed").eq("completed", true),
      supabase.from("certificates").select("user_id"),
      supabase.from("user_roles").select("user_id, role").eq("role", "student"),
      supabase.from("user_plans").select("user_id, plan"),
    ]);

    const profiles = profilesRes.data ?? [];
    const totalLessons = lessonsRes.data?.length ?? 0;
    const progress = progressRes.data ?? [];
    const certs = certsRes.data ?? [];
    const studentIds = new Set((rolesRes.data ?? []).map((r) => r.user_id));
    const plans = new Map((plansRes.data ?? []).map((p) => [p.user_id, p.plan as UserPlan]));

    const rows: StudentRow[] = profiles
      .filter((p) => studentIds.has(p.user_id))
      .map((p) => {
        const completed = progress.filter((pr) => pr.user_id === p.user_id).length;
        const certCount = certs.filter((c) => c.user_id === p.user_id).length;
        return {
          user_id: p.user_id,
          nombre: p.nombre,
          email: p.email,
          completedLessons: completed,
          totalLessons,
          progressPercent: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
          certificates: certCount,
          plan: plans.get(p.user_id) ?? null,
        };
      });

    setStudents(rows);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const setPlan = async (user_id: string, plan: UserPlan | null, assigned_by: string | null) => {
    if (plan === null) {
      await supabase.from("user_plans").delete().eq("user_id", user_id);
    } else {
      await supabase.from("user_plans").upsert(
        { user_id, plan, assigned_by },
        { onConflict: "user_id" }
      );
    }
    await fetchAll();
  };

  return { students, loading, refetch: fetchAll, setPlan };
}
