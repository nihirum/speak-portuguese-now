import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <h1 className="font-display font-bold text-lg text-primary">PTAULAS</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            {isAdmin && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                Admin
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="container py-10">
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">
          ¡Bienvenido a tu plataforma de aprendizaje!
        </h2>
        <p className="text-muted-foreground">
          Aquí encontrarás tus módulos, lecciones y progreso. (Próximamente en la Fase 3)
        </p>
      </main>
    </div>
  );
}
