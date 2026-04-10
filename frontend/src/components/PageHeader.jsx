export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
      <div className="min-w-0">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">{subtitle}</p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2 shrink-0">{children}</div> : null}
    </div>
  );
}
