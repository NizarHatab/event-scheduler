export function EventListSkeleton() {
  return (
    <ul className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <li
          key={i}
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 animate-pulse"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-600" />
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-700" />
              <div className="mt-2 h-4 w-1/3 rounded bg-slate-100 dark:bg-slate-700" />
            </div>
            <div className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-600" />
          </div>
          <div className="mt-3 flex gap-2 border-t border-[var(--card-border)] pt-3">
            <div className="h-8 w-16 rounded-lg bg-slate-100 dark:bg-slate-700" />
            <div className="h-8 w-14 rounded-lg bg-slate-100 dark:bg-slate-700" />
            <div className="h-8 w-16 rounded-lg bg-slate-100 dark:bg-slate-700" />
          </div>
        </li>
      ))}
    </ul>
  );
}
