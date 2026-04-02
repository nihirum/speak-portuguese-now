import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { MessageCircle, BarChart3, Rocket } from "lucide-react";

const icons = [MessageCircle, BarChart3, Rocket];

export default function HowItWorksSection() {
  const { lang, t } = useLang();

  return (
    <section className="py-20 bg-green-soft">
      <div className="container">
        <h2 className="font-display font-800 text-3xl md:text-4xl text-center text-foreground mb-14">
          {t.howItWorks.title[lang]}
        </h2>
        <div className="flex flex-col md:flex-row items-start gap-8 max-w-4xl mx-auto">
          {t.howItWorks.steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={i}
                className="flex-1 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4">
                  <Icon size={28} />
                </div>
                <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3">
                  {lang === "es" ? `Paso ${i + 1}` : `Step ${i + 1}`}
                </span>
                <h3 className="font-display font-bold text-lg text-foreground">{step.title[lang]}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc[lang]}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
