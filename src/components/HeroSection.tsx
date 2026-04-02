import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-porto.jpg";

const WHATSAPP_URL = "https://wa.me/XXXXXXXX?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20las%20clases%20de%20portugu%C3%A9s";

export default function HeroSection() {
  const { lang, t } = useLang();

  return (
    <section id="inicio" className="relative min-h-[520px] md:min-h-[600px] flex items-center overflow-hidden">
      {/* Background image */}
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Content overlay — right side with glassmorphism like Practice Portuguese */}
      <div className="relative z-10 container flex justify-end pt-24 pb-16 md:pt-32 md:pb-24">
        <motion.div
          className="w-full md:w-1/2 lg:w-5/12 rounded-3xl p-8 md:p-10"
          style={{
            background: "hsla(145, 40%, 92%, 0.85)",
            backdropFilter: "blur(12px)",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display font-900 text-3xl md:text-4xl lg:text-5xl leading-tight text-primary">
            {t.hero.title[lang]}
          </h1>
          <p className="mt-4 text-base md:text-lg font-medium" style={{ color: "hsl(145, 50%, 30%)" }}>
            {t.hero.subtitle[lang]}
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-8 px-8 py-4 rounded-full font-display font-bold text-lg text-accent-foreground transition-transform hover:scale-105 shadow-lg"
            style={{ background: "var(--cta-gradient)" }}
          >
            {t.hero.cta[lang]}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
