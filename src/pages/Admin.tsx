import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/hooks/useAdminData";
import { useAdminStudents } from "@/hooks/useAdminStudents";
import { ArrowLeft, BookOpen, Users, Plus, ChevronDown, ChevronRight, Trash2, Check, X, Pencil } from "lucide-react";
import logo from "@/assets/logo-ptaulas.png";

type Tab = "content" | "students";

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("content");

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
        <div className="flex border-t border-border px-4 gap-1">
          <TabBtn active={tab === "content"} onClick={() => setTab("content")} icon={<BookOpen size={14} />} label="Contenido" />
          <TabBtn active={tab === "students"} onClick={() => setTab("students")} icon={<Users size={14} />} label="Alumnos" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {tab === "content" ? <ContentPanel /> : <StudentsPanel />}
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
        <p className="text-sm text-muted-foreground mt-1">Edita cursos, módulos y lecciones.</p>
      </div>

      {/* Add course */}
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
              onUpdate={(patch) => a.updateCourse(course.id, patch)}
              onDelete={() => {
                if (confirm(`¿Eliminar curso "${course.title}" y todo su contenido?`)) a.deleteCourse(course.id);
              }}
            />
            {expanded.has(course.id) && (
              <div className="border-t border-border bg-background/50 p-3 space-y-2">
                {course.modules.map((m) => (
                  <ModuleRow
                    key={m.id}
                    module={m}
                    expanded={expanded.has(m.id)}
                    onToggle={() => toggle(m.id)}
                    onUpdate={(patch) => a.updateModule(m.id, patch)}
                    onDelete={() => {
                      if (confirm(`¿Eliminar módulo "${m.title}"?`)) a.deleteModule(m.id);
                    }}
                    onAddLesson={(title) => a.createLesson(m.id, title, m.lessons.length)}
                    onUpdateLesson={(id, patch) => a.updateLesson(id, patch)}
                    onDeleteLesson={(id) => a.deleteLesson(id)}
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
      <button onClick={onDelete} className="text-muted-foreground hover:text-destructive">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function ModuleRow({ module: m, expanded, onToggle, onUpdate, onDelete, onAddLesson, onUpdateLesson, onDeleteLesson }: any) {
  return (
    <div className="bg-card border border-border rounded-md">
      <div className="flex items-center gap-2 p-2">
        <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <span className="text-xs text-muted-foreground font-mono">#{m.order}</span>
        <EditableText value={m.title} onSave={(v: string) => onUpdate({ title: v })} className="flex-1 text-sm font-medium" />
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive">
          <Trash2 size={12} />
        </button>
      </div>
      {expanded && (
        <div className="border-t border-border p-2 space-y-1">
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
          <button
            onClick={async () => { await onUpdate({ video_url: video }); setEditingVideo(false); }}
            className="text-primary"
          ><Check size={14} /></button>
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
      <button
        onClick={() => { if (v.trim()) { onAdd(v.trim()); setV(""); } }}
        className="text-primary hover:opacity-80"
      ><Plus size={14} /></button>
    </div>
  );
}

/* =================== STUDENTS =================== */

function StudentsPanel() {
  const { students, loading } = useAdminStudents();
  if (loading) return <div className="text-sm text-muted-foreground">Cargando alumnos...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">Alumnos</h1>
        <p className="text-sm text-muted-foreground mt-1">{students.length} alumno{students.length !== 1 && "s"} registrado{students.length !== 1 && "s"}.</p>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Aún no hay alumnos.</div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background/50 text-xs text-muted-foreground">
              <tr>
                <th className="text-left p-3 font-medium">Nombre</th>
                <th className="text-left p-3 font-medium">Email</th>
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
