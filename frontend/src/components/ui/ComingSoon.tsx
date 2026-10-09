export function ComingSoon({ title, body, icon = "🚧" }: { title: string; body?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-line p-5">
      <span className="text-4xl">{icon}</span>
      <div className="flex-1">
        <p className="flex flex-wrap items-center gap-2 font-extrabold">
          {title}
          <span className="rounded-md bg-sel px-2 py-0.5 text-xs uppercase tracking-wide text-macaw">Coming soon</span>
        </p>
        {body && <p className="mt-1 text-sm font-semibold text-muted">{body}</p>}
      </div>
    </div>
  );
}
