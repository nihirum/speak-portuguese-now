import { createContext, useContext, useState, type ReactNode } from "react";

type Lang = "es" | "en";

const translations = {
  nav: {
    inicio: { es: "Inicio", en: "Home" },
    beneficios: { es: "Beneficios", en: "Benefits" },
    planes: { es: "Planes", en: "Plans" },
    testimonios: { es: "Testimonios", en: "Testimonials" },
    contacto: { es: "Contacto", en: "Contact" },
  },
  hero: {
    title: { es: "Aprende portugués real desde el primer día", en: "Learn real Portuguese from day one" },
    subtitle: {
      es: "Clases personalizadas online con resultados rápidos y a precio accesible",
      en: "Personalized online classes with fast results at an affordable price",
    },
    cta: { es: "Inscríbete ahora", en: "Sign up now" },
  },
  benefits: {
    title: { es: "¿Por qué elegirnos?", en: "Why choose us?" },
    items: [
      {
        title: { es: "Habla desde la primera clase", en: "Speak from the first class" },
        desc: {
          es: "Nuestro método conversacional te pone a hablar desde el minuto uno.",
          en: "Our conversational method gets you speaking from minute one.",
        },
        icon: "🗣️",
      },
      {
        title: { es: "Clases personalizadas", en: "Personalized classes" },
        desc: {
          es: "Cada clase se adapta a tu nivel, objetivos y ritmo de aprendizaje.",
          en: "Each class adapts to your level, goals, and learning pace.",
        },
        icon: "🎯",
      },
      {
        title: { es: "Portugués real, no de libro", en: "Real Portuguese, not textbook" },
        desc: {
          es: "Aprende el portugués que realmente se habla en Portugal y Brasil.",
          en: "Learn the Portuguese that's actually spoken in Portugal and Brazil.",
        },
        icon: "🇵🇹",
      },
      {
        title: { es: "Resultados rápidos", en: "Fast results" },
        desc: {
          es: "En pocas semanas notarás un avance significativo en tu fluidez.",
          en: "In just a few weeks you'll notice significant improvement in your fluency.",
        },
        icon: "⚡",
      },
    ],
  },
  howItWorks: {
    title: { es: "¿Cómo funciona?", en: "How does it work?" },
    steps: [
      {
        title: { es: "Contáctanos por WhatsApp", en: "Contact us on WhatsApp" },
        desc: { es: "Escríbenos y te respondemos al instante.", en: "Write to us and we'll respond instantly." },
      },
      {
        title: { es: "Evaluamos tu nivel", en: "We assess your level" },
        desc: { es: "Una breve charla para conocer tu punto de partida.", en: "A brief chat to know your starting point." },
      },
      {
        title: { es: "¡Empieza a hablar portugués!", en: "Start speaking Portuguese!" },
        desc: { es: "Desde la primera clase estarás hablando.", en: "From the first class you'll be speaking." },
      },
    ],
  },
  plans: {
    title: { es: "Nuestros Planes", en: "Our Plans" },
    cta: { es: "Empezar por WhatsApp", en: "Start via WhatsApp" },
    items: [
      { name: { es: "Plan Básico", en: "Basic Plan" }, classes: "12", freq: { es: "2 veces/semana", en: "2x/week" }, price: "$75", duration: { es: "1 mes", en: "1 month" } },
      { name: { es: "Plan Intermedio", en: "Intermediate Plan" }, classes: "24", freq: { es: "3 veces/semana", en: "3x/week" }, price: "$150", duration: { es: "2 meses", en: "2 months" }, popular: true },
      { name: { es: "Plan Pareja", en: "Couple Plan" }, classes: "24", freq: { es: "3 veces/semana", en: "3x/week" }, price: "$200", duration: { es: "2 meses", en: "2 months" }, tag: { es: "Para 2 personas", en: "For 2 people" } },
      { name: { es: "Plan Avanzado", en: "Advanced Plan" }, classes: "48", freq: { es: "3 veces/semana", en: "3x/week" }, price: "$260", duration: { es: "4 meses", en: "4 months" } },
      { name: { es: "Plan Premium", en: "Premium Plan" }, classes: "60", freq: { es: "3 veces/semana", en: "3x/week" }, price: "$390", duration: { es: "6 meses", en: "6 months" } },
      { name: { es: "Premium Pareja", en: "Premium Couple" }, classes: "60", freq: { es: "3 veces/semana", en: "3x/week" }, price: "$600", duration: { es: "6 meses", en: "6 months" }, tag: { es: "Pago dividido", en: "Split payment" } },
    ],
  },
  testimonials: {
    title: { es: "Lo que dicen nuestros estudiantes", en: "What our students say" },
    items: [
      { text: { es: "En pocas semanas ya podía mantener conversaciones básicas. ¡Increíble método!", en: "In just a few weeks I could hold basic conversations. Incredible method!" }, name: "María G.", location: { es: "Madrid, España", en: "Madrid, Spain" } },
      { text: { es: "Las clases son súper dinámicas y personalizadas. Me encanta aprender así.", en: "The classes are super dynamic and personalized. I love learning this way." }, name: "Carlos R.", location: { es: "CDMX, México", en: "CDMX, Mexico" } },
      { text: { es: "Excelente relación calidad-precio. El mejor curso de portugués que he tomado.", en: "Excellent value for money. The best Portuguese course I've taken." }, name: "Ana L.", location: { es: "Bogotá, Colombia", en: "Bogotá, Colombia" } },
    ],
  },
  ctaFinal: {
    title: { es: "Empieza hoy a hablar portugués", en: "Start speaking Portuguese today" },
    subtitle: { es: "No esperes más. Tu primera clase puede ser mañana.", en: "Don't wait any longer. Your first class could be tomorrow." },
    cta: { es: "Hablar por WhatsApp", en: "Chat on WhatsApp" },
  },
  footer: {
    text: { es: "Clases de portugués online personalizadas", en: "Personalized online Portuguese classes" },
    rights: { es: "Todos los derechos reservados.", en: "All rights reserved." },
  },
  tooltips: {
    "portugués real": { es: "El portugués que se habla en la calle, no el de los libros", en: "The Portuguese spoken on the street, not from textbooks" },
    "clases personalizadas": { es: "Adaptadas 100% a tu nivel y objetivos", en: "100% adapted to your level and goals" },
    "resultados rápidos": { es: "Nuestros alumnos notan avances desde la semana 2", en: "Our students notice progress from week 2" },
  },
};

type Translations = typeof translations;

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("es");
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
