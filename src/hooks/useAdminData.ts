import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Course = Tables<"courses">;
export type Module = Tables<"modules">;
export type Lesson = Tables<"lessons">;

export interface CourseTree extends Course {
  modules: (Module & { lessons: Lesson[] })[];
}

export function useAdminData() {
  const [tree, setTree] = useState<CourseTree[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [coursesRes, modulesRes, lessonsRes] = await Promise.all([
      supabase.from("courses").select("*").order("created_at"),
      supabase.from("modules").select("*").order("order"),
      supabase.from("lessons").select("*").order("order"),
    ]);

    const courses = coursesRes.data ?? [];
    const modules = modulesRes.data ?? [];
    const lessons = lessonsRes.data ?? [];

    const built: CourseTree[] = courses.map((c) => ({
      ...c,
      modules: modules
        .filter((m) => m.course_id === c.id)
        .map((m) => ({
          ...m,
          lessons: lessons.filter((l) => l.module_id === m.id),
        })),
    }));
    setTree(built);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  // Courses
  const createCourse = async (title: string) => {
    await supabase.from("courses").insert({ title, description: "" });
    await fetchAll();
  };
  const updateCourse = async (id: string, patch: Partial<Course>) => {
    await supabase.from("courses").update(patch).eq("id", id);
    await fetchAll();
  };
  const deleteCourse = async (id: string) => {
    await supabase.from("courses").delete().eq("id", id);
    await fetchAll();
  };

  // Modules
  const createModule = async (course_id: string, title: string, order: number) => {
    await supabase.from("modules").insert({ course_id, title, order });
    await fetchAll();
  };
  const updateModule = async (id: string, patch: Partial<Module>) => {
    await supabase.from("modules").update(patch).eq("id", id);
    await fetchAll();
  };
  const deleteModule = async (id: string) => {
    await supabase.from("modules").delete().eq("id", id);
    await fetchAll();
  };

  // Lessons
  const createLesson = async (module_id: string, title: string, order: number) => {
    await supabase.from("lessons").insert({ module_id, title, order, video_url: "" });
    await fetchAll();
  };
  const updateLesson = async (id: string, patch: Partial<Lesson>) => {
    await supabase.from("lessons").update(patch).eq("id", id);
    await fetchAll();
  };
  const deleteLesson = async (id: string) => {
    await supabase.from("lessons").delete().eq("id", id);
    await fetchAll();
  };

  return {
    tree, loading, refetch: fetchAll,
    createCourse, updateCourse, deleteCourse,
    createModule, updateModule, deleteModule,
    createLesson, updateLesson, deleteLesson,
  };
}
