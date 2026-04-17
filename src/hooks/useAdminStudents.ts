import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StudentRow {
  user_id: string;
  nombre: string;
  email: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  certificates: number;
}

export function useAdminStudents() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);

    const [profilesRes, lessonsRes, progressRes, certsRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("user_id, nombre, email"),
      supabase.from("lessons").select("id"),
      supabase.from("progress").select("user_id, completed").eq("completed", true),
      supabase.from("certificates").select("user_id"),
      supabase.from("user_roles").select("user_id, role").eq("role", "student"),
    ]);

    const profiles = profilesRes.data ?? [];
    const totalLessons = lessonsRes.data?.length ?? 0;
    const progress = progressRes.data ?? [];
    const certs = certsRes.data ?? [];
    const studentIds = new Set((rolesRes.data ?? []).map((r) => r.user_id));

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
        };
      });

    setStudents(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return { students, loading, refetch: fetchAll };
}
