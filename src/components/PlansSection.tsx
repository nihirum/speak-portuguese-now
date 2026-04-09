import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Props { onCtaClick: () => void; }

export default function PlansSection({ onCtaClick }: Props) {
  const { lang, t } = useLang();

  return (
    <section id="planes" className="py-20 bg-background">
      <div className="container">
        <h2 className="font-display font-800 text-3xl md:text-4xl text-center text-foreground mb-14">
          {t.plans.title[lang]}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {t.plans.items.map((plan, i) => (
            <motion.div
              key={i}
              className={`relative rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                (plan as any).popular
                  ? "border-accent bg-orange-light shadow-md"
                  : "border-border bg-card"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              {(plan as any).popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full text-accent-foreground" style={{ background: "var(--cta-gradient)" }}>
                  {lang === "es" ? "Más Popular" : "Most Popular"}
                </span>
              )}
              {(plan as any).tag && (
                <span className="text-xs font-semibold text-accent mb-2 inline-block">
                  {(plan as any).tag[lang]}
                </span>
              )}
              <h3 className="font-display font-bold text-xl text-foreground">{plan.name[lang]}</h3>
              <p className="text-4xl font-display font-900 text-primary mt-3">{plan.price}</p>
              <p className="text-sm text-muted-foreground mt-1">{plan.duration[lang]}</p>
              <ul className="mt-5 space-y-2">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={16} className="text-primary" /> {plan.classes} {lang === "es" ? "clases" : "classes"}
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={16} className="text-primary" /> {plan.freq[lang]}
                </li>
              </ul>
              <button
                onClick={onCtaClick}
                className={`block w-full mt-6 text-center py-3 rounded-full font-bold text-sm transition-transform hover:scale-105 ${
                  (plan as any).popular
                    ? "text-accent-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
                style={(plan as any).popular ? { background: "var(--cta-gradient)" } : undefined}
              >
                {t.plans.cta[lang]}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
