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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900">Historial del auto</h2>
      <p className="mt-3 text-slate-600">
        Inspeccionado en más de{" "}
        <strong className="font-semibold text-slate-900">+{points} puntos</strong> y respaldado por
        nuestra garantía de calidad.
      </p>

      <hr className="my-8 border-slate-200" />

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100">
              <Icon className="h-5 w-5 text-red-600" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-slate-500">{label}</div>
              <div className="truncate text-lg font-semibold text-slate-900">{value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
