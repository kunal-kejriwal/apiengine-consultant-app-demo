import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { clientsApi, projectsApi, invoicesApi } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import ErrorBanner from '../components/ErrorBanner';
import { SkeletonCard, SkeletonTable } from '../components/Skeleton';

function fmt(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl border p-6 ${accent ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200'}`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-bold ${accent ? 'text-indigo-700' : 'text-slate-900'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const clients = useQuery({ queryKey: ['clients'], queryFn: clientsApi.list });
  const projects = useQuery({ queryKey: ['projects'], queryFn: projectsApi.list });
  const invoices = useQuery({ queryKey: ['invoices'], queryFn: invoicesApi.list });

  const isLoading = clients.isLoading || projects.isLoading || invoices.isLoading;
  const error = clients.error ?? projects.error ?? invoices.error;

  const activeProjects = projects.data?.filter(p => p.status === 'active') ?? [];
  const unpaidInvoices = invoices.data?.filter(i => !i.is_paid) ?? [];
  const unpaidTotal = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0);

  const recentProjects = projects.data
    ? [...projects.data].sort((a, b) => (b.start_date ?? '').localeCompare(a.start_date ?? '')).slice(0, 5)
    : [];

  const clientMap = new Map(clients.data?.map(c => [c.uuid, c]) ?? []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Overview of your freelance business</p>
        </div>
        <div className="flex gap-3">
          <Link to="/clients/new" className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            + New Client
          </Link>
          <Link to="/projects/new" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            + New Project
          </Link>
        </div>
      </div>

      {error && <ErrorBanner error={error} className="mb-6" />}

      <div className="grid grid-cols-4 gap-5 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Clients" value={clients.data?.length ?? 0} />
            <StatCard label="Active Projects" value={activeProjects.length} />
            <StatCard label="Unpaid Invoices" value={unpaidInvoices.length} />
            <StatCard label="Outstanding" value={fmt(unpaidTotal)} accent />
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Recent Projects</h2>
          <Link to="/projects" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            View all →
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Project</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <SkeletonTable rows={5} cols={4} />
            ) : recentProjects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">
                  No projects yet.{' '}
                  <Link to="/projects/new" className="text-indigo-600 hover:underline">
                    Create your first project
                  </Link>
                </td>
              </tr>
            ) : (
              recentProjects.map(p => (
                <tr key={p.uuid} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/projects/${p.uuid}`} className="text-sm font-medium text-slate-900 hover:text-indigo-600">
                      {p.title}
                    </Link>
                    {p.start_date && (
                      <p className="text-xs text-slate-400 mt-0.5">Started {p.start_date}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {clientMap.has(p.client_ref) ? (
                      <Link to={`/clients/${p.client_ref}`} className="text-sm text-slate-600 hover:text-indigo-600">
                        {clientMap.get(p.client_ref)!.company_name}
                      </Link>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-700 font-medium">
                    {fmt(p.hourly_rate)}/hr
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
