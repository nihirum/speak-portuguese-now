import { useState } from "react";
import { useExam } from "@/hooks/useExam";
import { ArrowLeft, CheckCircle2, XCircle, Award, RotateCcw } from "lucide-react";

interface Props {
  examId: string;
  examNumber: number;
  moduleTitle: string;
  onBack: () => void;
  onPassed: () => void;
}

export default function ExamView({ examId, examNumber, moduleTitle, onBack, onPassed }: Props) {
  const { exam, questions, bestAttempt, loading, submit } = useExam(examId);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading || !exam) {
    return <div className="text-sm text-muted-foreground">Cargando examen...</div>;
  }

  const allAnswered = questions.length > 0 && questions.every((_, i) => answers[i] !== undefined);

  const handleSubmit = async () => {
    setSubmitting(true);
    const arr = questions.map((_, i) => answers[i] ?? -1);
    const att = await submit(arr);
    setSubmitting(false);
    if (att) {
      setResult({ score: att.score, passed: att.passed });
      if (att.passed) onPassed();
    }
  };

  const reset = () => { setAnswers({}); setResult(null); };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Volver al módulo
      </button>

      <div>
        <p className="text-xs uppercase tracking-wider text-primary font-bold">{moduleTitle}</p>
        <h1 className="font-display font-bold text-2xl text-foreground mt-1">Examen {examNumber}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {questions.length} preguntas · Aprobado con {exam.passing_score}%
        </p>
        {bestAttempt && !result && (
          <div className={`mt-3 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-medium ${
            bestAttempt.passed ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
          }`}>
            {bestAttempt.passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            Mejor intento: {bestAttempt.score}% {bestAttempt.passed ? "· Aprobado" : "· No superado"}
          </div>
        )}
      </div>

      {result ? (
        <div className={`rounded-xl border p-6 text-center space-y-3 ${
          result.passed ? "border-primary bg-primary/5" : "border-destructive bg-destructive/5"
        }`}>
          {result.passed ? (
            <Award className="mx-auto text-primary" size={48} />
          ) : (
            <XCircle className="mx-auto text-destructive" size={48} />
          )}
          <h2 className="font-display font-bold text-xl">
            {result.passed ? "¡Examen superado!" : "No has alcanzado el mínimo"}
          </h2>
          <p className="text-3xl font-bold">{result.score}%</p>
          <p className="text-sm text-muted-foreground">
            Mínimo requerido: {exam.passing_score}%
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button onClick={reset} className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 text-sm font-medium hover:border-primary">
              <RotateCcw size={14} /> Reintentar
            </button>
            <button onClick={onBack} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90">
              Continuar
            </button>
          </div>
        </div>
      ) : (
        <>
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este examen aún no tiene preguntas.</p>
          ) : (
            <div className="space-y-4">
              {questions.map((q, qi) => {
                const opts = (q.options as unknown as string[]) ?? [];
                return (
                  <div key={q.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <p className="font-medium text-foreground">
                      <span className="text-muted-foreground mr-2">{qi + 1}.</span>{q.question}
                    </p>
                    <div className="space-y-2">
                      {opts.map((opt, oi) => {
                        const selected = answers[qi] === oi;
                        return (
                          <label
                            key={oi}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              checked={selected}
                              onChange={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                              className="accent-primary"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Enviando..." : "Enviar respuestas"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
