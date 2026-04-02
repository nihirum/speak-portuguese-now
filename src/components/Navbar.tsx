import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-ptaulas.png";

const WHATSAPP_URL = "https://wa.me/XXXXXXXX?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20las%20clases%20de%20portugu%C3%A9s";

export default function Navbar() {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);

  const links = [
    { label: t.nav.inicio[lang], href: "#inicio" },
    { label: t.nav.beneficios[lang], href: "#beneficios" },
    { label: t.nav.planes[lang], href: "#planes" },
    { label: t.nav.testimonios[lang], href: "#testimonios" },
    { label: t.nav.contacto[lang], href: "#contacto" },
  ];

  const scrollTo = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <a href="#inicio" className="flex items-center gap-2">
          <img src={logo} alt="PT-Aulas logo" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-display text-lg text-primary flex items-center gap-1">
            <span className="text-base">🇵🇹</span> ptaulas
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <button key={l.href} onClick={() => scrollTo(l.href)} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {l.label}
            </button>
          ))}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
            WhatsApp
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-4 space-y-3">
          {links.map((l) => (
            <button key={l.href} onClick={() => scrollTo(l.href)} className="block w-full text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {l.label}
            </button>
          ))}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="block bg-primary text-primary-foreground text-center px-5 py-2 rounded-full text-sm font-bold">
            WhatsApp
          </a>
        </div>
      )}
    </nav>
  );
}
