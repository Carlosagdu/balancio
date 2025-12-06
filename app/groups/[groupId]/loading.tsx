export default function GroupPageLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
      <section className="space-y-4">
        <div className="h-6 w-32 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="space-y-3">
          <div className="h-10 w-3/5 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-2/5 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      </section>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="h-5 w-1/3 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="mt-3 h-8 w-1/2 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-64 rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-pulse" />
        ))}
      </section>
    </main>
  );
}
