import { useState } from "react";
import { Plus, Trash2, Check, ChevronDown, ChevronRight, FileQuestion } from "lucide-react";
import type { Tables, Json } from "@/integrations/supabase/types";

type Exam = Tables<"exams">;
type ExamQuestion = Tables<"exam_questions">;

interface Props {
  examNumber: number;
  exam: (Exam & { questions: ExamQuestion[] }) | null;
  moduleId: string;
  onCreate: (moduleId: string, title: string) => void;
  onUpdate: (id: string, patch: Partial<Exam>) => void;
  onDelete: (id: string) => void;
  onAddQuestion: (examId: string, order: number) => void;
  onUpdateQuestion: (id: string, patch: Partial<ExamQuestion>) => void;
  onDeleteQuestion: (id: string) => void;
}

export default function ExamEditor({
  examNumber, exam, moduleId,
  onCreate, onUpdate, onDelete,
  onAddQuestion, onUpdateQuestion, onDeleteQuestion,
}: Props) {
  const [open, setOpen] = useState(false);

  if (!exam) {
    return (
      <button
        onClick={() => onCreate(moduleId, `Examen ${examNumber}`)}
        className="w-full text-left text-xs text-muted-foreground hover:text-primary border border-dashed border-border rounded p-2 flex items-center gap-2"
      >
        <FileQuestion size={12} /> Crear examen para este módulo
      </button>
    );
  }

  return (
    <div className="bg-accent/30 border border-border rounded p-2 space-y-2">
      <div className="flex items-center gap-2">
        <button onClick={() => setOpen(!open)} className="text-muted-foreground hover:text-foreground">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <FileQuestion size={14} className="text-primary" />
        <span className="flex-1 text-sm font-medium">Examen {examNumber}</span>
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          Aprobado:
          <input
            type="number" min={0} max={100}
            defaultValue={exam.passing_score}
            onBlur={(e) => {
              const v = Math.max(0, Math.min(100, Number(e.target.value) || 70));
              if (v !== exam.passing_score) onUpdate(exam.id, { passing_score: v });
            }}
            className="w-12 bg-background border border-border rounded px-1 py-0.5 text-xs"
          />%
        </label>
        <button
          onClick={() => { if (confirm("¿Eliminar examen y todas sus preguntas?")) onDelete(exam.id); }}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {open && (
        <div className="space-y-2 pl-5">
          {exam.questions.length === 0 && (
            <p className="text-xs text-muted-foreground">Sin preguntas todavía.</p>
          )}
          {exam.questions.map((q, idx) => (
            <QuestionRow
              key={q.id}
              index={idx + 1}
              question={q}
              onUpdate={(patch) => onUpdateQuestion(q.id, patch)}
              onDelete={() => onDeleteQuestion(q.id)}
            />
          ))}
          <button
            onClick={() => onAddQuestion(exam.id, exam.questions.length)}
            className="w-full text-xs text-primary hover:opacity-80 border border-dashed border-border rounded p-1.5 flex items-center justify-center gap-1"
          >
            <Plus size={12} /> Añadir pregunta
          </button>
        </div>
      )}
    </div>
  );
}

function QuestionRow({
  index, question, onUpdate, onDelete,
}: {
  index: number;
  question: ExamQuestion;
  onUpdate: (patch: Partial<ExamQuestion>) => void;
  onDelete: () => void;
}) {
  const opts = (question.options as unknown as string[]) ?? [];
  const [text, setText] = useState(question.question);
  const [options, setOptions] = useState<string[]>(opts.length ? opts : ["", "", "", ""]);
  const [correct, setCorrect] = useState(question.correct_index);
  const [dirty, setDirty] = useState(false);

  const save = () => {
    onUpdate({
      question: text,
      options: options as unknown as Json,
      correct_index: correct,
    });
    setDirty(false);
  };

  return (
    <div className="bg-card border border-border rounded p-2 space-y-2">
      <div className="flex items-start gap-2">
        <span className="text-xs text-muted-foreground font-mono pt-1.5">P{index}</span>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setDirty(true); }}
          rows={2}
          className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs resize-none"
          placeholder="Enunciado..."
        />
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive">
          <Trash2 size={12} />
        </button>
      </div>
      <div className="space-y-1 pl-6">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              checked={correct === i}
              onChange={() => { setCorrect(i); setDirty(true); }}
              className="accent-primary"
            />
            <input
              value={opt}
              onChange={(e) => {
                const next = [...options]; next[i] = e.target.value;
                setOptions(next); setDirty(true);
              }}
              placeholder={`Opción ${i + 1}`}
              className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs"
            />
          </div>
        ))}
      </div>
      {dirty && (
        <button onClick={save} className="text-xs bg-primary text-primary-foreground rounded px-2 py-1 flex items-center gap-1 ml-6">
          <Check size={12} /> Guardar pregunta
        </button>
      )}
    </div>
  );
}
