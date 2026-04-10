import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WEBHOOK_URL = "https://hook.us2.make.com/fq3tl5fcqhcl329smj26ptznaiiwh36n";

const COUNTRY_CODES = [
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+34", label: "🇪🇸 +34" },
  { code: "+52", label: "🇲🇽 +52" },
  { code: "+55", label: "🇧🇷 +55" },
  { code: "+57", label: "🇨🇴 +57" },
  { code: "+54", label: "🇦🇷 +54" },
  { code: "+56", label: "🇨🇱 +56" },
  { code: "+51", label: "🇵🇪 +51" },
  { code: "+593", label: "🇪🇨 +593" },
  { code: "+58", label: "🇻🇪 +58" },
  { code: "+351", label: "🇵🇹 +351" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+33", label: "🇫🇷 +33" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function RegistrationModal({ open, onClose }: Props) {
  const { lang, t } = useLang();
  const f = t.ctaFinal.form;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+34");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  const reset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          whatsapp: `${countryCode}${phone.replace(/\D/g, "")}`,
        }),
      });
      // no-cors returns opaque response (status 0), so we trust it was sent
      toast.success(f.success[lang]);
      reset();
      onClose();
    } catch {
      toast.error(f.error[lang]);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl"
            style={{
              background: "hsla(145, 40%, 92%, 0.95)",
              backdropFilter: "blur(12px)",
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-primary/60 hover:text-primary transition-colors"
            >
              <X size={22} />
            </button>

            <h3 className="font-display font-900 text-2xl text-primary text-center">
              {t.ctaFinal.title[lang]}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground text-center">
              {t.ctaFinal.subtitle[lang]}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">{f.firstName[lang]}</label>
                  <input required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">{f.lastName[lang]}</label>
                  <input required value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">{f.email[lang]}</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">{f.whatsapp[lang]}</label>
                <div className="flex gap-2">
                  <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                    className="rounded-lg border border-primary/20 bg-background px-2 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm w-28">
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="612345678"
                    className="flex-1 rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
              </div>

              <button type="submit" disabled={sending}
                className="w-full px-8 py-3 rounded-full font-display font-bold text-base text-accent-foreground transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
                style={{ background: "var(--cta-gradient)" }}>
                {sending ? f.sending[lang] : f.submit[lang]}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
