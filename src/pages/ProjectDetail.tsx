import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsApi, clientsApi, invoicesApi } from '../api/client';
import StatusBadge, { PaidBadge } from '../components/StatusBadge';
import ErrorBanner from '../components/ErrorBanner';
import { SkeletonLine } from '../components/Skeleton';

function fmt(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</dt>
      <dd className="text-sm text-slate-900">{value ?? <span className="text-slate-400">—</span>}</dd>
    </div>
  );
}

export default function ProjectDetail() {
  const { uuid } = useParams<{ uuid: string }>();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['projects', uuid],
    queryFn: () => projectsApi.get(uuid!),
    enabled: !!uuid,
  });

  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: clientsApi.list });
  const { data: allInvoices } = useQuery({ queryKey: ['invoices'], queryFn: invoicesApi.list });

  const client = clients?.find(c => c.uuid === project?.client_ref);
  const projectInvoices = allInvoices?.filter(i => i.project_ref === uuid) ?? [];
  const unpaidTotal = projectInvoices.filter(i => !i.is_paid).reduce((s, i) => s + i.amount, 0);

  if (error) {
    return (
      <div>
        <Link to="/projects" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">← Back to Projects</Link>
        <ErrorBanner error={error} />
      </div>
    );
  }

  return (
    <div>
      <Link to="/projects" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">← Back to Projects</Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          {isLoading ? (
            <>
              <SkeletonLine className="h-8 w-64 mb-2" />
              <SkeletonLine className="h-4 w-40" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{project?.title}</h1>
                {project && <StatusBadge status={project.status} />}
              </div>
              {client && (
                <p className="text-sm text-slate-500">
                  Client:{' '}
                  <Link to={`/clients/${client.uuid}`} className="text-indigo-600 hover:underline font-medium">
                    {client.company_name}
                  </Link>
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-5">Project Details</h2>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonLine key={i} className="h-4 w-full" />)}
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Status" value={project?.status} />
              <Field label="Hourly Rate" value={project ? fmt(project.hourly_rate) + '/hr' : undefined} />
              <Field label="Start Date" value={project?.start_date} />
              <Field label="Client" value={client?.company_name} />
            </dl>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-5">Description</h2>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonLine key={i} className="h-4 w-full" />)}
            </div>
          ) : (
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
              {project?.description ?? <span className="text-slate-400">No description.</span>}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Invoices
            {projectInvoices.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{projectInvoices.length}</span>
            )}
          </h2>
          {unpaidTotal > 0 && (
            <span className="text-xs text-rose-600 font-medium">
              Outstanding: {fmt(unpaidTotal)}
            </span>
          )}
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice #</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Issued</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Due</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projectInvoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                  No invoices for this project.
                </td>
              </tr>
            ) : (
              projectInvoices.map(inv => (
                <tr key={inv.uuid} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{inv.invoice_number}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{inv.issued_date}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{inv.due_date ?? '—'}</td>
                  <td className="px-6 py-4"><PaidBadge isPaid={inv.is_paid} /></td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">{fmt(inv.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
