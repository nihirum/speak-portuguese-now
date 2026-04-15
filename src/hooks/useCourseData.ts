import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type Course = Tables<"courses">;
type Lesson = Tables<"lessons"> & { completed: boolean };
type Module = Tables<"modules"> & { lessons: Lesson[] };

export function useCourseData() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [coursesRes, modulesRes, lessonsRes, progressRes] = await Promise.all([
        supabase.from("courses").select("*"),
        supabase.from("modules").select("*").order("order"),
        supabase.from("lessons").select("*").order("order"),
        supabase.from("progress").select("*").eq("user_id", user.id).eq("completed", true),
      ]);

      const completedSet = new Set(
        (progressRes.data ?? []).map((p) => p.lesson_id)
      );
      setCompletedLessons(completedSet);
      setCourses(coursesRes.data ?? []);

      const modulesWithLessons: Module[] = (modulesRes.data ?? []).map((mod) => ({
        ...mod,
        lessons: (lessonsRes.data ?? [])
          .filter((l) => l.module_id === mod.id)
          .map((l) => ({ ...l, completed: completedSet.has(l.id) })),
      }));

      setModules(modulesWithLessons);
    } catch (err) {
      console.error("Error fetching course data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Wait for auth to be ready before fetching
    if (authLoading) return;
    fetchData();
  }, [user, authLoading, fetchData]);

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = completedLessons.size;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const toggleLesson = async (lessonId: string) => {
    if (!user) return;
    const isCompleted = completedLessons.has(lessonId);

    if (isCompleted) {
      await supabase
        .from("progress")
        .update({ completed: false, completed_at: null })
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);
    } else {
      await supabase.from("progress").upsert(
        { user_id: user.id, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" }
      );
    }

    await fetchData();
  };

  return { courses, modules, loading, progressPercent, completedCount, totalLessons, toggleLesson, completedLessons };
}
