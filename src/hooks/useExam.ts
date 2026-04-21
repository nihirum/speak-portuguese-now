import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

export type Exam = Tables<"exams">;
export type ExamQuestion = Tables<"exam_questions">;
export type ExamAttempt = Tables<"exam_attempts">;

export function useExam(examId: string | null) {
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [bestAttempt, setBestAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!examId) {
      setExam(null); setQuestions([]); setBestAttempt(null);
      return;
    }
    setLoading(true);
    const [examRes, qRes, attRes] = await Promise.all([
      supabase.from("exams").select("*").eq("id", examId).maybeSingle(),
      supabase.from("exam_questions").select("*").eq("exam_id", examId).order("order"),
      user
        ? supabase.from("exam_attempts").select("*").eq("exam_id", examId).eq("user_id", user.id).order("score", { ascending: false }).limit(1)
        : Promise.resolve({ data: [] as ExamAttempt[] }),
    ]);
    setExam((examRes.data as Exam) ?? null);
    setQuestions((qRes.data as ExamQuestion[]) ?? []);
    setBestAttempt(((attRes.data as ExamAttempt[]) ?? [])[0] ?? null);
    setLoading(false);
  }, [examId, user]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const submit = async (answers: number[]) => {
    if (!user || !exam) return null;
    const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct_index ? 1 : 0), 0);
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const passed = score >= exam.passing_score;
    const { data, error } = await supabase
      .from("exam_attempts")
      .insert({ user_id: user.id, exam_id: exam.id, score, passed, answers: answers as unknown as never })
      .select()
      .single();
    if (error) { console.error("[Exam] submit error", error); return null; }
    await fetchAll();
    return data as ExamAttempt;
  };

  return { exam, questions, bestAttempt, loading, submit, refetch: fetchAll };
}
