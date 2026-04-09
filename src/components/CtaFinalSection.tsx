import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import mascotPorto from "@/assets/mascot-porto.jpg";

const WEBHOOK_URL = "https://hook.us2.make.com/os7227kuroxya9f5h31gbxjotpmqbydj";

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

export default function CtaFinalSection() {
  const { lang, t } = useLang();
  const f = t.ctaFinal.form;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+34");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          whatsapp: `${countryCode}${phone.replace(/\D/g, "")}`,
        }),
      });

      if (!res.ok) throw new Error("webhook error");

      toast.success(f.success[lang]);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
    } catch {
      toast.error(f.error[lang]);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contacto" className="py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img src={mascotPorto} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="container relative z-10 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display font-900 text-3xl md:text-5xl text-foreground">
            {t.ctaFinal.title[lang]}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t.ctaFinal.subtitle[lang]}
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-10 space-y-4 rounded-2xl p-6 md:p-8"
          style={{
            background: "hsla(145, 40%, 92%, 0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">{f.firstName[lang]}</label>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-primary/20 bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">{f.lastName[lang]}</label>
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-primary/20 bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">{f.email[lang]}</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-primary/20 bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">{f.whatsapp[lang]}</label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="rounded-lg border border-primary/20 bg-background px-2 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm w-28"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="612345678"
                className="flex-1 rounded-lg border border-primary/20 bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full mt-2 px-8 py-3.5 rounded-full font-display font-bold text-lg text-accent-foreground transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
            style={{ background: "var(--cta-gradient)" }}
          >
            {sending ? f.sending[lang] : f.submit[lang]}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
