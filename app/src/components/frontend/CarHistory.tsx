import {
  UserRoundCheck,
  KeyRound,
  IdCard,
  BookOpenCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { CarHistory as CarHistoryData } from "../../types/car";

interface CarHistoryProps {
  history: CarHistoryData;
}

const OWNER_LABELS: Record<NonNullable<CarHistoryData["ownerHistory"]>, string> = {
  single: "Único dueño",
  two: "2 dueños",
  multiple: "3 o más dueños",
};

interface HistoryRow {
  icon: LucideIcon;
  label: string;
  value: string;
}

function yesNo(value: boolean | undefined): string {
  return value ? "Sí" : "No";
}

export function CarHistory({ history }: CarHistoryProps) {
  const points = history.inspectionPoints ?? 150;

  const rows: HistoryRow[] = [
    {
      icon: UserRoundCheck,
      label: "Historial de dueños",
      value: history.ownerHistory ? OWNER_LABELS[history.ownerHistory] : "No disponible",
    },
    { icon: KeyRound, label: "Duplicado de llaves", value: yesNo(history.duplicateKeys) },
    { icon: IdCard, label: "Placas", value: yesNo(history.plates) },
    { icon: BookOpenCheck, label: "Manuales", value: yesNo(history.manuals) },
    { icon: Sparkles, label: "Acondicionamiento", value: yesNo(history.conditioning) },
  ];

  return (
    <section className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6 dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-8">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Historial del auto</h2>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Inspeccionado en más de <strong className="font-semibold text-zinc-900 dark:text-zinc-100">+{points} puntos</strong> y respaldado por la garantía de calidad Dalton.
      </p>

      <hr className="my-8 border-zinc-200 dark:border-zinc-800" />

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-800 dark:ring-zinc-700">
              <Icon className="h-5 w-5 text-red-500" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">{label}</div>
              <div className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
