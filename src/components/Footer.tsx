import { useLang } from "@/contexts/LanguageContext";
import logo from "@/assets/logo-ptaulas.png";

export default function Footer() {
  const { lang, t } = useLang();

  return (
    <footer className="py-8 bg-foreground text-primary-foreground">
      <div className="container flex flex-col items-center text-center">
        <img src={logo} alt="PT-Aulas logo" className="h-14 w-14 rounded-full object-cover mb-3" />
        <p className="font-display text-lg flex items-center gap-1">
          <span>🇵🇹</span> ptaulas
        </p>
        <p className="text-sm opacity-70 mt-1">{t.footer.text[lang]}</p>
        <p className="text-xs opacity-50 mt-4">© {new Date().getFullYear()} @ptaulas. {t.footer.rights[lang]}</p>
      </div>
    </footer>
  );
}
