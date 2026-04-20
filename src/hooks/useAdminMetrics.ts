import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LessonStat {
  lesson_id: string;
  title: string;
  views: number;
}

export interface MonthBucket {
  month: string; // YYYY-MM
  count: number;
}

export interface AdminMetrics {
  totalStudents: number;
  activeStudents: number; // con al menos 1 lección completada
  totalLessons: number;
  totalCompletions: number;
  avgProgressPercent: number;
  completionRate: number; // % alumnos con 100%
  certificatesIssued: number;
  topLessons: LessonStat[];
  certificatesByMonth: MonthBucket[];
  completionsByMonth: MonthBucket[];
}

const empty: AdminMetrics = {
  totalStudents: 0,
  activeStudents: 0,
  totalLessons: 0,
  totalCompletions: 0,
  avgProgressPercent: 0,
  completionRate: 0,
  certificatesIssued: 0,
  topLessons: [],
  certificatesByMonth: [],
  completionsByMonth: [],
};

function bucketByMonth(dates: (string | null)[]): MonthBucket[] {
  const map = new Map<string, number>();
  for (const d of dates) {
    if (!d) continue;
    const key = d.slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  // últimos 6 meses
  const now = new Date();
  const out: MonthBucket[] = [];
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    out.push({ month: key, count: map.get(key) ?? 0 });
  }
  return out;
}

export function useAdminMetrics() {
  const [metrics, setMetrics] = useState<AdminMetrics>(empty);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [rolesRes, lessonsRes, progressRes, certsRes] = await Promise.all([
        supabase.from("user_roles").select("user_id").eq("role", "student"),
        supabase.from("lessons").select("id, title"),
        supabase.from("progress").select("user_id, lesson_id, completed, completed_at").eq("completed", true),
        supabase.from("certificates").select("issued_at"),
      ]);

      const studentIds = new Set((rolesRes.data ?? []).map((r) => r.user_id));
      const lessons = lessonsRes.data ?? [];
      const progress = (progressRes.data ?? []).filter((p) => studentIds.has(p.user_id));
      const certs = certsRes.data ?? [];

      const totalLessons = lessons.length;
      const totalStudents = studentIds.size;

      // por alumno
      const perUser = new Map<string, number>();
      for (const p of progress) perUser.set(p.user_id, (perUser.get(p.user_id) ?? 0) + 1);
      const activeStudents = perUser.size;
      const avgProgressPercent =
        totalStudents > 0 && totalLessons > 0
          ? Math.round(
              (Array.from(perUser.values()).reduce((a, b) => a + b, 0) / (totalStudents * totalLessons)) * 100,
            )
          : 0;
      const completed100 = totalLessons > 0
        ? Array.from(perUser.values()).filter((n) => n >= totalLessons).length
        : 0;
      const completionRate = totalStudents > 0 ? Math.round((completed100 / totalStudents) * 100) : 0;

      // top lecciones
      const lessonCounts = new Map<string, number>();
      for (const p of progress) lessonCounts.set(p.lesson_id, (lessonCounts.get(p.lesson_id) ?? 0) + 1);
      const topLessons: LessonStat[] = lessons
        .map((l) => ({ lesson_id: l.id, title: l.title, views: lessonCounts.get(l.id) ?? 0 }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      const next: AdminMetrics = {
        totalStudents,
        activeStudents,
        totalLessons,
        totalCompletions: progress.length,
        avgProgressPercent,
        completionRate,
        certificatesIssued: certs.length,
        topLessons,
        certificatesByMonth: bucketByMonth(certs.map((c) => c.issued_at)),
        completionsByMonth: bucketByMonth(progress.map((p) => p.completed_at)),
      };

      if (!cancelled) {
        setMetrics(next);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { metrics, loading };
}
