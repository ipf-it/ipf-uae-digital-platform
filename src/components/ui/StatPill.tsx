type StatPillProps = {
  label: string;
  value: string;
  className?: string;
};

export function StatPill({ label, value, className = "" }: StatPillProps) {
  return (
    <div className={`border-l-4 border-[var(--ipf-saffron)] bg-[var(--ipf-paper)] px-4 py-3 ${className}`.trim()}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ipf-muted)]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[var(--ipf-navy)]">{value}</p>
    </div>
  );
}
