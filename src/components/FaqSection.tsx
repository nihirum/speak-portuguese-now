import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import mascotFaq from "@/assets/mascot-faq.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqSection() {
  const { lang, t } = useLang();
  const faqs = t.faq.items;

  return (
    <section id="faq" className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        {/* Header with mascot */}
        <motion.div
          className="flex flex-col items-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={mascotFaq}
            alt="FAQ mascot"
            className="w-40 md:w-52 mb-4"
          />
          <h2 className="font-display font-900 text-3xl md:text-4xl text-foreground text-center">
            {t.faq.title[lang]}
          </h2>
        </motion.div>

        {/* Accordion */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border rounded-xl px-5 shadow-sm"
              >
                <AccordionTrigger className="text-left font-display font-bold text-base md:text-lg hover:no-underline">
                  {faq.q[lang]}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base">
                  {faq.a[lang]}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
