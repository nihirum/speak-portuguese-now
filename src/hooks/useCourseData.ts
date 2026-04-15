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
      setCourses([]);
      setModules([]);
      setCompletedLessons(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      console.log("[CourseData] Fetching dashboard data for user:", user.id);

      const [coursesRes, modulesRes, lessonsRes, progressRes] = await Promise.all([
        supabase.from("courses").select("*"),
        supabase.from("modules").select("*").order("order"),
        supabase.from("lessons").select("*").order("order"),
        supabase.from("progress").select("*").eq("user_id", user.id).eq("completed", true),
      ]);

      if (coursesRes.error || modulesRes.error || lessonsRes.error || progressRes.error) {
        console.error("[CourseData] Query errors:", {
          coursesError: coursesRes.error,
          modulesError: modulesRes.error,
          lessonsError: lessonsRes.error,
          progressError: progressRes.error,
        });
        setCourses([]);
        setModules([]);
        setCompletedLessons(new Set());
        return;
      }

      const completedSet = new Set((progressRes.data ?? []).map((p) => p.lesson_id));
      setCompletedLessons(completedSet);
      setCourses(coursesRes.data ?? []);

      const modulesWithLessons: Module[] = (modulesRes.data ?? []).map((mod) => ({
        ...mod,
        lessons: (lessonsRes.data ?? [])
          .filter((lesson) => lesson.module_id === mod.id)
          .map((lesson) => ({ ...lesson, completed: completedSet.has(lesson.id) })),
      }));

      console.log("[CourseData] Data loaded:", {
        courses: coursesRes.data?.length ?? 0,
        modules: modulesWithLessons.length,
        lessons: lessonsRes.data?.length ?? 0,
        completed: completedSet.size,
      });

      setModules(modulesWithLessons);
    } catch (err) {
      console.error("[CourseData] Unexpected fetch error:", err);
      setCourses([]);
      setModules([]);
      setCompletedLessons(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void fetchData();
  }, [authLoading, fetchData]);

  const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);
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
