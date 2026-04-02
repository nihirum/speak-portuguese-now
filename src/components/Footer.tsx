import { useLang } from "@/contexts/LanguageContext";

export default function Footer() {
  const { lang, t } = useLang();

  return (
    <footer className="py-8 bg-foreground text-primary-foreground">
      <div className="container text-center">
        <p className="font-display font-bold text-lg">@ptaulas</p>
        <p className="text-sm opacity-70 mt-1">{t.footer.text[lang]}</p>
        <p className="text-xs opacity-50 mt-4">© {new Date().getFullYear()} @ptaulas. {t.footer.rights[lang]}</p>
      </div>
    </footer>
  );
}
