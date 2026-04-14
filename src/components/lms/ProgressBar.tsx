interface Props {
  percent: number;
  completed: number;
  total: number;
}

export default function ProgressBar({ percent, completed, total }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">Progreso del curso</span>
        <span className="text-muted-foreground">
          {completed}/{total} lecciones · {percent}%
        </span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
