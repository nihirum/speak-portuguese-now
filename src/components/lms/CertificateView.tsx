import { forwardRef } from "react";
import logo from "@/assets/logo-ptaulas.png";

interface Props {
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  verificationId: string;
}

const CertificateView = forwardRef<HTMLDivElement, Props>(
  ({ studentName, courseTitle, issuedAt, verificationId }, ref) => {
    const date = new Date(issuedAt).toLocaleDateString("es-ES", {
      day: "numeric", month: "long", year: "numeric",
    });
    const verifyUrl = `${window.location.origin}/verify/${verificationId}`;

    return (
      <div
        ref={ref}
        className="relative bg-white text-slate-900 mx-auto"
        style={{ width: 1100, height: 780, padding: 56, fontFamily: "Georgia, serif" }}
      >
        {/* Decorative borders */}
        <div className="absolute inset-4 border-[3px] border-primary rounded-sm" />
        <div className="absolute inset-6 border border-primary/40 rounded-sm" />

        {/* Corner ornaments */}
        {["top-6 left-6", "top-6 right-6", "bottom-6 left-6", "bottom-6 right-6"].map((p) => (
          <div key={p} className={`absolute ${p} w-10 h-10 border-2 border-primary rotate-45`} />
        ))}

        <div className="relative h-full flex flex-col items-center justify-between text-center py-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-3">
            <img src={logo} alt="PTAULAS" className="w-20 h-20 rounded-full object-cover ring-2 ring-primary" />
            <p
              className="text-sm tracking-[0.4em] text-primary font-bold"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              PTAULAS
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <p className="uppercase text-xs tracking-[0.5em] text-slate-500">Certificado</p>
            <h1
              className="text-5xl font-bold text-slate-800"
              style={{ fontFamily: "Georgia, serif" }}
            >
              de Finalización
            </h1>
            <div className="w-32 h-[2px] bg-primary mx-auto mt-2" />
          </div>

          {/* Body */}
          <div className="space-y-4 max-w-2xl">
            <p className="text-base text-slate-600 italic">Se otorga el presente a</p>
            <p
              className="text-4xl font-bold text-primary"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {studentName}
            </p>
            <p className="text-base text-slate-600 italic">por completar exitosamente el curso</p>
            <p className="text-2xl font-semibold text-slate-800">{courseTitle}</p>
          </div>

          {/* Footer */}
          <div className="w-full flex items-end justify-between text-xs text-slate-600 px-8">
            <div className="text-left">
              <div className="border-t border-slate-400 w-48 mb-1" />
              <p className="font-semibold">Fecha de emisión</p>
              <p>{date}</p>
            </div>
            <div className="text-right">
              <div className="border-t border-slate-400 w-64 mb-1 ml-auto" />
              <p className="font-semibold">ID de Verificación</p>
              <p className="font-mono text-[10px] break-all">{verificationId}</p>
              <p className="text-[10px] text-slate-500 mt-1">Verificar en: {verifyUrl}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CertificateView.displayName = "CertificateView";
export default CertificateView;
