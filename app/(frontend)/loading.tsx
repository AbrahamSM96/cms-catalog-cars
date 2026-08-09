export default function Loading() {
  // La barra de progreso superior maneja el feedback visual
  // Este loader solo se muestra en casos de SSR muy lentos
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white dark:from-black dark:via-slate-950 dark:to-black">
      {/* Skeleton Hero */}
      <div className="min-h-[85vh] animate-pulse bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-8 h-10 w-48 rounded-full bg-white/5"></div>
            <div className="mx-auto h-16 w-96 rounded-lg bg-white/5"></div>
            <div className="mx-auto mt-6 h-6 w-2/3 rounded-lg bg-white/5"></div>
            <div className="mt-10 flex justify-center gap-4">
              <div className="h-12 w-40 rounded-xl bg-white/5"></div>
              <div className="h-12 w-32 rounded-xl bg-white/5"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton Content */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex justify-center">
          <div className="h-14 w-full max-w-2xl animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-900"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800"></div>
              <div className="p-5 space-y-3">
                <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800"></div>
                <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800"></div>
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
                <div className="h-8 w-1/3 rounded bg-slate-200 dark:bg-slate-800"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
