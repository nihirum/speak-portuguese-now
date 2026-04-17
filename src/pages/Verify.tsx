import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-ptaulas.png";

interface VerifyData {
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  verificationId: string;
}

export default function Verify() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VerifyData | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      const { data: cert, error } = await supabase
        .from("certificates")
        .select("verification_id, issued_at, user_id, course_id")
        .eq("verification_id", id)
        .maybeSingle();

      if (error || !cert) {
        setLoading(false);
        return;
      }

      const [profileRes, courseRes] = await Promise.all([
        supabase.from("profiles").select("nombre, email").eq("user_id", cert.user_id).maybeSingle(),
        supabase.from("courses").select("title").eq("id", cert.course_id).maybeSingle(),
      ]);

      setData({
        studentName: profileRes.data?.nombre || profileRes.data?.email || "Alumno/a",
        courseTitle: courseRes.data?.title || "Curso",
        issuedAt: cert.issued_at,
        verificationId: cert.verification_id,
      });
      setLoading(false);
    })();
  }, [id]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <img src={logo} alt="PTAULAS" className="h-9 w-9 rounded-full object-cover" />
        <span
          className="font-bold text-sm tracking-widest text-primary uppercase"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          PTAULAS
        </span>
      </Link>

      <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-8 shadow-lg">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-muted-foreground text-sm">Verificando certificado...</p>
          </div>
        ) : !data ? (
          <div className="text-center space-y-3 py-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="text-destructive" size={32} />
            </div>
            <h1 className="font-display font-bold text-xl">Certificado no encontrado</h1>
            <p className="text-muted-foreground text-sm">
              El ID de verificación no corresponde a ningún certificado emitido.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="text-primary" size={32} />
              </div>
              <h1 className="font-display font-bold text-xl text-foreground">
                Certificado verificado
              </h1>
              <p className="text-muted-foreground text-sm">
                Este certificado es auténtico y fue emitido por PTAULAS.
              </p>
            </div>

            <div className="border-t border-border pt-5 space-y-4 text-sm">
              <Row label="Alumno/a" value={data.studentName} />
              <Row label="Curso" value={data.courseTitle} icon={<GraduationCap size={14} />} />
              <Row
                label="Fecha de emisión"
                value={new Date(data.issuedAt).toLocaleDateString("es-ES", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              />
              <Row label="ID de verificación" value={data.verificationId} mono />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono, icon }: { label: string; value: string; mono?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        {icon} {label}
      </span>
      <span className={`text-foreground font-semibold ${mono ? "font-mono text-xs break-all" : ""}`}>
        {value}
      </span>
    </div>
  );
}
