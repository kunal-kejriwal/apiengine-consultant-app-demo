import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { clientsApi } from '../api/client';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import { SkeletonTable } from '../components/Skeleton';

export default function Clients() {
  const [search, setSearch] = useState('');
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsApi.list,
  });

  const filtered = clients?.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry ?? '').toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-sm text-slate-500 mt-0.5">{clients ? `${clients.length} total` : 'Loading...'}</p>
        </div>
        <Link
          to="/clients/new"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Add Client
        </Link>
      </div>

      {error && <ErrorBanner error={error} className="mb-6" />}

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or industry…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Industry</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <SkeletonTable rows={4} cols={4} />
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState
                    title={search ? 'No clients match your search' : 'No clients yet'}
                    description={search ? 'Try a different search term.' : 'Add your first client to get started.'}
                    actionLabel={!search ? 'Add Client' : undefined}
                    actionTo={!search ? '/clients/new' : undefined}
                  />
                </td>
              </tr>
            ) : (
              filtered.map(c => (
                <tr
                  key={c.uuid}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <Link to={`/clients/${c.uuid}`} className="text-sm font-medium text-slate-900 hover:text-indigo-600">
                      {c.company_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{c.industry ?? '—'}</td>
                  <td className="px-6 py-4">
                    <a href={`mailto:${c.contact_email}`} className="text-sm text-slate-600 hover:text-indigo-600">
                      {c.contact_email}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{c.phone ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
