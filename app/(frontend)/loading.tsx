/**
 * Loading
 */
export default function Loading(): React.JSX.Element {
  // La barra de progreso superior maneja el feedback visual.
  // Este loader solo se muestra en casos de SSR muy lentos.
  return (
    <div className="min-h-screen bg-white">
      {/* Skeleton hero (light) */}
      <div className="bg-gradient-to-b from-white via-slate-50 to-white pt-24 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto h-9 w-56 animate-pulse rounded-full bg-slate-200" />
            <div className="mx-auto mt-6 h-16 w-full max-w-xl animate-pulse rounded-2xl bg-slate-200" />
            <div className="mx-auto mt-6 h-6 w-2/3 animate-pulse rounded-lg bg-slate-200" />
            <div className="mx-auto mt-8 h-14 w-full max-w-2xl animate-pulse rounded-2xl bg-slate-200" />
          </div>
          <div className="mx-auto mt-10 aspect-[21/9] sm:mt-14 w-full max-w-6xl animate-pulse rounded-3xl bg-slate-200" />
        </div>
      </div>

      {/* Skeleton grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              className="shadow-soft animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
              key={i}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="aspect-[16/10] bg-slate-200" />
              <div className="space-y-3 p-5">
                <div className="h-6 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
                <div className="h-px w-full bg-slate-100" />
                <div className="h-8 w-1/3 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
