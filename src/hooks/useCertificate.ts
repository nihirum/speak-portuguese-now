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

  const fetchCert = useCallback(async () => {
    if (!user || !courseId) {
      setCertificate(null);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();
    if (error) console.error("[Cert] fetch error", error);
    setCertificate((data as CertificateRecord) ?? null);
    setLoading(false);
  }, [user, courseId]);

  useEffect(() => {
    void fetchCert();
  }, [fetchCert]);

  const issue = async (): Promise<CertificateRecord | null> => {
    if (!user || !courseId) return null;
    setIssuing(true);
    try {
      // Avoid duplicates
      const existing = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();
      if (existing.data) {
        setCertificate(existing.data as CertificateRecord);
        return existing.data as CertificateRecord;
      }
      const { data, error } = await supabase
        .from("certificates")
        .insert({ user_id: user.id, course_id: courseId })
        .select()
        .single();
      if (error) {
        console.error("[Cert] issue error", error);
        return null;
      }
      setCertificate(data as CertificateRecord);
      return data as CertificateRecord;
    } finally {
      setIssuing(false);
    }
  };

  return { certificate, loading, issuing, issue };
}
