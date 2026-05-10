import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi, clientsApi } from '../api/client';
import type { ProjectStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import { SkeletonTable } from '../components/Skeleton';

function fmt(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

const FILTERS: { label: string; value: ProjectStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
];

export default function Projects() {
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');

  const { data: projects, isLoading: projLoading, error: projError } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsApi.list,
  });

  const clientMap = new Map(clients?.map(c => [c.uuid, c]) ?? []);

  const filtered = projects?.filter(p => filter === 'all' || p.status === filter) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">{projects ? `${projects.length} total` : 'Loading...'}</p>
        </div>
        <Link
          to="/projects/new"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Project
        </Link>
      </div>

      {projError && <ErrorBanner error={projError} className="mb-6" />}

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center gap-1 px-6 py-4 border-b border-slate-200">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === f.value
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {f.label}
              {f.value !== 'all' && projects && (
                <span className="ml-1.5 text-xs opacity-70">
                  {projects.filter(p => p.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Project</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Start Date</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projLoading ? (
              <SkeletonTable rows={5} cols={5} />
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    title={filter !== 'all' ? `No ${filter} projects` : 'No projects yet'}
                    description={filter !== 'all' ? 'Try a different status filter.' : 'Create your first project to start tracking engagements.'}
                    actionLabel={filter === 'all' ? 'New Project' : undefined}
                    actionTo={filter === 'all' ? '/projects/new' : undefined}
                  />
                </td>
              </tr>
            ) : (
              filtered.map(p => {
                const client = clientMap.get(p.client_ref);
                return (
                  <tr key={p.uuid} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/projects/${p.uuid}`} className="text-sm font-medium text-slate-900 hover:text-indigo-600">
                        {p.title}
                      </Link>
                      {p.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-xs">{p.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client ? (
                        <Link to={`/clients/${p.client_ref}`} className="text-sm text-slate-600 hover:text-indigo-600">
                          {client.company_name}
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 text-sm text-slate-500">{p.start_date ?? '—'}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">{fmt(p.hourly_rate)}/hr</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
