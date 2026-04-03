import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { MessageCircle, BarChart3, Rocket } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/XXXXXXXX?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20las%20clases%20de%20portugu%C3%A9s";

const icons = [MessageCircle, BarChart3, Rocket];

export default function HowItWorksSection() {
  const { lang, t } = useLang();

  return (
    <section className="py-20 bg-green-soft">
      <div className="container max-w-lg mx-auto">
        <h2 className="font-display font-800 text-3xl md:text-4xl text-center text-foreground mb-12">
          {t.howItWorks.title[lang]}
        </h2>

        <div className="space-y-10">
          {t.howItWorks.steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={i}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Icon size={24} />
                  </div>
                  {i < t.howItWorks.steps.length - 1 && (
                    <div className="w-0.5 h-10 bg-primary/20 mt-2" />
                  )}
                </div>
                <div className="pt-1">
                  <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-0.5 rounded-full mb-1">
                    {lang === "es" ? `Paso ${i + 1}` : `Step ${i + 1}`}
                  </span>
                  <h3 className="font-display font-bold text-lg text-foreground">{step.title[lang]}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.desc[lang]}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 rounded-full font-display font-bold text-base text-accent-foreground transition-transform hover:scale-105"
            style={{ background: "var(--cta-gradient)" }}
          >
            {lang === "es" ? "Empezar ahora" : "Start now"}
          </a>
        </div>
      </div>
    </section>
  );
}
