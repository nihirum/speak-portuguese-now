import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan, planAllows } from "@/hooks/useUserPlan";
import type { Tables } from "@/integrations/supabase/types";

type Course = Tables<"courses">;
type Lesson = Tables<"lessons"> & { completed: boolean };
type Exam = Tables<"exams">;
type ExamWithStatus = Exam & { passed: boolean };
export type Module = Tables<"modules"> & {
  lessons: Lesson[];
  exam: ExamWithStatus | null;
  locked: boolean;
  lockReason: "plan" | "exam" | null;
};

export function useCourseData() {
  const { user, loading: authLoading } = useAuth();
  const { plan, loading: planLoading } = useUserPlan();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lockedCourses, setLockedCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [passedExams, setPassedExams] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    if (!user) {
      setCourses([]); setLockedCourses([]); setModules([]);
      setCompletedLessons(new Set()); setPassedExams(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [coursesRes, modulesRes, lessonsRes, progressRes, examsRes, attemptsRes] = await Promise.all([
        supabase.from("courses").select("*"),
        supabase.from("modules").select("*").order("order"),
        supabase.from("lessons").select("*").order("order"),
        supabase.from("progress").select("*").eq("user_id", user.id).eq("completed", true),
        supabase.from("exams").select("*"),
        supabase.from("exam_attempts").select("exam_id, passed").eq("user_id", user.id).eq("passed", true),
      ]);

      if (coursesRes.error || modulesRes.error || lessonsRes.error || progressRes.error) {
        console.error("[CourseData] Query errors", { coursesRes, modulesRes, lessonsRes, progressRes });
        setLoading(false);
        return;
      }

      const allCourses = coursesRes.data ?? [];
      const accessibleCourses = allCourses.filter((c) => planAllows(plan, c.required_plan));
      const locked = allCourses.filter((c) => !planAllows(plan, c.required_plan));
      const accessibleIds = new Set(accessibleCourses.map((c) => c.id));

      const completedSet = new Set((progressRes.data ?? []).map((p) => p.lesson_id));
      const passedSet = new Set((attemptsRes.data ?? []).map((a) => a.exam_id));
      const exams = examsRes.data ?? [];

      const allModulesRaw = (modulesRes.data ?? [])
        .filter((mod) => accessibleIds.has(mod.course_id));

      // Group modules by course preserving order, compute lock from previous module's exam
      const byCourse = new Map<string, typeof allModulesRaw>();
      for (const mod of allModulesRaw) {
        const arr = byCourse.get(mod.course_id) ?? [];
        arr.push(mod);
        byCourse.set(mod.course_id, arr);
      }

      const modulesWithLessons: Module[] = [];
      for (const [, mods] of byCourse) {
        let prevExamPassed = true;
        let prevExamExisted = false;
        for (const mod of mods) {
          const exam = exams.find((e) => e.module_id === mod.id) ?? null;
          const planLocked = !planAllows(plan, mod.required_plan);
          const examLocked = prevExamExisted && !prevExamPassed;
          modulesWithLessons.push({
            ...mod,
            lessons: (lessonsRes.data ?? [])
              .filter((lesson) => lesson.module_id === mod.id)
              .map((lesson) => ({ ...lesson, completed: completedSet.has(lesson.id) })),
            exam: exam ? { ...exam, passed: passedSet.has(exam.id) } : null,
            locked: planLocked || examLocked,
            lockReason: planLocked ? "plan" : examLocked ? "exam" : null,
          });
          if (exam) {
            prevExamExisted = true;
            prevExamPassed = passedSet.has(exam.id);
          }
        }
      }

      setCourses(accessibleCourses);
      setLockedCourses(locked);
      setCompletedLessons(completedSet);
      setPassedExams(passedSet);
      setModules(modulesWithLessons);
    } catch (err) {
      console.error("[CourseData] Unexpected fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, plan]);

  useEffect(() => {
    if (authLoading || planLoading) return;
    void fetchData();
  }, [authLoading, planLoading, fetchData]);

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = completedLessons.size;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const toggleLesson = async (lessonId: string) => {
    if (!user) return;
    const isCompleted = completedLessons.has(lessonId);
    if (isCompleted) {
      await supabase.from("progress").update({ completed: false, completed_at: null })
        .eq("user_id", user.id).eq("lesson_id", lessonId);
    } else {
      await supabase.from("progress").upsert(
        { user_id: user.id, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" }
      );
    }
    await fetchData();
  };

  return {
    courses, lockedCourses, modules, loading, plan,
    progressPercent, completedCount, totalLessons,
    toggleLesson, completedLessons, passedExams, refetch: fetchData,
  };
}
