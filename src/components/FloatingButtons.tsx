import { useLang } from "@/contexts/LanguageContext";
import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/XXXXXXXX?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20las%20clases%20de%20portugu%C3%A9s";

export default function FloatingButtons() {
  const { lang, setLang } = useLang();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <button
        onClick={() => setLang(lang === "es" ? "en" : "es")}
        className="w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-xs font-bold text-foreground hover:scale-110 transition-transform"
      >
        {lang === "es" ? "EN" : "ES"}
      </button>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
