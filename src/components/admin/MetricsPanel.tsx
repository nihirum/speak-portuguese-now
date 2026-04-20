import { useAdminMetrics, type MonthBucket } from "@/hooks/useAdminMetrics";
import { Users, UserCheck, BookOpen, Award, TrendingUp, CheckCircle2 } from "lucide-react";

export default function MetricsPanel() {
  const { metrics, loading } = useAdminMetrics();

  if (loading) return <div className="text-sm text-muted-foreground">Cargando métricas...</div>;

  const m = metrics;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">Métricas</h1>
        <p className="text-sm text-muted-foreground mt-1">Visión general del rendimiento de la academia.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Kpi icon={<Users size={16} />} label="Alumnos" value={m.totalStudents} />
        <Kpi icon={<UserCheck size={16} />} label="Activos" value={m.activeStudents} hint={`${m.totalStudents > 0 ? Math.round((m.activeStudents / m.totalStudents) * 100) : 0}%`} />
        <Kpi icon={<BookOpen size={16} />} label="Lecciones" value={m.totalLessons} />
        <Kpi icon={<CheckCircle2 size={16} />} label="Completadas" value={m.totalCompletions} />
        <Kpi icon={<TrendingUp size={16} />} label="Progreso medio" value={`${m.avgProgressPercent}%`} />
        <Kpi icon={<Award size={16} />} label="Certificados" value={m.certificatesIssued} hint={`${m.completionRate}% finalización`} />
      </div>

      {/* Top lecciones */}
      <Card title="Lecciones más vistas">
        {m.topLessons.length === 0 ? (
          <Empty text="Aún no hay datos de lecciones." />
        ) : (
          <ul className="space-y-2">
            {m.topLessons.map((l) => {
              const max = Math.max(...m.topLessons.map((x) => x.views), 1);
              const pct = (l.views / max) * 100;
              return (
                <li key={l.lesson_id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="truncate text-foreground">{l.title}</span>
                    <span className="text-muted-foreground tabular-nums">{l.views}</span>
                  </div>
                  <div className="h-1.5 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Lecciones completadas / mes">
          <BarChart data={m.completionsByMonth} />
        </Card>
        <Card title="Certificados emitidos / mes">
          <BarChart data={m.certificatesByMonth} />
        </Card>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display font-bold text-2xl text-foreground">{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-xs text-muted-foreground py-4 text-center">{text}</div>;
}

function BarChart({ data }: { data: MonthBucket[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d) => {
        const h = (d.count / max) * 100;
        const [, mm] = d.month.split("-");
        const monthLabel = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][parseInt(mm, 10) - 1];
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground tabular-nums">{d.count}</span>
            <div className="w-full bg-background rounded-t flex-1 flex items-end overflow-hidden" style={{ minHeight: 4 }}>
              <div className="w-full bg-primary rounded-t transition-all" style={{ height: `${h}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground">{monthLabel}</span>
          </div>
        );
      })}
    </div>
  );
}
