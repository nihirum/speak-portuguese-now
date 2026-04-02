import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import mascotPorto from "@/assets/mascot-porto.jpg";

const WHATSAPP_URL = "https://wa.me/XXXXXXXX?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20las%20clases%20de%20portugu%C3%A9s";

export default function CtaFinalSection() {
  const { lang, t } = useLang();

  return (
    <section id="contacto" className="py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img src={mascotPorto} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display font-900 text-3xl md:text-5xl text-foreground">
            {t.ctaFinal.title[lang]}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
            {t.ctaFinal.subtitle[lang]}
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-8 px-10 py-4 rounded-full font-display font-bold text-lg text-accent-foreground transition-transform hover:scale-105 animate-pulse-soft"
            style={{ background: "var(--cta-gradient)" }}
          >
            {t.ctaFinal.cta[lang]}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
