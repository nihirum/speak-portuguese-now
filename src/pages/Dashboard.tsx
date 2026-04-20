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
    courses, modules, loading, progressPercent, completedCount, totalLessons,
    toggleLesson, completedLessons,
  } = useCourseData();
  const firstCourseId = courses[0]?.id ?? null;

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

              {progressPercent === 100 && firstCourseId && (
                <button
                  onClick={() => navigate(`/certificate?course=${firstCourseId}`)}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg p-3 font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  <GraduationCap size={18} />
                  Generar certificado
                </button>
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
                <div className="space-y-6">
                  <div>
                    <h1 className="font-display font-bold text-2xl text-foreground">
                      Tu progreso
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                      {completedCount} de {totalLessons} lecciones completadas · {progressPercent}%
                    </p>
                  </div>

                  <div className="space-y-3">
                    {modules.map((mod, mi) => {
                      const completedInModule = mod.lessons.filter((l) =>
                        completedLessons.has(l.id)
                      ).length;
                      const total = mod.lessons.length;
                      const pending = total - completedInModule;
                      const percent = total > 0 ? Math.round((completedInModule / total) * 100) : 0;
                      const isComplete = total > 0 && completedInModule === total;
                      const inProgress = completedInModule > 0 && !isComplete;
                      const nextLesson = mod.lessons.find((l) => !completedLessons.has(l.id));

                      return (
                        <button
                          key={mod.id}
                          onClick={() => {
                            const target = nextLesson ?? mod.lessons[0];
                            if (target) handleSelectLesson(target);
                          }}
                          className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Módulo {mi + 1}
                                </span>
                                {isComplete && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    Completado
                                  </span>
                                )}
                                {inProgress && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                    En curso
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {mod.title}
                              </h3>
                            </div>
                            <span className="text-sm font-bold text-foreground shrink-0">
                              {percent}%
                            </span>
                          </div>

                          <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {completedInModule}/{total} completadas · {pending} pendientes
                            </span>
                            {nextLesson && (
                              <span className="text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                Continuar →
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
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
