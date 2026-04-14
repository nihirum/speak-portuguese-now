import { ChevronDown, ChevronRight, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { useState } from "react";
import type { Tables } from "@/integrations/supabase/types";

type Lesson = Tables<"lessons"> & { completed: boolean };
type Module = Tables<"modules"> & { lessons: Lesson[] };

interface Props {
  modules: Module[];
  activeLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  completedLessons: Set<string>;
}

export default function LmsSidebar({ modules, activeLessonId, onSelectLesson, completedLessons }: Props) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    // Expand the module containing the active lesson, or the first module
    if (modules.length > 0) {
      const activeModule = modules.find((m) =>
        m.lessons.some((l) => l.id === activeLessonId)
      );
      return new Set([activeModule?.id ?? modules[0].id]);
    }
    return new Set();
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  return (
    <nav className="space-y-1">
      {modules.map((mod, mi) => {
        const expanded = expandedModules.has(mod.id);
        const completedInModule = mod.lessons.filter((l) => completedLessons.has(l.id)).length;
        const totalInModule = mod.lessons.length;

        return (
          <div key={mod.id}>
            <button
              onClick={() => toggleModule(mod.id)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left rounded-lg hover:bg-muted/50 transition-colors group"
            >
              {expanded ? (
                <ChevronDown size={16} className="text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {mi + 1}. {mod.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {completedInModule}/{totalInModule} lecciones
                </p>
              </div>
              {completedInModule === totalInModule && totalInModule > 0 && (
                <CheckCircle2 size={16} className="text-primary shrink-0" />
              )}
            </button>

            {expanded && (
              <div className="ml-4 border-l border-border pl-2 space-y-0.5 pb-1">
                {mod.lessons.map((lesson, li) => {
                  const isActive = lesson.id === activeLessonId;
                  const isCompleted = completedLessons.has(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={14} className="text-primary shrink-0" />
                      ) : (
                        <PlayCircle size={14} className="shrink-0 opacity-50" />
                      )}
                      <span className="truncate">
                        {mi + 1}.{li + 1} {lesson.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
