import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/hooks/useAdminData";
import { useAdminStudents, type UserPlan } from "@/hooks/useAdminStudents";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Users, Plus, ChevronDown, ChevronRight, Trash2, Check, X, Pencil, BarChart3, UserPlus, Loader2 } from "lucide-react";
import logo from "@/assets/logo-ptaulas.png";
import MetricsPanel from "@/components/admin/MetricsPanel";
import ExamEditor from "@/components/admin/ExamEditor";

type Tab = "metrics" | "content" | "students";

const PLAN_OPTIONS: { value: UserPlan | ""; label: string }[] = [
  { value: "", label: "Sin plan" },
  { value: "basico", label: "Básico" },
  { value: "pro", label: "Pro" },
  { value: "premium", label: "Premium" },
];

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("metrics");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card shrink-0">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={18} />
            </button>
            <img src={logo} alt="PTAULAS" className="h-8 w-8 rounded-full object-cover" />
            <span className="font-bold text-sm tracking-widest text-primary uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              PTAULAS · Admin
            </span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
        </div>
        <div className="flex border-t border-border px-4 gap-1 overflow-x-auto">
          <TabBtn active={tab === "metrics"} onClick={() => setTab("metrics")} icon={<BarChart3 size={14} />} label="Métricas" />
          <TabBtn active={tab === "content"} onClick={() => setTab("content")} icon={<BookOpen size={14} />} label="Contenido" />
          <TabBtn active={tab === "students"} onClick={() => setTab("students")} icon={<Users size={14} />} label="Alumnos" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {tab === "metrics" && <MetricsPanel />}
          {tab === "content" && <ContentPanel />}
          {tab === "students" && <StudentsPanel />}
        </div>
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
        active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon} {label}
    </button>
  );
}

/* =================== CONTENT =================== */

