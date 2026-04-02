import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function TestimonialsSection() {
  const { lang, t } = useLang();

  return (
    <section id="testimonios" className="py-20 bg-green-soft">
      <div className="container">
        <h2 className="font-display font-800 text-3xl md:text-4xl text-center text-foreground mb-14">
          {t.testimonials.title[lang]}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {t.testimonials.items.map((item, i) => (
            <motion.div
              key={i}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={16} className="fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-foreground italic">"{item.text[lang]}"</p>
              <div className="mt-4">
                <p className="font-display font-bold text-sm text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.location[lang]}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
