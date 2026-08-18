type ScoreBarProps = {
  label: string;
  value: number;
};

export function ScoreBar({ label, value }: ScoreBarProps) {
  const width = `${Math.max(0, Math.min(100, value * 10))}%`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}/10</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-teal-600 to-amber-500" style={{ width }} />
      </div>
    </div>
  );
}
