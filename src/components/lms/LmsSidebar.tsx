import { ChevronDown, ChevronRight, CheckCircle2, PlayCircle, FileQuestion, Lock } from "lucide-react";
import { useState } from "react";
import type { Tables } from "@/integrations/supabase/types";

type Lesson = Tables<"lessons"> & { completed: boolean };
type Exam = Tables<"exams"> & { passed: boolean };
type Module = Tables<"modules"> & {
  lessons: Lesson[];
  exam: Exam | null;
  locked?: boolean;
  lockReason?: "plan" | "exam" | null;
};

interface Props {
  modules: Module[];
  activeLessonId: string | null;
  activeExamId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  onSelectExam: (exam: Exam, moduleTitle: string, examNumber: number) => void;
  completedLessons: Set<string>;
}

export default function LmsSidebar({
  modules, activeLessonId, activeExamId, onSelectLesson, onSelectExam, completedLessons,
}: Props) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    if (modules.length > 0) {
      const activeModule = modules.find((m) =>
        m.lessons.some((l) => l.id === activeLessonId) || m.exam?.id === activeExamId
      );
      return new Set([activeModule?.id ?? modules[0].id]);
    }
    return new Set();
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId); else next.add(moduleId);
      return next;
    });
  };

  return (
    <nav className="space-y-1">
      {modules.map((mod, mi) => {
        const expanded = expandedModules.has(mod.id);
        const completedInModule = mod.lessons.filter((l) => completedLessons.has(l.id)).length;
        const totalInModule = mod.lessons.length;
        const allLessonsDone = totalInModule > 0 && completedInModule === totalInModule;
        const examUnlocked = allLessonsDone;

        return (
          <div key={mod.id}>
            <button
              onClick={() => toggleModule(mod.id)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left rounded-lg hover:bg-muted/50 transition-colors group"
            >
              {expanded ? <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                : <ChevronRight size={16} className="text-muted-foreground shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${mod.locked ? "text-muted-foreground" : "text-foreground"}`}>
                  {mi + 1}. {mod.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mod.locked
                    ? mod.lockReason === "plan"
                      ? "Requiere plan superior"
                      : "Aprueba el examen anterior"
                    : `${completedInModule}/${totalInModule} lecciones`}
                </p>
              </div>
              {mod.locked ? (
                <Lock size={16} className="text-muted-foreground shrink-0" />
              ) : allLessonsDone && (!mod.exam || mod.exam.passed) ? (
                <CheckCircle2 size={16} className="text-primary shrink-0" />
              ) : null}
            </button>

            {expanded && !mod.locked && (
              <div className="ml-4 border-l border-border pl-2 space-y-0.5 pb-1">
                {mod.lessons.map((lesson, li) => {
                  const isActive = lesson.id === activeLessonId;
                  const isCompleted = completedLessons.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-md text-sm transition-colors ${
                        isActive ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={14} className="text-primary shrink-0" />
                        : <PlayCircle size={14} className="shrink-0 opacity-50" />}
                      <span className="truncate">{mi + 1}.{li + 1} {lesson.title}</span>
                    </button>
                  );
                })}

                {mod.exam && (
                  <button
                    onClick={() => examUnlocked && onSelectExam(mod.exam!, mod.title, mi + 1)}
                    disabled={!examUnlocked}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-md text-sm transition-colors ${
                      mod.exam.id === activeExamId ? "bg-primary/10 text-primary font-medium"
                        : examUnlocked ? "text-foreground hover:bg-muted/50"
                        : "text-muted-foreground/60 cursor-not-allowed"
                    }`}
                  >
                    {!examUnlocked ? <Lock size={14} className="shrink-0" />
                      : mod.exam.passed ? <CheckCircle2 size={14} className="text-primary shrink-0" />
                      : <FileQuestion size={14} className="shrink-0" />}
                    <span className="truncate font-medium">Examen {mi + 1}</span>
                    {mod.exam.passed && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-auto">✓</span>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
