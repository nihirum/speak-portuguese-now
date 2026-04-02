import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import mascot from "@/assets/mascot-thumbsup.png";

export default function BenefitsSection() {
  const { lang, t } = useLang();

  const colors = [
    "bg-primary/10 border-primary/30",
    "bg-accent/10 border-accent/30",
    "bg-primary/10 border-primary/30",
    "bg-accent/10 border-accent/30",
  ];

  return (
    <section id="beneficios" className="py-20 bg-muted/20">
      <div className="container">
        {/* Header with mascot */}
        <div className="flex flex-col items-center mb-14">
          <motion.img
            src={mascot}
            alt="Mascota @ptaulas"
            className="w-32 md:w-40 mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
          />
          <motion.h2
            className="font-display text-3xl md:text-5xl text-center text-primary"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {t.benefits.title[lang]}
          </motion.h2>
        </div>

        {/* Cards in 2x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {t.benefits.items.map((item, i) => (
            <motion.div
              key={i}
              className={`rounded-2xl p-6 border-2 ${colors[i]} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}
              initial={{ opacity: 0, y: 25, rotate: i % 2 === 0 ? -2 : 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 120 }}
            >
              <motion.span
                className="text-5xl block"
                whileHover={{ scale: 1.3, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {item.icon}
              </motion.span>
              <h3 className="font-display text-xl mt-4 text-foreground">{item.title[lang]}</h3>
              <p className="mt-2 text-sm text-muted-foreground font-body leading-relaxed">{item.desc[lang]}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
