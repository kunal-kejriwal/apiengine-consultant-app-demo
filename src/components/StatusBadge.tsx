import type { ProjectStatus } from '../types';

const statusConfig: Record<ProjectStatus, { label: string; classes: string }> = {
  active: { label: 'Active', classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  completed: { label: 'Completed', classes: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
  on_hold: { label: 'On Hold', classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as ProjectStatus] ?? {
    label: status,
    classes: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
}

export function PaidBadge({ isPaid }: { isPaid?: boolean | null }) {
  return isPaid ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
      Paid
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 ring-1 ring-rose-200">
      Unpaid
    </span>
  );
}