function ContentPanel() {
  const a = useAdminData();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newCourseTitle, setNewCourseTitle] = useState("");

  const toggle = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  if (a.loading) return <div className="text-sm text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">Gestión de contenido</h1>
        <p className="text-sm text-muted-foreground mt-1">Edita cursos, módulos, lecciones y exámenes.</p>
      </div>

      <div className="flex gap-2">
        <input
          value={newCourseTitle}
          onChange={(e) => setNewCourseTitle(e.target.value)}
          placeholder="Nuevo curso..."
          className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={async () => {
            if (!newCourseTitle.trim()) return;
            await a.createCourse(newCourseTitle.trim());
            setNewCourseTitle("");
          }}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1 hover:opacity-90"
        >
          <Plus size={14} /> Crear curso
        </button>
      </div>

      {a.tree.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">No hay cursos todavía.</div>
      )}

      <div className="space-y-3">
        {a.tree.map((course) => (
          <div key={course.id} className="bg-card border border-border rounded-lg overflow-hidden">
            <CourseRow
              course={course}
              expanded={expanded.has(course.id)}
              onToggle={() => toggle(course.id)}
              onUpdate={(patch: any) => a.updateCourse(course.id, patch)}
              onDelete={() => {
                if (confirm(`¿Eliminar curso "${course.title}" y todo su contenido?`)) a.deleteCourse(course.id);
              }}
            />
            {expanded.has(course.id) && (
              <div className="border-t border-border bg-background/50 p-3 space-y-2">
                {course.modules.map((m, mi) => (
                  <ModuleRow
                    key={m.id}
                    module={m}
                    moduleNumber={mi + 1}
                    expanded={expanded.has(m.id)}
                    onToggle={() => toggle(m.id)}
                    onUpdate={(patch: any) => a.updateModule(m.id, patch)}
                    onDelete={() => {
                      if (confirm(`¿Eliminar módulo "${m.title}"?`)) a.deleteModule(m.id);
                    }}
                    onAddLesson={(title: string) => a.createLesson(m.id, title, m.lessons.length)}
                    onUpdateLesson={(id: string, patch: any) => a.updateLesson(id, patch)}
                    onDeleteLesson={(id: string) => a.deleteLesson(id)}
                    a={a}
                  />
                ))}
                <AddInline
                  placeholder="Nuevo módulo..."
                  onAdd={(t) => a.createModule(course.id, t, course.modules.length)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseRow({ course, expanded, onToggle, onUpdate, onDelete }: any) {
  return (
    <div className="flex items-center gap-2 p-3">
      <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      <BookOpen size={16} className="text-primary shrink-0" />
      <EditableText value={course.title} onSave={(v) => onUpdate({ title: v })} className="flex-1 font-display font-bold text-foreground" />
      <select
        value={course.required_plan ?? ""}
        onChange={(e) => onUpdate({ required_plan: e.target.value || null })}
        className="bg-background border border-border rounded px-2 py-1 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <option value="">Abierto</option>
        <option value="basico">Plan Básico</option>
        <option value="pro">Plan Pro</option>
        <option value="premium">Plan Premium</option>
      </select>
      <button onClick={onDelete} className="text-muted-foreground hover:text-destructive">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function ModuleRow({ module: m, moduleNumber, expanded, onToggle, onUpdate, onDelete, onAddLesson, onUpdateLesson, onDeleteLesson, a }: any) {
  return (
    <div className="bg-card border border-border rounded-md">
      <div className="flex items-center gap-2 p-2">
        <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <span className="text-xs text-muted-foreground font-mono">M{moduleNumber}</span>
        <EditableText value={m.title} onSave={(v: string) => onUpdate({ title: v })} className="flex-1 text-sm font-medium" />
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive">
          <Trash2 size={12} />
        </button>
      </div>
      {expanded && (
        <div className="border-t border-border p-2 space-y-2">
          <div className="space-y-1">
            {m.lessons.map((l: any) => (
              <LessonRow
                key={l.id}
                lesson={l}
                onUpdate={(patch: any) => onUpdateLesson(l.id, patch)}
                onDelete={() => {
                  if (confirm(`¿Eliminar lección "${l.title}"?`)) onDeleteLesson(l.id);
                }}
              />
            ))}
            <AddInline placeholder="Nueva lección..." onAdd={onAddLesson} small />
          </div>

          <ExamEditor
            examNumber={moduleNumber}
            exam={m.exam}
            moduleId={m.id}
            onCreate={a.createExam}
            onUpdate={a.updateExam}
            onDelete={a.deleteExam}
            onAddQuestion={a.createQuestion}
            onUpdateQuestion={a.updateQuestion}
            onDeleteQuestion={a.deleteQuestion}
          />
        </div>
      )}
    </div>
  );
}

function LessonRow({ lesson, onUpdate, onDelete }: any) {
  const [editingVideo, setEditingVideo] = useState(false);
  const [video, setVideo] = useState(lesson.video_url ?? "");
  return (
    <div className="bg-background border border-border rounded p-2 space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono">#{lesson.order}</span>
        <EditableText value={lesson.title} onSave={(v: string) => onUpdate({ title: v })} className="flex-1 text-sm" />
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive">
          <Trash2 size={12} />
        </button>
      </div>
      {editingVideo ? (
        <div className="flex gap-1">
          <input
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="URL del vídeo (YouTube, Vimeo...)"
            className="flex-1 bg-card border border-border rounded px-2 py-1 text-xs"
          />
          <button onClick={async () => { await onUpdate({ video_url: video }); setEditingVideo(false); }} className="text-primary">
            <Check size={14} />
          </button>
          <button onClick={() => { setVideo(lesson.video_url ?? ""); setEditingVideo(false); }} className="text-muted-foreground">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditingVideo(true)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate w-full text-left"
        >
          <Pencil size={10} /> {lesson.video_url || "Añadir vídeo..."}
        </button>
      )}
    </div>
  );
}

function EditableText({ value, onSave, className = "" }: { value: string; onSave: (v: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  if (editing) {
    return (
      <div className="flex items-center gap-1 flex-1">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { onSave(draft); setEditing(false); }
            if (e.key === "Escape") { setDraft(value); setEditing(false); }
          }}
          className={`bg-background border border-border rounded px-2 py-1 ${className}`}
        />
        <button onClick={() => { onSave(draft); setEditing(false); }} className="text-primary"><Check size={14} /></button>
      </div>
    );
  }
  return (
    <button onClick={() => { setDraft(value); setEditing(true); }} className={`text-left hover:text-primary truncate ${className}`}>
      {value}
    </button>
  );
}

function AddInline({ placeholder, onAdd, small }: { placeholder: string; onAdd: (v: string) => void; small?: boolean }) {
  const [v, setV] = useState("");
  return (
    <div className="flex gap-1">
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 bg-background border border-dashed border-border rounded px-2 ${small ? "py-1 text-xs" : "py-1.5 text-sm"}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" && v.trim()) { onAdd(v.trim()); setV(""); }
        }}
      />
      <button onClick={() => { if (v.trim()) { onAdd(v.trim()); setV(""); } }} className="text-primary hover:opacity-80">
        <Plus size={14} />
      </button>
    </div>
  );
}

/* =================== STUDENTS =================== */

function StudentsPanel() {
  const { user } = useAuth();
  const { students, loading, setPlan, refetch } = useAdminStudents();
  const [showCreate, setShowCreate] = useState(false);
  if (loading) return <div className="text-sm text-muted-foreground">Cargando alumnos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Alumnos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {students.length} alumno{students.length !== 1 && "s"} registrado{students.length !== 1 && "s"}.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 hover:opacity-90"
        >
          <UserPlus size={14} /> Añadir alumno
        </button>
      </div>

      {showCreate && (
        <CreateStudentModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); void refetch(); }}
        />
      )}

      {students.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Aún no hay alumnos.</div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background/50 text-xs text-muted-foreground">
              <tr>
                <th className="text-left p-3 font-medium">Nombre</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Plan</th>
                <th className="text-left p-3 font-medium">Progreso</th>
                <th className="text-left p-3 font-medium">Certificados</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.user_id} className="border-t border-border">
                  <td className="p-3 font-medium">{s.nombre || "—"}</td>
                  <td className="p-3 text-muted-foreground">{s.email}</td>
                  <td className="p-3">
                    <select
                      value={s.plan ?? ""}
                      onChange={(e) => {
                        const v = e.target.value as UserPlan | "";
                        void setPlan(s.user_id, v === "" ? null : v, user?.id ?? null);
                      }}
                      className="bg-background border border-border rounded px-2 py-1 text-xs"
                    >
                      {PLAN_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden max-w-[120px]">
                        <div className="h-full bg-primary" style={{ width: `${s.progressPercent}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{s.completedLessons}/{s.totalLessons}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    {s.certificates > 0 ? (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {s.certificates}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CreateStudentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<UserPlan | "">("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || password.length < 6) {
      toast.error("Email y contraseña (mín. 6 caracteres) son obligatorios");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-create-user", {
      body: {
        email: email.trim(),
        password,
        nombre: nombre.trim(),
        plan: plan || null,
      },
    });
    setLoading(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? "Error creando alumno");
      return;
    }
    toast.success("Alumno creado");
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Nuevo alumno</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <Field label="Nombre">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="Juan Pérez" />
          </Field>
          <Field label="Email *">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="alumno@correo.com" />
          </Field>
          <Field label="Contraseña * (mín. 6)">
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="contraseña inicial" />
          </Field>
          <Field label="Plan">
            <select value={plan} onChange={(e) => setPlan(e.target.value as UserPlan | "")} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
              {PLAN_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-background">Cancelar</button>
          <button onClick={submit} disabled={loading} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
            {loading && <Loader2 size={14} className="animate-spin" />} Crear alumno
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground mb-1 block">{label}</span>
      {children}
    </label>
  );
}
