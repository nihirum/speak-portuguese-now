import { useLang } from "@/contexts/LanguageContext";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";

export default function TestimonialsSection() {
  const { lang, t } = useLang();
  const items = t.testimonials.items;
  const [current, setCurrent] = useState(0);

  // Auto-advance one card at a time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  // Show 1 on mobile, 3 on desktop — but we animate only the active "window"
  const getVisibleItems = () => {
    const result = [];
    const count = typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 3;
    for (let i = 0; i < count; i++) {
      result.push(items[(current + i) % items.length]);
    }
    return result;
  };

  const [visible, setVisible] = useState(getVisibleItems());
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setFading(true);
    const timeout = setTimeout(() => {
      setVisible(getVisibleItems());
      setFading(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [current]);

  return (
    <section id="testimonios" className="py-20 bg-green-soft">
      <div className="container max-w-5xl mx-auto">
        <h2 className="font-display font-800 text-3xl md:text-4xl text-center text-foreground mb-14">
          {t.testimonials.title[lang]}
        </h2>

        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity duration-400 ${
            fading ? "opacity-0" : "opacity-100"
          }`}
          style={{ transition: "opacity 0.4s ease-in-out" }}
        >
          {visible.map((item, i) => (
            <div
              key={`${current}-${i}`}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm"
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
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-primary w-5" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
