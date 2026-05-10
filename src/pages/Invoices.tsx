import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { invoicesApi, projectsApi } from '../api/client';
import { PaidBadge } from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import { SkeletonTable } from '../components/Skeleton';

function fmt(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

type Filter = 'all' | 'paid' | 'unpaid';
type SortKey = 'amount' | 'issued_date';
type SortDir = 'asc' | 'desc';

function SortButton({ label, sortKey, current, dir, onSort }: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 group text-xs font-medium text-slate-500 uppercase tracking-wider hover:text-slate-900 transition-colors"
    >
      {label}
      <span className={`transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
        {active && dir === 'desc' ? '↓' : '↑'}
      </span>
    </button>
  );
}

export default function Invoices() {
  const [filter, setFilter] = useState<Filter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('issued_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoicesApi.list,
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const projectMap = new Map(projects?.map(p => [p.uuid, p]) ?? []);

  const paid = invoices?.filter(i => i.is_paid) ?? [];
  const unpaid = invoices?.filter(i => !i.is_paid) ?? [];
  const unpaidTotal = unpaid.reduce((s, i) => s + i.amount, 0);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('desc'); }
  }

  const filtered = useMemo(() => {
    const base =
      filter === 'paid' ? paid :
      filter === 'unpaid' ? unpaid :
      invoices ?? [];

    return [...base].sort((a, b) => {
      const av = sortKey === 'amount' ? a.amount : a.issued_date;
      const bv = sortKey === 'amount' ? b.amount : b.issued_date;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [invoices, filter, sortKey, sortDir, paid, unpaid]);

  const TABS: { label: string; value: Filter; count?: number }[] = [
    { label: 'All', value: 'all', count: invoices?.length },
    { label: 'Paid', value: 'paid', count: paid.length },
    { label: 'Unpaid', value: 'unpaid', count: unpaid.length },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          {unpaidTotal > 0 && (
            <p className="text-sm text-rose-600 font-medium mt-0.5">
              {fmt(unpaidTotal)} outstanding across {unpaid.length} invoice{unpaid.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {error && <ErrorBanner error={error} className="mb-6" />}

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center gap-1 px-6 py-4 border-b border-slate-200">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                filter === t.value
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="text-xs opacity-70">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice #</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Project</th>
              <th className="text-left px-6 py-3">
                <SortButton label="Issued" sortKey="issued_date" current={sortKey} dir={sortDir} onSort={toggleSort} />
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Due</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-3">
                <SortButton label="Amount" sortKey="amount" current={sortKey} dir={sortDir} onSort={toggleSort} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <SkeletonTable rows={8} cols={6} />
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title={filter !== 'all' ? `No ${filter} invoices` : 'No invoices yet'}
                    description="Invoices are created per project."
                  />
                </td>
              </tr>
            ) : (
              filtered.map(inv => {
                const project = projectMap.get(inv.project_ref);
                const isOverdue = !inv.is_paid && inv.due_date && inv.due_date < '2026-05-10';
                return (
                  <tr key={inv.uuid} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-slate-900">{inv.invoice_number}</td>
                    <td className="px-6 py-4">
                      {project ? (
                        <Link to={`/projects/${project.uuid}`} className="text-sm text-slate-600 hover:text-indigo-600">
                          {project.title}
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{inv.issued_date}</td>
                    <td className="px-6 py-4">
                      {inv.due_date ? (
                        <span className={`text-sm ${isOverdue ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>
                          {inv.due_date}
                          {isOverdue && ' ⚠'}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><PaidBadge isPaid={inv.is_paid} /></td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">{fmt(inv.amount)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td colSpan={5} className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total ({filtered.length} invoice{filtered.length !== 1 ? 's' : ''})
                </td>
                <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">
                  {fmt(filtered.reduce((s, i) => s + i.amount, 0))}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
