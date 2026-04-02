import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export default function BenefitsSection() {
  const { lang, t } = useLang();

  return (
    <section id="beneficios" className="py-20 bg-background">
      <div className="container">
        <h2 className="font-display font-800 text-3xl md:text-4xl text-center text-foreground mb-14">
          {t.benefits.title[lang]}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.benefits.items.map((item, i) => (
            <motion.div
              key={i}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-4xl">{item.icon}</span>
              <h3 className="font-display font-bold text-lg mt-4 text-foreground">{item.title[lang]}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc[lang]}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
