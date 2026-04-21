import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CertificateRecord {
  id: string;
  course_id: string;
  user_id: string;
  verification_id: string;
  issued_at: string;
}

export function useCertificate(courseId: string | null) {
  const { user } = useAuth();
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [examsPending, setExamsPending] = useState(0);

  const fetchCert = useCallback(async () => {
    if (!user || !courseId) {
      setCertificate(null); setExamsPending(0);
      return;
    }
    setLoading(true);
    const [certRes, modulesRes, examsRes, attemptsRes] = await Promise.all([
      supabase.from("certificates").select("*").eq("user_id", user.id).eq("course_id", courseId).maybeSingle(),
      supabase.from("modules").select("id").eq("course_id", courseId),
      supabase.from("exams").select("id, module_id"),
      supabase.from("exam_attempts").select("exam_id").eq("user_id", user.id).eq("passed", true),
    ]);

    if (certRes.error) console.error("[Cert] fetch error", certRes.error);
    setCertificate((certRes.data as CertificateRecord) ?? null);

    const moduleIds = new Set((modulesRes.data ?? []).map((m) => m.id));
    const courseExams = (examsRes.data ?? []).filter((e) => moduleIds.has(e.module_id));
    const passed = new Set((attemptsRes.data ?? []).map((a) => a.exam_id));
    const pending = courseExams.filter((e) => !passed.has(e.id)).length;
    setExamsPending(pending);

    setLoading(false);
  }, [user, courseId]);

  useEffect(() => { void fetchCert(); }, [fetchCert]);

  const issue = async (): Promise<CertificateRecord | null> => {
    if (!user || !courseId) return null;
    if (examsPending > 0) {
      console.warn("[Cert] cannot issue: exams pending", examsPending);
      return null;
    }
    setIssuing(true);
    try {
      const existing = await supabase.from("certificates").select("*")
        .eq("user_id", user.id).eq("course_id", courseId).maybeSingle();
      if (existing.data) {
        setCertificate(existing.data as CertificateRecord);
        return existing.data as CertificateRecord;
      }
      const { data, error } = await supabase.from("certificates")
        .insert({ user_id: user.id, course_id: courseId }).select().single();
      if (error) { console.error("[Cert] issue error", error); return null; }
      setCertificate(data as CertificateRecord);
      return data as CertificateRecord;
    } finally {
      setIssuing(false);
    }
  };

  return { certificate, loading, issuing, issue, examsPending };
}
