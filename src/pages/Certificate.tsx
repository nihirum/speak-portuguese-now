import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCertificate } from "@/hooks/useCertificate";
import CertificateView from "@/components/lms/CertificateView";
import { toast } from "sonner";

export default function Certificate() {
  const [params] = useSearchParams();
  const courseId = params.get("course");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { certificate, issue, loading, issuing } = useCertificate(courseId);
  const [studentName, setStudentName] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (!user || !courseId) return;
      const [profileRes, courseRes] = await Promise.all([
        supabase.from("profiles").select("nombre, email").eq("user_id", user.id).maybeSingle(),
        supabase.from("courses").select("title").eq("id", courseId).maybeSingle(),
      ]);
      setStudentName(profileRes.data?.nombre || profileRes.data?.email || "Alumno/a");
      setCourseTitle(courseRes.data?.title || "Curso");
    })();
  }, [user, courseId]);

  // Auto-issue if 100% complete and missing
  useEffect(() => {
    if (!loading && !certificate && courseId && user) {
      void issue();
    }
  }, [loading, certificate, courseId, user, issue]);

  const handleDownload = async () => {
    if (!certRef.current || !certificate) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1100, 780] });
      pdf.addImage(img, "PNG", 0, 0, 1100, 780);
      pdf.save(`certificado-${certificate.verification_id}.pdf`);
    } catch (e) {
      console.error(e);
      toast.error("Error al generar el PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (!courseId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Curso no especificado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-[1180px] mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} /> Volver al curso
          </button>
          {certificate && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 disabled:opacity-50"
            >
              {downloading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              Descargar PDF
            </button>
          )}
        </div>

        {(loading || issuing || !certificate) ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div className="overflow-auto">
            <CertificateView
              ref={certRef}
              studentName={studentName}
              courseTitle={courseTitle}
              issuedAt={certificate.issued_at}
              verificationId={certificate.verification_id}
            />
          </div>
        )}
      </div>
    </div>
  );
}
