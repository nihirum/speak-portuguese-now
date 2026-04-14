import { CheckCircle2, Circle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import VideoPlayer from "./VideoPlayer";

type Lesson = Tables<"lessons"> & { completed: boolean };

interface Props {
  lesson: Lesson;
  moduleTitle: string;
  onToggleComplete: (lessonId: string) => void;
  isCompleted: boolean;
}

export default function LessonView({ lesson, moduleTitle, onToggleComplete, isCompleted }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {moduleTitle}
        </p>
        <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mt-1">
          {lesson.title}
        </h2>
      </div>

      <VideoPlayer videoUrl={lesson.video_url ?? ""} />

      <div className="flex items-center justify-between border border-border rounded-xl p-4 bg-card">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <CheckCircle2 className="text-primary" size={22} />
          ) : (
            <Circle className="text-muted-foreground" size={22} />
          )}
          <span className="text-sm font-medium text-foreground">
            {isCompleted ? "Lección completada" : "Marcar como completada"}
          </span>
        </div>
        <button
          onClick={() => onToggleComplete(lesson.id)}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
            isCompleted
              ? "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {isCompleted ? "Desmarcar" : "Completar"}
        </button>
      </div>
    </div>
  );
}
