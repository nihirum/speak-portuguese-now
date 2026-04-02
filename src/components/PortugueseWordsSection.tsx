import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useState } from "react";
import mascot from "@/assets/mascot-signpost.png";

interface WordBubbleProps {
  word: string;
  translation: string;
}

function WordBubble({ word, translation }: WordBubbleProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex flex-col items-start cursor-pointer group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen(!open)}
    >
      <span className="inline-flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md transition-shadow">
        <span className="font-display font-bold text-foreground text-lg md:text-xl">{word}</span>
        <span className="text-muted-foreground text-xs">•••</span>
      </span>
      <span className="text-xs font-semibold text-accent mt-0.5 ml-1">{translation}</span>
    </span>
  );
}

export default function PortugueseWordsSection() {
  const { lang } = useLang();

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          {/* Mascot */}
          <motion.div
            className="flex-shrink-0 w-56 md:w-72"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <img src={mascot} alt="Mascota @ptaulas" className="w-full" />
          </motion.div>

          {/* Text with Portuguese words */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <h2 className="font-display font-900 text-2xl md:text-4xl leading-relaxed text-foreground">
              {lang === "es" ? (
                <>
                  ¿Estás planeando{" "}
                  <WordBubble word="estudar" translation="estudiar" />
                  ,{" "}
                  <WordBubble word="trabalhar" translation="trabajar" />
                  {" "}o{" "}
                  <WordBubble word="viajar" translation="viajar" />
                  {" "}en Portugal?
                </>
              ) : (
                <>
                  Are you planning to{" "}
                  <WordBubble word="estudar" translation="study" />
                  ,{" "}
                  <WordBubble word="trabalhar" translation="work" />
                  {" "}or{" "}
                  <WordBubble word="viajar" translation="travel" />
                  {" "}in Portugal?
                </>
              )}
            </h2>
            <p className="mt-5 text-base md:text-lg text-muted-foreground">
              {lang === "es" ? (
                <>
                  Domina el portugués antes de{" "}
                  <WordBubble word="chegar" translation="llegar" />
                </>
              ) : (
                <>
                  Become fluent in Portuguese before you{" "}
                  <WordBubble word="chegar" translation="arrive" />
                </>
              )}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
