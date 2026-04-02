import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import mascot from "@/assets/mascot-backpack.png";

const WHATSAPP_URL = "https://wa.me/XXXXXXXX?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20las%20clases%20de%20portugu%C3%A9s";

export default function HeroSection() {
  const { lang, t } = useLang();

  return (
    <section id="inicio" className="pt-24 pb-16 md:pt-32 md:pb-24" style={{ background: "var(--hero-gradient)" }}>
      <div className="container flex flex-col-reverse md:flex-row items-center gap-10">
        <motion.div
          className="flex-1 text-center md:text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground">
            {t.hero.title[lang]}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-lg mx-auto md:mx-0">
            {t.hero.subtitle[lang]}
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-8 px-8 py-4 rounded-full font-display font-bold text-lg text-accent-foreground transition-transform hover:scale-105"
            style={{ background: "var(--cta-gradient)" }}
          >
            {t.hero.cta[lang]}
          </a>
        </motion.div>

        <motion.div
          className="flex-1 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <img src={mascot} alt="Mascota @ptaulas" className="w-64 md:w-80 lg:w-96 animate-float drop-shadow-xl" />
        </motion.div>
      </div>
    </section>
  );
}
