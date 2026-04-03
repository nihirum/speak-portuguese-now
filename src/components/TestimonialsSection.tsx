import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

export default function TestimonialsSection() {
  const { lang, t } = useLang();
  const items = t.testimonials.items;
  const [current, setCurrent] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const update = () => setItemsPerView(window.innerWidth < 768 ? 1 : 3);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, items.length - itemsPerView);

  const next = useCallback(() => setCurrent((c) => Math.min(c + 1, maxIndex)), [maxIndex]);
  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [maxIndex]);

  return (
    <section id="testimonios" className="py-20 bg-green-soft">
      <div className="container max-w-5xl mx-auto">
        <h2 className="font-display font-800 text-3xl md:text-4xl text-center text-foreground mb-14">
          {t.testimonials.title[lang]}
        </h2>

        <div className="relative">
          {/* Navigation arrows */}
          <button
            onClick={prev}
            disabled={current === 0}
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-muted transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            disabled={current >= maxIndex}
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-muted transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          {/* Carousel track */}
          <div className="overflow-hidden rounded-2xl">
            <motion.div
              className="flex gap-6"
              animate={{ x: `-${current * (100 / itemsPerView + (6 * 4) / (itemsPerView * 16))}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
              style={{ width: `${(items.length / itemsPerView) * 100}%` }}
            >
              {items.map((item, i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl p-6 border border-border shadow-sm"
                  style={{ width: `calc(${100 / items.length}% - ${(6 * 4 * (items.length - 1)) / (items.length * 16)}rem)` }}
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={16} className="fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground italic leading-relaxed">"{item.text[lang]}"</p>
                  <div className="mt-4">
                    <p className="font-display font-bold text-sm text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.location[lang]}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === current ? "bg-primary w-6" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
