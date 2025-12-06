export default function GroupSettingsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
      <div className="space-y-3">
        <div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-10 w-1/2 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-4 w-2/3 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
      <section className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-pulse"
          />
        ))}
      </section>
    </main>
  );
}
