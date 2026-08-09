import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-50">404</h1>
        <p className="mt-4 text-xl text-zinc-600 dark:text-zinc-400">
          Auto no encontrado
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}
