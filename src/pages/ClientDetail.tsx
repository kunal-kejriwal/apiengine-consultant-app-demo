import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clientsApi, projectsApi } from '../api/client';
import StatusBadge from '../components/StatusBadge';
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

export default function ClientDetail() {
  const { uuid } = useParams<{ uuid: string }>();

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['clients', uuid],
    queryFn: () => clientsApi.get(uuid!),
    enabled: !!uuid,
  });

  const { data: allProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const clientProjects = allProjects?.filter(p => p.client_ref === uuid) ?? [];

  if (error) {
    return (
      <div>
        <Link to="/clients" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">← Back to Clients</Link>
        <ErrorBanner error={error} />
      </div>
    );
  }

  return (
    <div>
      <Link to="/clients" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">← Back to Clients</Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          {isLoading ? (
            <>
              <SkeletonLine className="h-8 w-64 mb-2" />
              <SkeletonLine className="h-4 w-32" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900">{client?.company_name}</h1>
              <p className="text-sm text-slate-500 mt-1">{client?.industry ?? 'No industry set'}</p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-5">Contact Details</h2>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonLine key={i} className="h-4 w-full" />)}
            </div>
          ) : (
            <dl className="grid grid-cols-1 gap-4">
              <Field label="Email" value={client?.contact_email} />
              <Field label="Phone" value={client?.phone} />
              <Field label="Website" value={client?.website} />
              <Field label="Industry" value={client?.industry} />
            </dl>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-5">Notes</h2>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonLine key={i} className="h-4 w-full" />)}
            </div>
          ) : (
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
              {client?.notes ?? <span className="text-slate-400">No notes.</span>}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Projects
            {clientProjects.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{clientProjects.length}</span>
            )}
          </h2>
          <Link to="/projects/new" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            + New Project
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Start Date</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clientProjects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">
                  No projects for this client yet.
                </td>
              </tr>
            ) : (
              clientProjects.map(p => (
                <tr key={p.uuid} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/projects/${p.uuid}`} className="text-sm font-medium text-slate-900 hover:text-indigo-600">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-6 py-4 text-sm text-slate-500">{p.start_date ?? '—'}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">{fmt(p.hourly_rate)}/hr</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
