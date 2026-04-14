import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCourseData } from "@/hooks/useCourseData";
import LmsSidebar from "@/components/lms/LmsSidebar";
import LessonView from "@/components/lms/LessonView";
import ProgressBar from "@/components/lms/ProgressBar";
import { LogOut, Menu, X, BookOpen, GraduationCap } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import logo from "@/assets/logo-ptaulas.png";

type Lesson = Tables<"lessons"> & { completed: boolean };

export default function Dashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const {
    modules, loading, progressPercent, completedCount, totalLessons,
    toggleLesson, completedLessons,
  } = useCourseData();

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Find the module title for the active lesson
  const activeModuleTitle = activeLesson
    ? modules.find((m) => m.lessons.some((l) => l.id === activeLesson.id))?.title ?? ""
    : "";

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const hasContent = modules.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card shrink-0 z-30">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            {hasContent && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            <img src={logo} alt="PTAULAS" className="h-8 w-8 rounded-full object-cover" />
            <span className="font-bold text-sm tracking-widest text-primary uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              PTAULAS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium hover:bg-primary/20 transition-colors"
              >
                Admin
              </button>
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

      {!hasContent ? (
        /* Empty state */
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="text-primary" size={28} />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground">
              ¡Bienvenido a tu plataforma!
            </h2>
            <p className="text-muted-foreground text-sm">
              Tu profesor aún no ha añadido contenido al curso. Cuando lo haga, aquí verás tus módulos y lecciones.
            </p>
          </div>
        </div>
      ) : (
        /* LMS Layout */
        <div className="flex-1 flex overflow-hidden relative">
          {/* Sidebar overlay on mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
              w-72 shrink-0 bg-card border-r border-border overflow-y-auto
              fixed inset-y-14 left-0 z-20
              transition-transform lg:relative lg:inset-auto lg:translate-x-0
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <div className="p-4 space-y-4">
              <ProgressBar percent={progressPercent} completed={completedCount} total={totalLessons} />

              {progressPercent === 100 && (
                <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-lg p-3">
                  <GraduationCap size={18} />
                  <span className="text-sm font-bold">¡Curso completado!</span>
                </div>
              )}

              <LmsSidebar
                modules={modules}
                activeLessonId={activeLesson?.id ?? null}
                onSelectLesson={handleSelectLesson}
                completedLessons={completedLessons}
              />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-4 md:p-8">
              {activeLesson ? (
                <LessonView
                  lesson={activeLesson}
                  moduleTitle={activeModuleTitle}
                  onToggleComplete={async (id) => {
                    await toggleLesson(id);
                    // Update active lesson completed state
                    setActiveLesson((prev) =>
                      prev ? { ...prev, completed: !prev.completed } : null
                    );
                  }}
                  isCompleted={completedLessons.has(activeLesson.id)}
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center space-y-3">
                    <BookOpen className="mx-auto text-muted-foreground" size={40} />
                    <p className="text-muted-foreground font-medium">
                      Selecciona una lección del menú para comenzar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
